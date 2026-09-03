/**
 * DC template → JSX transpiler.
 * Grammar handled: <sc-if value="{{expr}}">, <sc-for list="{{expr}}" as="x">,
 * {{path}} holes in text and attributes, sc-camel-on-* event attrs,
 * class→className, style strings → sty(`...`), SVG dash-attrs → camelCase,
 * void elements, comments stripped, hint-* attrs stripped.
 */
const fs = require('fs');

const SRC = process.argv[2];
const OUT = process.argv[3];
const tpl = fs.readFileSync(SRC, 'utf8');

// ---------- tokenize into tags & text ----------
const tokens = [];
let i = 0;
while (i < tpl.length) {
  if (tpl.startsWith('<!--', i)) { const e = tpl.indexOf('-->', i); i = e < 0 ? tpl.length : e + 3; continue; }
  if (tpl[i] === '<') {
    const e = tpl.indexOf('>', i);
    if (e < 0) break;
    tokens.push({ t: 'tag', s: tpl.slice(i, e + 1) });
    i = e + 1;
  } else {
    const e = tpl.indexOf('<', i);
    const text = tpl.slice(i, e < 0 ? tpl.length : e);
    if (text.trim()) tokens.push({ t: 'text', s: text });
    i = e < 0 ? tpl.length : e;
  }
}

// ---------- parse into tree ----------
const VOID = new Set(['br', 'img', 'input', 'hr', 'meta', 'link']);
function parseTag(s) {
  const close = /^<\/([a-zA-Z0-9-]+)>$/.exec(s);
  if (close) return { kind: 'close', name: close[1] };
  const m = /^<([a-zA-Z0-9-]+)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>$/.exec(s.replace(/\n/g, ' '));
  if (!m) throw new Error('unparseable tag: ' + s.slice(0, 120));
  const attrs = [];
  const re = /([^\s=]+)(?:="([^"]*)")?/g;
  let a;
  while ((a = re.exec(m[2]))) attrs.push([a[1], a[2] === undefined ? '' : a[2]]);
  const self = m[3] === '/' || VOID.has(m[1].toLowerCase());
  return { kind: 'open', name: m[1], attrs, self };
}

function parse(pos, endName) {
  const kids = [];
  while (pos < tokens.length) {
    const tk = tokens[pos];
    if (tk.t === 'text') { kids.push({ type: 'text', text: tk.s }); pos++; continue; }
    const info = parseTag(tk.s);
    if (info.kind === 'close') {
      if (info.name === endName) return [kids, pos + 1];
      throw new Error(`mismatched </${info.name}> expecting </${endName}>`);
    }
    if (info.self) { kids.push({ type: 'el', name: info.name, attrs: info.attrs, kids: [] }); pos++; continue; }
    const [children, next] = parse(pos + 1, info.name);
    kids.push({ type: 'el', name: info.name, attrs: info.attrs, kids: children });
    pos = next;
  }
  return [kids, pos];
}
const [tree] = parse(0, null);

// ---------- emit JSX ----------
const SVG_TAGS = new Set(['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'ellipse', 'text']);
const ATTR_MAP = { class: 'className', for: 'htmlFor', autofocus: 'autoFocus', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', srcset: 'srcSet', defaultvalue: 'defaultValue', defaultchecked: 'defaultChecked' };
// any sc-camel-foo-bar attr → fooBar (onClick, defaultValue, viewBox, autoComplete, …)
function scCamel(k) { return k.slice('sc-camel-'.length).replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }

// resolve a hole path to a JS expression given loop scope vars
function holeExpr(path, scope) {
  path = path.trim();
  const root = path.split(/[.[]/)[0];
  if (scope.has(root)) return path;
  return 'v.' + path;
}

function textToJsx(text, scope) {
  // split on {{...}}
  const parts = [];
  let rest = text;
  const re = /\{\{\s*([^}]+?)\s*\}\}/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    const before = text.slice(last, m.index);
    if (before) parts.push(JSON.stringify(before).slice(1, -1));
    parts.push('${' + holeExpr(m[1], scope) + '}');
    last = m.index + m[0].length;
  }
  const after = text.slice(last);
  if (after) parts.push(JSON.stringify(after).slice(1, -1));
  const joined = parts.join('');
  if (!joined.includes('${')) {
    // plain text — emit raw (trim pure-whitespace runs to single space)
    return joined;
  }
  // a single hole with no surrounding text → emit directly so React elements render
  if (parts.length === 1 && parts[0].startsWith('${')) {
    return '{' + parts[0].slice(2, -1) + '}';
  }
  // text mixed with holes but only whitespace around a single hole → direct too
  const holeOnly = parts.filter(p => p.startsWith('${'));
  const textParts = parts.filter(p => !p.startsWith('${'));
  if (holeOnly.length === 1 && textParts.every(tp => tp.trim() === '')) {
    return '{' + holeOnly[0].slice(2, -1) + '}';
  }
  return '{`' + joined + '`}';
}

function attrValue(val, scope, opts = {}) {
  const holes = [...val.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)];
  if (holes.length === 0) return { expr: JSON.stringify(val), static: true };
  if (holes.length === 1 && val.trim() === holes[0][0]) {
    return { expr: holeExpr(holes[0][1], scope), static: false };
  }
  // mixed → template literal
  let out = '', last = 0;
  for (const h of holes) {
    out += val.slice(last, h.index).replace(/`/g, '\\`');
    out += '${' + holeExpr(h[1], scope) + '}';
    last = h.index + h[0].length;
  }
  out += val.slice(last).replace(/`/g, '\\`');
  return { expr: '`' + out + '`', static: false };
}

let uid = 0;
function emit(node, scope, indent) {
  const pad = '  '.repeat(indent);
  if (node.type === 'text') {
    const j = textToJsx(node.text.replace(/\s+/g, ' '), scope);
    return j.trim() ? pad + j : '';
  }
  const { name, attrs, kids } = node;

  if (name === 'sc-if') {
    const val = attrs.find(a => a[0] === 'value');
    const cond = holeExpr(val[1].replace(/\{\{|\}\}/g, ''), scope);
    const inner = kids.map(k => emit(k, scope, indent + 1)).filter(Boolean).join('\n');
    return `${pad}{${cond} && (<>\n${inner}\n${pad}</>)}`;
  }
  if (name === 'sc-for') {
    const list = holeExpr(attrs.find(a => a[0] === 'list')[1].replace(/\{\{|\}\}/g, ''), scope);
    const asName = attrs.find(a => a[0] === 'as')[1];
    const s2 = new Set(scope); s2.add(asName);
    const idx = '_i' + (uid++);
    const inner = kids.map(k => emit(k, s2, indent + 1)).filter(Boolean).join('\n');
    return `${pad}{(${list} || []).map((${asName}, ${idx}) => (<React.Fragment key={${idx}}>\n${inner}\n${pad}</React.Fragment>))}`;
  }
  if (name === 'template' || name === 'helmet') return ''; // skip bundler thumbnail / helmet

  let tagName = name === 'sc-raw-select' ? 'select' : name;

  // <select>: convert option selected-flags to value/defaultValue on the select
  let selectValueAttr = '';
  if (tagName === 'select') {
    const forChild = kids.find(k => k.type === 'el' && k.name === 'sc-for');
    const optionsWithSel = forChild && forChild.kids.some(k => k.type === 'el' && k.name === 'option' && k.attrs.some(a => a[0] === 'selected'));
    if (optionsWithSel) {
      const listExpr = holeExpr(forChild.attrs.find(a => a[0] === 'list')[1].replace(/\{\{|\}\}/g, ''), scope);
      const hasOnChange = attrs.some(a => a[0] === 'sc-camel-on-change');
      const hasDefault = attrs.some(a => a[0] === 'sc-camel-default-value' || a[0].toLowerCase() === 'defaultvalue');
      const pick = `((${listExpr} || []).find(_o => _o.sel) || {}).v ?? ''`;
      if (hasOnChange) selectValueAttr = `value={${pick}}`;
      else if (!hasDefault) selectValueAttr = `defaultValue={${pick}}`;
      // strip selected from the option children
      for (const k of forChild.kids) if (k.type === 'el' && k.name === 'option') k.attrs = k.attrs.filter(a => a[0] !== 'selected');
    }
  }

  const isSvg = SVG_TAGS.has(name);
  const attrOut = [];
  if (selectValueAttr) attrOut.push(selectValueAttr);
  for (const [rawK, rawV] of attrs) {
    let k = rawK;
    if (k.startsWith('hint-') || k === 'data-screen-label') { if (k === 'data-screen-label') attrOut.push(`data-screen-label=${JSON.stringify(rawV)}`); continue; }
    if (k.startsWith('sc-camel-')) k = scCamel(k);
    else if (ATTR_MAP[k.toLowerCase()]) k = ATTR_MAP[k.toLowerCase()];
    else if (isSvg && k.includes('-') && !k.startsWith('data-') && !k.startsWith('aria-')) k = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

    if (k === 'style') {
      const { expr, static: st } = attrValue(rawV, scope);
      attrOut.push(`style={sty(${st ? expr : expr})}`);
      continue;
    }
    if (rawV === '' && !rawK.includes('=')) { attrOut.push(`${k}=""`); continue; }
    const { expr, static: st } = attrValue(rawV, scope);
    if (st) attrOut.push(`${k}=${expr}`);
    else attrOut.push(`${k}={${expr}}`);
  }
  const open = `<${tagName}${attrOut.length ? ' ' + attrOut.join(' ') : ''}`;
  if (!kids.length) return `${pad}${open}${VOID.has(name) ? " />" : `></${tagName}>`}`;
  const inner = kids.map(k => emit(k, scope, indent + 1)).filter(Boolean).join('\n');
  return `${pad}${open}>\n${inner}\n${pad}</${tagName}>`;
}

const body = tree.map(n => emit(n, new Set(), 3)).filter(Boolean).join('\n');
const out = `  render() {\n    const v = this.renderVals();\n    const t = v.t;\n    return (\n      <>\n${body}\n      </>\n    );\n  }\n`;
fs.writeFileSync(OUT, out);
console.log('emitted', out.length, 'bytes,', out.split('\n').length, 'lines');
