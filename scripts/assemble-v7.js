// assemble-v7.js — builds src/components/DashboardAppV7.jsx for the IT build.
// Input: v7.design.logic.js (verbatim design logic), v7.render.jsx (transpiled template).
// Output: a React component with ZERO built-in content: every event, team, member,
// task and timeline entry comes from the /api/bootstrap payload; every change is
// sent through props.sync(key, doc) and translated into database rows server-side.
const fs = require('fs');
const SP = __dirname;
const OUT = process.argv[2];

// Inputs: scripts/design.logic.js + scripts/design.template.html (the extracted design export).
// The template is transpiled to JSX on the fly with transpile.js.
const logicPath = fs.existsSync(SP + '/v7.design.logic.js') ? SP + '/v7.design.logic.js' : SP + '/design.logic.js';
let logic = fs.readFileSync(logicPath, 'utf8');
let renderPath = SP + '/v7.render.jsx';
if (!fs.existsSync(renderPath)) {
  renderPath = SP + '/.design.render.jsx';
  require('child_process').execFileSync(process.execPath, [SP + '/transpile.js', SP + '/design.template.html', renderPath], { stdio: 'inherit' });
}
let render = fs.readFileSync(renderPath, 'utf8');
let n = 0;
function rep(hay, find, replace, label, { all = false } = {}) {
  const c = hay.split(find).length - 1;
  if (all ? c < 1 : c !== 1) throw new Error(`anchor "${label}" found ${c}x`);
  n++;
  return all ? hay.split(find).join(replace) : hay.replace(find, replace);
}
// remove a class-field literal:  "  NAME = [ ... \n  ];"  or "{ ... \n  };" or "() => [ ... \n  ];"
function dropField(name) {
  const start = logic.indexOf(`\n  ${name} = `);
  if (start < 0) throw new Error(`field ${name} not found`);
  // the literal ends at the first line that is exactly two spaces + closing brackets + ";"
  const endRe = /\n  [\]}][\]} ]*;[ \t]*(?=\n)/g;
  endRe.lastIndex = start + 1;
  const m = endRe.exec(logic);
  if (!m) throw new Error(`end of field ${name} not found`);
  const block = logic.slice(start, m.index + m[0].length);
  const methods = block.match(/\n  [a-zA-Z_]\w* = /g) || [];
  if (methods.length !== 1) throw new Error(`refusing to drop ${name}: block also contains ${methods.slice(1).join(',').trim()}`);
  logic = logic.slice(0, start) + logic.slice(m.index + m[0].length);
  n++;
}

// ---------------------------------------------------------------- logic ----
logic = rep(logic, 'class Component extends DCLogic {', 'class DashboardAppV7 extends React.Component {', 'class-head');

// 1) hydration from the server payload instead of localStorage
const mountStart = logic.indexOf('    let edits = {}, members = null, photos = {}, order = null;');
const mountEnd = logic.indexOf('    this.applyHash();', mountStart);
if (mountStart < 0 || mountEnd < 0) throw new Error('mount block not found');
logic = logic.slice(0, mountStart) + '    this.setState({ ...this.docsToState(), taskDrafts: [] });\n' + logic.slice(mountEnd);
n++;

logic = rep(logic, '  applyHash() {', `  componentDidUpdate(prev) { if (prev.data !== this.props.data) this.setState(this.docsToState()); }
  // Everything the dashboard shows comes from props.data (the /api/bootstrap payload).
  get _db() { return (this.props && this.props.data) || {}; }
  get EVENTS() { return this._db.events || []; }
  deptsFor(ev) { return (ev && this._db.depts && this._db.depts[ev]) || []; }
  allDepts() { const d = this._db.depts || {}; return Object.keys(d).reduce((a, k) => a.concat(d[k] || []), []); }
  metaAll() { return this._db.meta || {}; }
  timelineFor(ev) { return (ev && this._db.timeline && this._db.timeline[ev]) || []; }
  // Legacy workstream view derived from the active event's teams (no hardcoded content).
  get WS() {
    const P = (v) => Array.isArray(v) ? v : [v || '', v || ''];
    return this.deptsFor(this.state.event).map(d => { const m = this.metaAll()[d.id] || {};
      return { n: P(d.n), s: d.s || 'a', p: m.p || 0, o: P(d.lead && d.lead.n), dep: P(d.dep && d.dep.n), u: d.u || '', a: (d.upd && d.upd[0]) || ['', ''], b: ['', ''], x: (d.next && d.next.action) || ['', ''], ms: ['', ''], ap: (d.appr && d.appr.item) || ['', ''], resp: P(d.lead && d.lead.n), r: ['', ''], c: ['', ''], k: 'g' }; });
  }
  get RISKS() { return []; }
  get DECISIONS() { return []; }
  get MILESTONES() { return []; }
  get ATTENTION() { return []; }
  get OPS_UPDATES() { return []; }
  get STREAM_LEADS() { return []; }
  get SEED_TEAMS() { return {}; }
  _leadStreams() { return (this.props.me && this.props.me.teamIds) || []; }
  myStreamFor(ev) { const ids = this.deptsFor(ev).map(d => d.id); const pref = (this.state.myStreams || {})[ev]; if (pref && ids.indexOf(pref) !== -1) return pref; return ids[0] || null; }
  docsToState() {
    const db = this._db; const docs = db.docs || {}; const me = this.props.me || {};
    const role = me.role || 'inputter';
    const g = (k, d) => (docs[k] === undefined || docs[k] === null) ? d : docs[k];
    const deptMembers = { ...this.seedDeptMembers(), ...g('wef_deptmembers', {}) };
    const empDir = g('wef_empdir', []);
    return {
      edits: g('wef_edits', {}), members: g('wef_members', null) || this.seedMembers(), photos: g('wef_photos', {}), order: g('wef_order', null),
      deptEdits: g('wef_deptedits', {}), deptMembers, customEvents: g('wef_custom_events', []), eventEdits: g('wef_event_edits', {}), eventDeleted: g('wef_event_deleted', []), eventTeams: g('wef_event_teams', {}),
      empDir: Array.isArray(empDir) ? empDir : [], wfNom: g('wef_wfnom', {}), fbOpen: g('wef_fbopen', {}), feedback: g('wef_feedback', {}), hotelAssign: g('wef_hotel', {}),
      role, admin: role === 'admin', myStreams: (() => { try { return JSON.parse(localStorage.getItem('wef_mystream') || '{}') || {}; } catch (e) { return {}; } })(), leadId: 'me',
      approvals: g('wef_approvals', {}), design: g('wef_design', {}), tasks: g('wef_tasks', {}), teamlog: g('wef_teamlog', {}), taskOv: g('wef_taskov', {}), taskDel: g('wef_taskdel', {}), baseHide: g('wef_basehide', {}), tlEdits: g('wef_tledits', {}),
      users: db.users || [], authed: true
    };
  }
  applyHash() {`, 'v7-helpers');

// 2) persistence goes to the server (localStorage is only a same-device cache)
logic = rep(logic,
  'persist(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }',
  `persist(key, val) {
    // Display preferences stay on the device; everything else goes to the server only.
    if (key === 'wef_lang') { try { localStorage.setItem('wef_lang', JSON.stringify(val)); } catch (e) {} return; }
    if (key === 'wef_mystream') { try { localStorage.setItem('wef_mystream', JSON.stringify(val)); } catch (e) {} return; }
    if (LOCAL_KEYS.has(key) || !this.props.sync) return;
    this.props.sync(key, val).then(() => { if (this.state.syncError) this.setState({ syncError: null }); })
      .catch(err => this.setState({ syncError: (err && err.message) || String(err) }));
  }`, 'persist');

// 3) drop every hardcoded content block
['EVENTS', 'WS', 'RISKS', 'DECISIONS', 'MILESTONES', 'ATTENTION', 'DEPTS', 'AGM_DEPTS', 'SEED_TEAMS', 'STREAM_LEADS', 'OPS_UPDATES', 'DEPT_META', 'AGM_META', 'EVENT', 'AGM_EVENT', 'seedUsers'].forEach(dropField);

// 4) generic lookups instead of wef/agm switches
logic = rep(logic, "    const ACTIVE_DEPTS = st.event === 'agm' ? this.AGM_DEPTS : (st.event === 'wef' ? this.DEPTS : []);", '    const ACTIVE_DEPTS = this.deptsFor(st.event);', 'active-depts');
logic = rep(logic, '    const ALL_DEPTS = [...this.DEPTS, ...this.AGM_DEPTS];', '    const ALL_DEPTS = this.allDepts();', 'all-depts');
logic = rep(logic, '    const META = { ...this.DEPT_META, ...this.AGM_META };', '    const META = this.metaAll();', 'meta');
logic = rep(logic, "    const ACTIVE_EVENT = st.event === 'agm' ? this.AGM_EVENT : (st.event === 'wef' ? this.EVENT : []);", '    const ACTIVE_EVENT = this.timelineFor(st.event);', 'active-event');
logic = rep(logic, 'ACTIVE_EVENT[Number(parts[0])] || this.EVENT[Number(parts[0])]', 'ACTIVE_EVENT[Number(parts[0])]', 'agenda-fallback');
logic = rep(logic, '    const META0 = { ...this.DEPT_META, ...this.AGM_META };', '    const META0 = this.metaAll();', 'meta0');
logic = rep(logic, "(this.state.event === 'agm' ? this.AGM_DEPTS : this.DEPTS)", 'this.deptsFor(this.state.event)', 'guide-depts');
logic = rep(logic, "(st.event === 'agm' ? this.AGM_DEPTS : this.DEPTS)", 'ACTIVE_DEPTS', 'streamline-opts');
logic = rep(logic, '[...this.DEPTS, ...this.AGM_DEPTS]', 'this.allDepts()', 'all-depts-spread', { all: true });
logic = rep(logic, "    const isWef = st.event === 'wef';\n    const blankEvent = !!st.event && st.event !== 'wef';\n    const hasRich = isWef || st.event === 'agm';",
  '    const isWef = false;\n    const hasRich = ACTIVE_DEPTS.length > 0;\n    const blankEvent = !!st.event && !hasRich;', 'rich-switch');
logic = rep(logic, "    if (st.event === 'agm' && depts.length) {", '    if (depts.length) {', 'overview-derived');
logic = rep(logic, "genOverview: st.event === 'agm' && !!ovw,", 'genOverview: !!ovw,', 'gen-overview');
logic = rep(logic, "    const _designTeams = (st.event === 'agm') ? ['agm-2'] : ['d2', 'd3'];", '    const _designTeams = ACTIVE_DEPTS.map(d => d.id);', 'design-teams');
// admins can always add / import teams (server creates real Team rows)
logic = rep(logic, 'blankAdmin: blankEvent && !hasRich && st.admin,', 'blankAdmin: !!st.admin,', 'add-team-always');

// 5) roles and streams come from the signed-in account
logic = rep(logic, "  canEditTeam(teamId) { const r = this.state.role || 'inputter'; if (r === 'admin') return true; if (r === 'inputter') return (this.state.myStreams || {})[this.state.event] === teamId; if (r === 'lead') return this._leadStreams().indexOf(teamId) !== -1; return false; }",
  "  canEditTeam(teamId) { const r = this.state.role || 'inputter'; if (r === 'admin') return true; if (r === 'inputter' || r === 'lead') return this._leadStreams().indexOf(teamId) !== -1; return false; }", 'can-edit-team');
// the design's own _leadStreams (demo lead picker) would shadow the account-based one above
logic = rep(logic, "  _leadStreams() { const L = this.STREAM_LEADS.find(x => x.id === (this.state.leadId || 'ali')); return L ? L.streams : []; }\n", '', 'drop-demo-leadstreams');
logic = rep(logic, '(st.myStreams || {})[st.event]', 'this.myStreamFor(st.event)', 'my-stream', { all: true });
logic = rep(logic, "      leadOpts: this.STREAM_LEADS.map(l => ({ v: l.id, t: l.n, sel: l.id === (st.leadId || 'ali') })),", '      leadOpts: [],', 'lead-opts');
logic = rep(logic, '  setRole = (r) => () => {\n    this.persist(\'wef_role\', r);', "  setRole = (r) => () => {\n    if (!(this.props && this.props.demoRoles)) return; // role is fixed by the account in the IT build", 'set-role-guard');
logic = rep(logic, '      roleTabs: [', '      roleTabs: !(this.props && this.props.demoRoles) ? [] : [', 'role-tabs');
logic = rep(logic, "  adminClick = () => { if (this.state.admin) this.setRole('inputter')(); else this.setState({ showLogin: true, loginErr: null }); };", '  adminClick = () => {};', 'admin-click');
logic = rep(logic, "  resetData = () => {\n    ['wef_edits', 'wef_photos', 'wef_order', 'wef_members', 'wef_deptedits', 'wef_deptmembers'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });\n    this.setState({ edits: {}, photos: {}, order: null, members: this.seedMembers(), deptEdits: {}, deptMembers: this.seedDeptMembers() });\n  };",
  '  resetData = () => { if (this.props.refresh) this.props.refresh(); };', 'reset-data');

// 6) sign-in is handled by Auth.js; the demo overlay never renders
logic = rep(logic, '      needLogin: !st.authed, doLogin: this.doLogin, doSignOut: this.doSignOut,\n      loginErr: !!st.loginErr,', '      needLogin: false, doLogin: () => {}, doSignOut: (this.props && this.props.onSignOut) || (() => {}), syncError: st.syncError || null,', 'no-demo-login');

// 7) Management Access talks to /api/users (emails + roles + teams, no passwords)
const mgmtOld = logic.slice(logic.indexOf('  mgmtUpdateUser = (id, patch) =>'), logic.indexOf('  seedDeptMembers = () =>'));
if (!mgmtOld) throw new Error('mgmt handlers not found');
logic = logic.replace(mgmtOld, `  _usersApi(p) { const api = this.props.users; if (!api) return Promise.reject(new Error('users API unavailable')); return p(api).then(() => this.props.refresh && this.props.refresh()).catch(err => this.setState({ syncError: (err && err.message) || String(err) })); }
  mgmtSetRole = (id) => (e) => { const v = e.target.value; this._usersApi(api => api.update(id, { role: v })); };
  mgmtSetStream = (id) => (e) => { const teamId = e.target.value || null; const ev = this.state.event; this._usersApi(api => api.update(id, { setTeamForEvent: { eventId: ev, teamId } })); };
  mgmtToggleActive = (id, active) => () => { this._usersApi(api => api.update(id, { active: !active })); };
  mgmtRemove = (id) => () => { if (!window.confirm(this.state.lang === 'ar' ? 'حذف هذا المستخدم؟' : 'Remove this user?')) return; this._usersApi(api => api.remove(id)); };
  mgmtAddUser = (e) => { e.preventDefault(); const f = new FormData(e.target); const email = String(f.get('email') || '').trim().toLowerCase(); const name = String(f.get('name') || '').trim(); const role = String(f.get('role') || 'inputter'); if (!email) return; const form = e.target; this._usersApi(api => api.create({ email, name, role }).then(() => form.reset())); };
`);
n++;
logic = rep(logic, "        const mgmtRows = users.map(u => { const isMe = !!meEmail && (u.email || '').toLowerCase() === meEmail; const canStream = !isMe && (u.role === 'lead' || u.role === 'inputter'); return {",
  "        const mgmtRows = users.map(u => { const isMe = !!meEmail && (u.email || '').toLowerCase() === meEmail; const canStream = !isMe && (u.role === 'lead' || u.role === 'inputter'); const evTeamIds = ACTIVE_DEPTS.map(d => d.id); const curTeam = (u.teamIds || []).find(id => evTeamIds.indexOf(id) !== -1) || ''; return {", 'mgmt-rows');
logic = rep(logic, "          streamOpts: [{ v: '', l: ar ? 'بدون مسار' : 'No streams assigned', sel: !u.stream }, ...streamNames.map(nm => ({ v: nm, l: nm, sel: nm === u.stream }))],",
  "          streamOpts: [{ v: '', l: ar ? 'بدون مسار' : 'No streams assigned', sel: !curTeam }, ...ACTIVE_DEPTS.map(d => ({ v: d.id, l: tx(d.n), sel: d.id === curTeam }))],\n          active: u.active !== false, activeL: u.active !== false ? (ar ? 'نشط' : 'Active') : (ar ? 'موقوف' : 'Disabled'), toggleActive: this.mgmtToggleActive(u.id, u.active !== false), remove: this.mgmtRemove(u.id),", 'mgmt-streams');
logic = rep(logic, "          pass: u.pass || '', genPass: this.mgmtGenPass(u.id), typePass: this.mgmtTypePass(u.id), setRole: this.mgmtSetRole(u.id), setStream: this.mgmtSetStream(u.id)",
  "          setRole: this.mgmtSetRole(u.id), setStream: this.mgmtSetStream(u.id)", 'mgmt-nopass');
logic = rep(logic, "        return { mgmtRows, mgmtCount: String(users.length), mgmtT: {",
  "        return { mgmtRows, mgmtCount: String(users.length), mgmtAdd: this.mgmtAddUser, mgmtRoleOpts: roleKeys.map(k => ({ v: k, l: roleL[k] })), mgmtT: {\n          addTitle: ar ? 'إضافة مستخدم' : 'Add user', emailPh: ar ? 'البريد الإلكتروني (حساب الوزارة)' : 'Email (ministry account)', namePh: ar ? 'الاسم' : 'Name', addBtn: ar ? 'إضافة' : 'Add', addHint: ar ? 'يسجل المستخدم الدخول عبر Microsoft SSO — لا حاجة لكلمة مرور.' : 'The user signs in with Microsoft SSO — no password needed.', status: ar ? 'الحالة' : 'Status', disable: ar ? 'إيقاف' : 'Disable', enable: ar ? 'تفعيل' : 'Enable', removeL: ar ? 'حذف' : 'Remove',", 'mgmt-labels');
logic = rep(logic, "          pass: ar ? 'كلمة المرور' : 'Password', passPh: ar ? 'كلمة مرور جديدة' : 'New password', gen: ar ? 'توليد' : 'Generate',", "          lastSeen: ar ? 'آخر دخول' : 'Last seen',", 'mgmt-labels-2');
logic = rep(logic, "          last: fmtLast(u.last), roleL: roleL[u.role] || u.role, roleCls: 'r-' + u.role,", "          last: fmtLast(u.lastSignInAt || u.last), roleL: roleL[u.role] || u.role, roleCls: 'r-' + u.role,", 'mgmt-last');
logic = rep(logic, "        const meEmail = (() => { try { return (sessionStorage.getItem('wef_auth_email') || '').toLowerCase(); } catch (e) { return ''; } })();", "        const meEmail = ((this.props.me && this.props.me.email) || '').toLowerCase();", 'mgmt-me');

// asset paths served by Next from /public
logic = logic.split("logo: 'assets/").join("logo: '/assets/");


// 8) timeline: admins can ADD days and sessions (the design only edited existing ones)
logic = rep(logic, "  toggleTlMode = () => this.setState({ tlMode: !this.state.tlMode, tlKey: null, tlDayKey: null });",
  "  toggleTlMode = () => this.setState({ tlMode: !this.state.tlMode, tlKey: null, tlDayKey: null });\n  addTlDay = () => { this.openTlDay(this.timelineFor(this.state.event).length)(); };\n  addTlBlock = (di) => (e) => { const d = this.timelineFor(this.state.event)[di] || {}; this.openTlBlock(di, (d.blocks || []).length)(e); };", 'tl-add-handlers');
logic = rep(logic, "if (st.tlDayKey != null) { const d = ACTIVE_EVENT[Number(st.tlDayKey)]; if (d) { const _do = _tlD[st.tlDayKey] || {}; tlDayModal = { date: _do.date != null ? _do.date : tx(d.date), day: _do.day != null ? _do.day : tx(d.day), tagline: _do.tagline != null ? _do.tagline : (d.tagline ? tx(d.tagline) : '') }; } }",
  "if (st.tlDayKey != null) { const d = ACTIVE_EVENT[Number(st.tlDayKey)] || { date: ['', ''], day: ['', ''], tagline: null }; { const _do = _tlD[st.tlDayKey] || {}; tlDayModal = { date: _do.date != null ? _do.date : tx(d.date), day: _do.day != null ? _do.day : tx(d.day), tagline: _do.tagline != null ? _do.tagline : (d.tagline ? tx(d.tagline) : '') }; } }", 'tl-day-modal-new');
logic = rep(logic, "const b = d && (d.blocks || [])[Number(p[1])]; if (b) {", "const b = (d && (d.blocks || [])[Number(p[1])]) || (d ? { time: '', t: ['', ''] } : null); if (b) {", 'tl-block-modal-new');
logic = rep(logic, "      editable: _adminTl, editDay: this.openTlDay(di),", "      editable: _adminTl, editDay: this.openTlDay(di), addBlock: this.addTlBlock(di),", 'tl-add-block-expose');
logic = rep(logic, "eventDays: hasRich ? eventDays : [], tlBlockModal, tlDayModal,", "eventDays: eventDays, tlModeOn: _adminTl, addTlDay: this.addTlDay, addDayL: ar ? '+ إضافة يوم' : '+ Add day', addSessionL: ar ? '+ إضافة جلسة' : '+ Add session', tlBlockModal, tlDayModal,", 'tl-add-expose');

// ---------------------------------------------------------------- render ---
render = rep(render, 'src="af83ecc7-017f-4f34-9878-0b3ab69dd8f0"', 'src="/assets/logo-moca-landing.png"', 'landing-logo');
render = rep(render, '4dfd8f0c-b841-4d5d-beae-4ddbddef226c', '/assets/tracker-bg.png', 'bg-image', { all: true });
render = rep(render, 'src="assets/logo-moca-login.png"', 'src="/assets/logo-moca-login.png"', 'login-logo');
// sync error banner at the top of the tree
render = rep(render, '    return (\n      <>\n', '    return (\n      <>\n        {v.syncError && (<div className="sync-banner" role="alert">{v.syncError}</div>)}\n', 'sync-banner');
// Management Access: add-user form + status column instead of passwords
render = rep(render, `                    <span className="mgmt-count">
                      {v.mgmtCount}
                    </span>
                  </div>`, `                    <span className="mgmt-count">
                      {v.mgmtCount}
                    </span>
                  </div>
                  <form className="mgmt-add mt16" onSubmit={v.mgmtAdd}>
                    <input className="inp" name="email" type="email" required="" placeholder={v.mgmtT.emailPh} autoComplete="off" />
                    <input className="inp" name="name" placeholder={v.mgmtT.namePh} autoComplete="off" />
                    <select className="sel inp" name="role" defaultValue="inputter">{(v.mgmtRoleOpts || []).map((o) => (<option key={o.v} value={o.v}>{o.l}</option>))}</select>
                    <button className="btn" type="submit">{v.mgmtT.addBtn}</button>
                    <div className="mgmt-e mgmt-add-hint">{v.mgmtT.addHint}</div>
                  </form>`, 'mgmt-add-form');
render = rep(render, `                      <div className="mgmt-h">
                        {v.mgmtT.pass}
                      </div>`, `                      <div className="mgmt-h">
                        {v.mgmtT.status}
                      </div>`, 'mgmt-head-status');
render = rep(render, `                            <div className="fx ac gap8">
                              <input className="inp mgmt-pass" placeholder={v.mgmtT.passPh} value={u.pass} onInput={u.typePass} autoComplete="off" />
                              <button className="btn btn-sm" type="button" onClick={u.genPass}>
                                {v.mgmtT.gen}
                              </button>
                            </div>`, `                            <div className="fx ac gap8">
                              <span className={\`mgmt-role \${u.active ? 'r-admin' : 'r-he'}\`}>{u.activeL}</span>
                              {u.notMe && (<button className="btn btn-sm ghost" type="button" onClick={u.toggleActive}>{u.active ? v.mgmtT.disable : v.mgmtT.enable}</button>)}
                              {u.notMe && (<button className="btn btn-sm btnred" type="button" onClick={u.remove}>{v.mgmtT.removeL}</button>)}
                            </div>`, 'mgmt-status-cell');


// timeline add buttons
render = rep(render, `                      <button className="btn ghost" onClick={v.toggleTlMode}>
                        {v.tlModeLabel}
                      </button>
                    </>)}`, `                      <button className="btn ghost" onClick={v.toggleTlMode}>
                        {v.tlModeLabel}
                      </button>
                      {v.tlModeOn && (<button className="btn" onClick={v.addTlDay}>{v.addDayL}</button>)}
                    </>)}`, 'tl-add-day-btn');
render = rep(render, `                            <button className="tl-editchip" onClick={d.editDay}>
                              {\`✎ \${v.t.editDayL}\`}
                            </button>`, `                            <button className="tl-editchip" onClick={d.editDay}>
                              {\`✎ \${v.t.editDayL}\`}
                            </button>
                            <button className="tl-editchip" onClick={d.addBlock}>{v.addSessionL}</button>`, 'tl-add-session-btn');
// ---------------------------------------------------------------- output ---
const preamble = `/* eslint-disable */
// DashboardAppV7 — the approved interface (Claude Design) as a React component for the
// IT build. The logic class is the design's, with every hardcoded data source removed:
// events, teams, members, tasks, timeline and users arrive in props.data (the
// /api/bootstrap payload, already filtered to the signed-in user's scope) and every
// change is sent through props.sync(key, document) where the server turns it into
// database rows. Generated by scripts/assemble-v7.js — do not edit by hand.
import React from 'react';

// Keys that stay on the device (display preferences); everything else is server state.
const LOCAL_KEYS = new Set(['wef_lang', 'wef_role', 'wef_mystream', 'wef_lead', 'wef_users', 'wef_seed_agm_v2', 'wef_mtdemo']);

// CSS-declaration string → React style object (url()-safe).
function sty(s) {
  if (!s) return undefined;
  if (typeof s !== 'string') return s;
  const out = {};
  let buf = '', depth = 0;
  const decls = [];
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ';' && depth === 0) { decls.push(buf); buf = ''; }
    else buf += ch;
  }
  if (buf.trim()) decls.push(buf);
  for (const d of decls) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    let k = d.slice(0, i).trim();
    const val = d.slice(i + 1).trim();
    if (!k) continue;
    if (k.startsWith('--')) { out[k] = val; continue; }
    k = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[k] = val;
  }
  return out;
}

`;
const out = preamble + logic.replace(/\n\}\s*$/, '\n') + '\n' + render + '}\n\nexport default DashboardAppV7;\n';
fs.writeFileSync(OUT, out);
console.log('patches applied:', n, '| wrote', OUT, out.length, 'bytes,', out.split('\n').length, 'lines');
const leftovers = ['this.DEPTS', 'this.AGM_DEPTS', 'this.DEPT_META', 'this.AGM_META', 'this.AGM_EVENT', 'this.EVENT[', 'SEED_TEAMS.agm', 'wef_seed_agm', 'wef_mtdemo', 'seedUsers', 'mgmtGenPass', "st.event === 'agm'", "st.event === 'wef'"].filter(s => out.includes(s));
console.log('leftover hardcoded refs:', leftovers.length ? leftovers : 'none');
