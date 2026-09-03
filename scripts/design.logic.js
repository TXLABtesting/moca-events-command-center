class Component extends DCLogic {
  state = { lang: (() => { try { return JSON.parse(localStorage.getItem('wef_lang') || '"en"') || 'en'; } catch (e) { return 'en'; } })(), page: 'overview', railOpen: false, dash: 'all', sev: 'all', repW: 'all', repS: 'all', repO: 'all', repR: 'all', toast: null, admin: false, showLogin: false, loginErr: null, editIdx: null, detailIdx: null, edits: {}, members: null, photos: {}, order: null, submitWs: null, deptIdx: null, deptEditIdx: null, deptMembers: null, deptEdits: {}, acc: { wf: true }, teamView: null, actionKey: null, agendaKey: null, event: null, customEvents: [], showAddEvent: false, density: null, newLogoName: null, eventTeams: {}, showAddTeam: false, tlEdits: {}, tlKey: null, tlDayKey: null, tlMode: false };

  _tick() {
    if (typeof document !== 'undefined' && document.hidden) return;
    const s = this.state;
    const liveSeconds = !!s.event && !s.teamView && (s.page === 'overview' || s.page === 'timeline');
    if (liveSeconds) { this.forceUpdate(); return; }
    const m = Math.floor(Date.now() / 60000);
    if (m !== this._lastMin) { this._lastMin = m; this.forceUpdate(); }
  }
  componentDidMount() {
    this._lastMin = -1;
    this._t = setInterval(() => this._tick(), 1000);
    let edits = {}, members = null, photos = {}, order = null;
    try { edits = JSON.parse(localStorage.getItem('wef_edits') || '{}'); } catch (e) {}
    try { members = JSON.parse(localStorage.getItem('wef_members') || 'null'); } catch (e) {}
    try { photos = JSON.parse(localStorage.getItem('wef_photos') || '{}'); } catch (e) {}
    try { order = JSON.parse(localStorage.getItem('wef_order') || 'null'); } catch (e) {}
    let deptEdits = {}, deptMembers = null, customEvents = [];
    try { deptEdits = JSON.parse(localStorage.getItem('wef_deptedits') || '{}'); } catch (e) {}
    let tlEdits = {}; try { tlEdits = JSON.parse(localStorage.getItem('wef_tledits') || '{}'); } catch (e) {}
    try { deptMembers = JSON.parse(localStorage.getItem('wef_deptmembers') || 'null'); } catch (e) {}
    try { customEvents = JSON.parse(localStorage.getItem('wef_custom_events') || '[]'); } catch (e) {}
    let eventEdits = {}, eventDeleted = [];
    try { eventEdits = JSON.parse(localStorage.getItem('wef_event_edits') || '{}'); } catch (e) {}
    try { eventDeleted = JSON.parse(localStorage.getItem('wef_event_deleted') || '[]'); } catch (e) {}
    let role = 'inputter', myStreams = {}, leadId = 'ali';
    try { leadId = JSON.parse(localStorage.getItem('wef_lead') || '"ali"') || 'ali'; } catch (e) {}
    try { role = JSON.parse(localStorage.getItem('wef_role') || '"inputter"') || 'inputter'; } catch (e) {}
    try { myStreams = JSON.parse(localStorage.getItem('wef_mystream') || '{}'); } catch (e) {}
    let eventTeams = {};
    try { eventTeams = JSON.parse(localStorage.getItem('wef_event_teams') || '{}'); } catch (e) {}
    let approvals = {}, design = {}, tasks = {}, teamlog = {}, taskOv = {};
    try { approvals = JSON.parse(localStorage.getItem('wef_approvals') || '{}'); } catch (e) {}
    try { design = JSON.parse(localStorage.getItem('wef_design') || '{}'); } catch (e) {}
    try { tasks = JSON.parse(localStorage.getItem('wef_tasks') || '{}'); } catch (e) {}
    try { if (!localStorage.getItem('wef_mtdemo')) {
      tasks.d1 = [...(tasks.d1 || []), { t: ['Messaging alignment meeting with department leads', 'اجتماع مواءمة الرسائل مع قادة الإدارات'], o: 'Ali Essa', s: 'p', pr: 'h', d: '21 Jul', dep: ['—', '—'], nx: ['Share aligned messaging pack after the meeting', 'مشاركة حزمة الرسائل بعد الاجتماع'], ap: 'req',
        mt: { rec: 'Department leads (11), Khawla Alsuwaidi', pur: 'Align public-announcement messaging across departments', loc: 'MOCA HQ — Meeting Room 3', d: '2026-07-21', tm: '10:00 - 11:00' } }];
      localStorage.setItem('wef_tasks', JSON.stringify(tasks)); localStorage.setItem('wef_mtdemo', '1');
    } } catch (e) {}
    try { teamlog = JSON.parse(localStorage.getItem('wef_teamlog') || '{}'); } catch (e) {}
    try { taskOv = JSON.parse(localStorage.getItem('wef_taskov') || '{}'); } catch (e) {}
    let taskDel = {};
    try { taskDel = JSON.parse(localStorage.getItem('wef_taskdel') || '{}'); } catch (e) {}
    let empDir = [];
    try { empDir = JSON.parse(localStorage.getItem('wef_empdir') || '[]'); } catch (e) {}
    if (!Array.isArray(empDir)) empDir = [];
    let wfNom = {};
    try { wfNom = JSON.parse(localStorage.getItem('wef_wfnom') || '{}'); } catch (e) {}
    let hotelAssign = {};
    try { hotelAssign = JSON.parse(localStorage.getItem('wef_hotel') || '{}'); } catch (e) {}
    let fbOpen = {}, feedback = {};
    try { fbOpen = JSON.parse(localStorage.getItem('wef_fbopen') || '{}'); } catch (e) {}
    try { feedback = JSON.parse(localStorage.getItem('wef_feedback') || '{}'); } catch (e) {}
    let baseHide = {};
    try { baseHide = JSON.parse(localStorage.getItem('wef_basehide') || '{}'); } catch (e) {}
    if (!localStorage.getItem('wef_seed_agm_v2')) { eventTeams = { ...eventTeams, agm: this.SEED_TEAMS.agm }; try { localStorage.setItem('wef_event_teams', JSON.stringify(eventTeams)); localStorage.setItem('wef_seed_agm_v2', '1'); } catch (e) {} }
    const seededDM = this.seedDeptMembers();
    deptMembers = deptMembers ? { ...seededDM, ...deptMembers } : seededDM;
    this.setState({ edits, members: members || this.seedMembers(), photos, order, deptEdits, deptMembers, customEvents, eventEdits, eventDeleted, eventTeams, empDir, wfNom, fbOpen, feedback, hotelAssign, role, admin: role === 'admin', myStreams, leadId, approvals, design, tasks, teamlog, taskOv, taskDel, baseHide, tlEdits, taskDrafts: [], users: (() => { try { const u = JSON.parse(localStorage.getItem('wef_users') || 'null'); if (u && u.length) return u; } catch (e) {} return this.seedUsers(); })(), authed: (() => { try { return sessionStorage.getItem('wef_auth') === '1'; } catch (e) { return false; } })() });
    this.applyHash();
    this._hashFn = () => this.applyHash();
    window.addEventListener('hashchange', this._hashFn);
  }
  applyHash() {
    try {
      const h = (location.hash || '').replace(/^#/, ''); if (!h) return;
      const p = new URLSearchParams(h); const ev = p.get('event'); const team = p.get('team');
      if (!ev) return;
      const patch = { event: ev, page: 'dash', teamView: team || null, showAddEvent: false };
      this.setState(patch); window.scrollTo(0, 0);
    } catch (e) {}
  }

  seedMembers() {
    const out = {};
    this.WS.forEach((w, i) => {
      const en = (w.dep[0] || '').split(/[,،]/).map(s => s.trim()).filter(s => s && s !== 'None' && s !== 'لا يوجد');
      const arr = (w.dep[1] || '').split(/[,،]/).map(s => s.trim());
      out[i] = en.map((nm, k) => ({ id: 's' + i + '-' + k, n: [nm, arr[k] || nm], roleKey: 'deputy' }));
    });
    return out;
  }

  persist(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  /* ===== TEAM LOG (dated entries per block) ===== */
  teamLogFor(teamId) { const k = (this.state.event || 'wef') + ':' + teamId; return (this.state.teamlog || {})[k] || {}; }
  openLogAdd = (teamId, kind) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ logAdd: { teamId, kind } }); };
  closeLogAdd = () => this.setState({ logAdd: null });
  toggleLogHist = (kind) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState(s => ({ logHist: { ...(s.logHist || {}), [kind]: !(s.logHist || {})[kind] } })); };
  openLogHist = (teamId, kind) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ logHistView: { teamId, kind }, logDelKey: null }); };
  closeLogHist = () => this.setState({ logHistView: null, logDelKey: null });
  askLogDel = (d) => () => this.setState({ logDelKey: d });
  cancelLogDel = () => this.setState({ logDelKey: null });
  confirmLogDel = (teamId, kind, d) => () => {
    const key = (this.state.event || 'wef') + ':' + teamId;
    const tl = { ...(this.state.teamlog || {}) };
    const cur = { ...(tl[key] || {}) };
    cur[kind] = (cur[kind] || []).filter(en => en.d !== d);
    if (!cur[kind].length) delete cur[kind];
    tl[key] = cur;
    this.persist('wef_teamlog', tl);
    this.setState({ teamlog: tl, logDelKey: null });
  };
  toggleLogShow = (teamId, kind, d) => () => {
    const key = (this.state.event || 'wef') + ':' + teamId;
    const tl = { ...(this.state.teamlog || {}) };
    const cur = { ...(tl[key] || {}) };
    cur[kind] = (cur[kind] || []).map(en => en.d === d ? { ...en, hide: !en.hide } : en);
    tl[key] = cur;
    this.persist('wef_teamlog', tl);
    this.setState({ teamlog: tl });
  };
  baseHideFor(teamId, kind) { const key = (this.state.event || 'wef') + ':' + teamId; const bh = ((this.state.baseHide || {})[key] || {})[kind] || {}; return { h: bh.h || [], x: bh.x || [] }; }
  _patchBaseHide(teamId, kind, patch) {
    const key = (this.state.event || 'wef') + ':' + teamId;
    const all = { ...(this.state.baseHide || {}) };
    const forKey = { ...(all[key] || {}) };
    forKey[kind] = patch;
    all[key] = forKey;
    this.persist('wef_basehide', all);
    this.setState({ baseHide: all, logDelKey: null });
  }
  toggleBaseShow = (teamId, kind, i) => () => {
    const cur = this.baseHideFor(teamId, kind);
    const h = cur.h.includes(i) ? cur.h.filter(v => v !== i) : [...cur.h, i];
    this._patchBaseHide(teamId, kind, { h, x: cur.x });
  };
  confirmBaseDel = (teamId, kind, i) => () => {
    const cur = this.baseHideFor(teamId, kind);
    this._patchBaseHide(teamId, kind, { h: cur.h, x: [...cur.x, i] });
  };
  saveLogAdd = (e) => {
    e.preventDefault();
    const la = this.state.logAdd; if (!la) return;
    const txt = (new FormData(e.target).get('txt') || '').trim(); if (!txt) return;
    const key = (this.state.event || 'wef') + ':' + la.teamId;
    const tl = { ...(this.state.teamlog || {}) };
    const cur = { ...(tl[key] || {}) };
    cur[la.kind] = [...(cur[la.kind] || []), { t: txt, d: Date.now() }];
    tl[key] = cur;
    this.persist('wef_teamlog', tl);
    this.setState({ teamlog: tl, logAdd: null });
  };
  componentWillUnmount() { clearInterval(this._t); clearTimeout(this._tt); }

  // ===== APPROVALS =====
  APPR_PR = { h: ['High', 'عالية'], m: ['Medium', 'متوسطة'], l: ['Low', 'منخفضة'] };
  apprStoreFor(ev) { const a = this.state.approvals || {}; const s = a[ev] || {}; return { overrides: s.overrides || {}, manual: s.manual || [] }; }
  saveApprStore(ev, store) { const a = { ...(this.state.approvals || {}), [ev]: store }; this.persist('wef_approvals', a); this.setState({ approvals: a }); }
  openAppr = (id) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ apprKey: id, apprAction: null, apprInput: '' }); };
  closeAppr = () => this.setState({ apprKey: null, apprAction: null, apprInput: '' });
  setApprInput = (e) => this.setState({ apprInput: e.target.value });
  startCardAct = (id, mode) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ apprCardAct: { id, mode }, apprCardInput: '' }); };
  cancelCardAct = (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ apprCardAct: null, apprCardInput: '' }); };
  setCardInput = (e) => this.setState({ apprCardInput: e.target.value });
  confirmCardReject = (id) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); const r = (this.state.apprCardInput || '').trim(); this.patchAppr(id, { status: 'rejected', decidedAt: Date.now(), reason: r }); this.setState({ apprCardAct: null, apprCardInput: '' }); this.flashToast(this.state.lang === 'ar' ? 'تم رفض الطلب' : 'Request rejected'); };
  confirmCardInfo = (id) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); const n = (this.state.apprCardInput || '').trim(); if (!n) return; this.patchAppr(id, { infoReq: { note: n, at: Date.now() } }); this.setState({ apprCardAct: null, apprCardInput: '' }); this.flashToast(this.state.lang === 'ar' ? 'تم طلب معلومات إضافية' : 'More information requested'); };
  startApprAction = (mode) => () => this.setState({ apprAction: mode, apprInput: '' });
  patchAppr(id, patch) {
    const ev = this.state.event; const cur = this.apprStoreFor(ev);
    const store = { overrides: { ...cur.overrides }, manual: [...cur.manual] };
    if (id.indexOf('man:') === 0) { store.manual = store.manual.map(m => m.id === id ? { ...m, ...patch } : m); }
    else { store.overrides[id] = { ...(store.overrides[id] || {}), ...patch }; }
    this.saveApprStore(ev, store);
  }
  apprComments(id) { const ev = this.state.event; const s = this.apprStoreFor(ev); if (id.indexOf('man:') === 0) { const m = s.manual.find(x => x.id === id); return (m && m.comments) || []; } return (s.overrides[id] && s.overrides[id].comments) || []; }
  approveAppr = (id) => () => { this.patchAppr(id, { status: 'approved', decidedAt: Date.now() }); this.flashToast(this.state.lang === 'ar' ? 'تم اعتماد الطلب' : 'Approval granted'); this.setState({ apprAction: 'approved' }); };
  confirmReject = (id) => () => { const r = (this.state.apprInput || '').trim(); this.patchAppr(id, { status: 'rejected', decidedAt: Date.now(), reason: r }); this.flashToast(this.state.lang === 'ar' ? 'تم رفض الطلب' : 'Approval rejected'); this.setState({ apprAction: 'rejected', apprInput: '' }); };
  confirmComment = (id) => () => { const c = (this.state.apprInput || '').trim(); if (!c) return; const comments = [...this.apprComments(id), { by: this.state.lang === 'ar' ? 'مدير المشروع' : 'Project Manager', text: c, at: Date.now() }]; this.patchAppr(id, { comments }); this.flashToast(this.state.lang === 'ar' ? 'تمت إضافة التعليق' : 'Comment added'); this.setState({ apprAction: null, apprInput: '' }); };
  openCreateAppr = () => { this._apprFile = null; this.setState({ showCreateAppr: true, apprPrefillTeam: '', apprFileName: null }); };
  openCreateApprFor = (teamName) => () => { this._apprFile = null; this.setState({ showCreateAppr: true, apprPrefillTeam: teamName, apprFileName: null }); };
  closeCreateAppr = () => { this._apprFile = null; this.setState({ showCreateAppr: false, apprFileName: null }); };
  pickApprFile = () => {
    const inp = document.createElement('input'); inp.type = 'file';
    inp.onchange = (e) => {
      const file = e.target.files && e.target.files[0]; if (!file) return;
      if (file.size > 2 * 1024 * 1024) { this.flashToast(this.state.lang === 'ar' ? 'الحد الأقصى للمرفق 2 ميغابايت' : 'Attachment must be under 2 MB'); return; }
      const rd = new FileReader();
      rd.onload = () => { this._apprFile = { name: file.name, type: file.type || 'application/octet-stream', data: rd.result }; this.setState({ apprFileName: file.name }); };
      rd.readAsDataURL(file);
    };
    inp.click();
  };
  createApproval = (e) => {
    e.preventDefault(); const ev = this.state.event; if (!ev) return; const f = new FormData(e.target); const g = k => (f.get(k) || '').trim();
    const title = g('title'); if (!title) return;
    const item = { id: 'man:' + Date.now(), title, team: g('team') || '—', requestedBy: g('by') || '—', priority: g('priority') || 'm', due: g('due') || '—', desc: g('desc') || '', status: 'pending', createdAt: Date.now(), comments: [], attach: this._apprFile || null };
    const store = this.apprStoreFor(ev); this.saveApprStore(ev, { ...store, manual: [item, ...store.manual] });
    this._apprFile = null;
    this.setState({ showCreateAppr: false, apprFileName: null }); this.flashToast(this.state.lang === 'ar' ? 'تم إنشاء طلب الاعتماد' : 'Approval request created');
  };

  addTaskDraft = () => this.setState(s => ({ taskDrafts: [...(s.taskDrafts || []), { task: '', owner: '', s: 'g', pr: 'm', due: '', dep: '', nx: '' }] }));
  removeTaskDraft = (i) => this.setState(s => ({ taskDrafts: (s.taskDrafts || []).filter((_, j) => j !== i) }));
  setTaskDraft = (i, field) => (e) => { const val = e && e.target ? e.target.value : e; this.setState(s => { const arr = [...(s.taskDrafts || [])]; arr[i] = { ...arr[i], [field]: val }; return { taskDrafts: arr }; }); };

  // ===== EVENT DESIGN =====
  DESIGN_SECTIONS = [
    { key: 'floor', en: 'Floor Plan', ar: 'مخطط الموقع', icon: 'grid' },
    { key: 'branding', en: 'Branding / Visual Identity', ar: 'الهوية البصرية والعلامة', icon: 'brush' }
  ];
  DESIGN_SEED = {
    wef: {
      owner: ['Sumaya Al Hakim', 'سمية الحكيم'],
      floor: { status: 'done', owner: ['Sumaya Al Hakim', 'سمية الحكيم'], updated: '01 Jul', files: [
        { name: ['Madinat Jumeirah — Level 1', 'مدينة جميرا — الطابق الأول'], type: 'PDF', date: '28 Jun', by: ['Sumaya Al Hakim', 'سمية الحكيم'], status: 'approved' },
        { name: ['Main hall floor layout', 'مخطط القاعة الرئيسية'], type: 'DWG', date: '30 Jun', by: ['Maria Ahli', 'ماريا أهلي'], status: 'review' } ] },
      renders: { status: 'review', owner: ['Design Studio', 'استوديو التصميم'], updated: '02 Jul', files: [
        { name: ['Plenary stage render v3', 'تصور المسرح الرئيسي 3'], type: 'JPG', date: '02 Jul', by: ['Design Studio', 'استوديو التصميم'], status: 'review' },
        { name: ['Entrance concept', 'تصور المدخل'], type: 'PNG', date: '29 Jun', by: ['Design Studio', 'استوديو التصميم'], status: 'draft' } ] },
      branding: { status: 'inprogress', owner: ['Sumaya Al Hakim', 'سمية الحكيم'], updated: '30 Jun', files: [
        { name: ['Event brand guidelines', 'دليل الهوية'], type: 'PDF', date: '25 Jun', by: ['Sumaya Al Hakim', 'سمية الحكيم'], status: 'approved' },
        { name: ['Logo lockups (AR/EN)', 'الشعارات (عربي/إنجليزي)'], type: 'SVG', date: '26 Jun', by: ['Sumaya Al Hakim', 'سمية الحكيم'], status: 'approved' },
        { name: ['Welcome card artwork', 'تصميم بطاقة الترحيب'], type: 'AI', date: '30 Jun', by: ['Maria Ahli', 'ماريا أهلي'], status: 'review' } ] },
      stage: { status: 'inprogress', owner: ['Maria Ahli', 'ماريا أهلي'], updated: '01 Jul', files: [
        { name: ['Stage & AV setup plan', 'خطة المسرح والصوتيات'], type: 'PDF', date: '01 Jul', by: ['Maria Ahli', 'ماريا أهلي'], status: 'review' } ] },
      seating: { status: 'inprogress', owner: ['Abdulla Ali', 'عبدالله علي'], updated: '29 Jun', files: [] },
      signage: { status: 'inprogress', owner: ['Maria Ahli', 'ماريا أهلي'], updated: '28 Jun', files: [
        { name: ['Wayfinding master', 'المخطط الإرشادي الرئيسي'], type: 'PDF', date: '28 Jun', by: ['Maria Ahli', 'ماريا أهلي'], status: 'draft' } ] },
      files: { status: 'inprogress', owner: ['Sumaya Al Hakim', 'سمية الحكيم'], updated: '02 Jul', files: [
        { name: ['Design brief pack', 'حزمة موجز التصميم'], type: 'ZIP', date: '02 Jul', by: ['Sumaya Al Hakim', 'سمية الحكيم'], status: 'uploaded' } ] }
    },
    agm: {
      owner: ['Shaima Khammas', 'شيماء خماس'],
      floor: { status: 'review', owner: ['Shaima Khammas', 'شيماء خماس'], updated: '07 Jul', files: [
        { name: ['Council hall layout', 'مخطط قاعة المجلس'], type: 'PDF', date: '06 Jul', by: ['Shaima Khammas', 'شيماء خماس'], status: 'review' } ] },
      renders: { status: 'inprogress', owner: ['People Team', 'فريق People'], updated: '07 Jul', files: [
        { name: ['Main hall concept', 'تصور القاعة الرئيسية'], type: 'JPG', date: '05 Jul', by: ['People Team', 'فريق People'], status: 'draft' } ] },
      branding: { status: 'inprogress', owner: ['Sumaya Al Hakim', 'سمية الحكيم'], updated: '06 Jul', files: [
        { name: ['AGM visual identity', 'الهوية البصرية للاجتماعات'], type: 'PDF', date: '04 Jul', by: ['Sumaya Al Hakim', 'سمية الحكيم'], status: 'approved' } ] },
      stage: { status: 'inprogress', owner: ['Sumaya Al Hakim', 'سمية الحكيم'], updated: '07 Jul', files: [] },
      seating: { status: 'review', owner: ['Abdulla Ali', 'عبدالله علي'], updated: '07 Jul', files: [
        { name: ['VIP seating draft', 'مسودة تجليس كبار الشخصيات'], type: 'PDF', date: '07 Jul', by: ['Abdulla Ali', 'عبدالله علي'], status: 'review' } ] },
      signage: { status: 'inprogress', owner: ['People Team', 'فريق People'], updated: '05 Jul', files: [] },
      files: { status: 'inprogress', owner: ['Shaima Khammas', 'شيماء خماس'], updated: '07 Jul', files: [] }
    }
  };
  DESIGN_PCT = { done: 100, review: 70, inprogress: 40, empty: 0 };
  designStoreFor(ev) { const d = this.state.design || {}; return d[ev] || {}; }
  saveDesignStore(ev, store) { const d = { ...(this.state.design || {}), [ev]: store }; this.persist('wef_design', d); this.setState({ design: d }); }
  deleteDesignFile = (key, idx) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); const ev = this.state.event; const store = this.designStoreFor(ev); const secStore = store[key] || {}; const base = (this.DESIGN_SEED[ev] || {})[key] || {}; const curFiles = secStore.files || base.files || []; const files = curFiles.filter((_, i) => i !== idx); this.saveDesignStore(ev, { ...store, [key]: { ...secStore, files, updated: this.todayStr(), status: secStore.status || base.status || 'inprogress' } }); };
  openDesignSec = (key) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ designKey: key }); };
  closeDesignSec = () => this.setState({ designKey: null });
  todayStr() { const d = new Date(); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return String(d.getDate()).padStart(2, '0') + ' ' + M[d.getMonth()]; }
  uploadDesign = (key) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const ar = this.state.lang === 'ar';
    const inp = document.createElement('input'); inp.type = 'file';
    inp.onchange = (ce) => {
      const file = ce.target.files && ce.target.files[0]; if (!file) return;
      if (file.size > 2 * 1024 * 1024) { this.flashToast(ar ? 'الحد الأقصى للملف 2 ميغابايت' : 'File must be under 2 MB'); return; }
      const rd = new FileReader();
      rd.onload = () => {
        const ev = this.state.event;
        const store = this.designStoreFor(ev); const secStore = store[key] || {};
        const base = (this.DESIGN_SEED[ev] || {})[key] || {};
        const curFiles = secStore.files || base.files || [];
        const m = /\.([A-Za-z0-9]+)$/.exec(file.name);
        const type = m ? m[1].toUpperCase() : 'FILE';
        const f = { name: [file.name, file.name], type, date: this.todayStr(), by: [ar ? 'مدير المشروع' : 'Project Manager', 'مدير المشروع'], status: 'draft', data: rd.result, mime: file.type || 'application/octet-stream' };
        try { this.saveDesignStore(ev, { ...store, [key]: { ...secStore, files: [...curFiles, f], updated: this.todayStr(), status: secStore.status || base.status || 'inprogress' } }); this.flashToast(ar ? 'تم رفع الملف' : 'File uploaded'); }
        catch (err) { this.flashToast(ar ? 'تعذر حفظ الملف — مساحة التخزين ممتلئة' : 'Could not save file — browser storage is full'); }
      };
      rd.readAsDataURL(file);
    };
    inp.click();
  };
  _designBlob(f) {
    if (f.data) { const parts = f.data.split(','); const mime = (parts[0].match(/data:(.*?)[;,]/) || [])[1] || f.mime || 'application/octet-stream'; const bin = atob(parts[1]); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); return new Blob([arr], { type: mime }); }
    const name = Array.isArray(f.name) ? f.name[0] : String(f.name || 'file');
    return new Blob(['Placeholder content for "' + name + '" (' + (f.type || 'FILE') + ') — demo asset in this prototype. Uploaded files download with their real content.'], { type: 'text/plain' });
  }
  _designFileName(f) { const n = Array.isArray(f.name) ? f.name[0] : String(f.name || 'file'); return f.data ? n : n + '.txt'; }
  viewDesignFile = (f) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const url = URL.createObjectURL(this._designBlob(f));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  downloadDesignFile = (f) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const url = URL.createObjectURL(this._designBlob(f));
    const a = document.createElement('a'); a.href = url; a.download = this._designFileName(f); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // ===== CALENDAR =====
  MONTH_IDX = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  parseEventStart(period) {
    const p = Array.isArray(period) ? period[0] : (period || '');
    const dayM = p.match(/(\d{1,2})(?!\d)/);
    const monM = p.match(/([A-Za-z]{3})/);
    const yrM = p.match(/(\d{4})/);
    if (!dayM || !monM || !yrM) return null;
    const mi = this.MONTH_IDX[monM[1]]; if (mi == null) return null;
    return { d: +dayM[1], m: mi, y: +yrM[1] };
  }
  calShift = (delta) => () => {
    let m = (this.state.calMonth == null ? 9 : this.state.calMonth) + delta;
    let y = (this.state.calYear == null ? 2026 : this.state.calYear);
    while (m < 0) { m += 12; y -= 1; } while (m > 11) { m -= 12; y += 1; }
    this.setState({ calMonth: m, calYear: y });
  };
  designIcon(type) {
    const P = {
      grid: ['M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
      cube: ['M12 3l8 4.5v9L12 21l-8-4.5v-9z', 'M12 3v18M4 7.5l8 4.5 8-4.5'],
      brush: ['M4 20c2-1 2-3 4-3s2 2 4 1M14 11l6-6a2 2 0 0 0-3-3l-6 6', 'M11 8l5 5'],
      stage: ['M3 7h18M5 7l2 12M19 7l-2 12M9 12h6'],
      seat: ['M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M4 10h16v5H4zM7 15v4M17 15v4'],
      sign: ['M12 3v3M6 6h9l3 3-3 3H6zM12 12v9'],
      file: ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5']
    };
    const paths = P[type] || P.file;
    return React.createElement('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }, paths.map((d, i) => React.createElement('path', { key: i, d })));
  }

  // [en, ar] pairs for all data text
  WS = [
    { n: ['Visa','التأشيرات'], s: 'a', p: 40, o: ['Ali Essa','علي عيسى'], dep: ['Hend AlMheiri','هند المهيري'], u: '02 Jul', a: ['Visa kickoff meeting confirmed with immigration counterparts for 15 September','تأكيد اجتماع انطلاق التأشيرات مع جهات الهجرة في 15 سبتمبر'], b: ['Issuance window opens only mid-September — compressed lead time for 175 delegates','نافذة الإصدار تبدأ منتصف سبتمبر — مهلة ضيقة لـ175 مشاركاً'], x: ['Lock issuance SOP and delegate data template before kickoff','اعتماد إجراءات الإصدار ونموذج بيانات المشاركين قبل الانطلاق'], d: '15 Sep', resp: ['Delegate visa coordination, issuance SOP, immigration liaison','تنسيق تأشيرات المشاركين وإجراءات الإصدار والتواصل مع الهجرة'], rk: ['Compressed issuance window against delegate confirmation dates','ضيق نافذة الإصدار مقابل مواعيد تأكيد المشاركين'], ap: ['None','لا يوجد'], ms: ['Visa process kickoff · 15 Sep','انطلاق إجراءات التأشيرات · 15 سبتمبر'] },
    { n: ['Flights & Tickets','الطيران والتذاكر'], s: 'g', p: 90, o: ['Ali Essa','علي عيسى'], dep: ['Hend AlMheiri','هند المهيري'], u: '01 Jul', a: ['Emirates contract signed — 25% discount; 175 tickets confirmed at AED 2.7M','توقيع عقد طيران الإمارات بخصم 25٪؛ تأكيد 175 تذكرة بقيمة 2.7 مليون درهم'], b: ['Executive travel process with Emirates being finalised','جارٍ استكمال آلية السفر التنفيذي مع طيران الإمارات'], x: ['Close executive travel process meeting with Emirates','إغلاق اجتماع آلية السفر التنفيذي مع طيران الإمارات'], d: '17 Jul', resp: ['Airline contracting, delegate ticketing, executive travel','التعاقد مع الطيران وتذاكر المشاركين والسفر التنفيذي'], rk: ['Low — contract signed and budget committed','منخفض — العقد موقّع والميزانية ملتزمة'], ap: ['None','لا يوجد'], ms: ['Executive travel process confirmed · 17 Jul','تأكيد آلية السفر التنفيذي · 17 يوليو'] },
    { n: ['Accommodation','الإقامة'], s: 'g', p: 95, o: ['Shaima Khammas','شيماء خماس'], dep: ['Maria Ahli','ماريا أهلي'], u: '30 Jun', a: ['Accommodation for all guests confirmed; all hotel contracts signed','تأكيد إقامة جميع الضيوف وتوقيع كافة عقود الفنادق'], b: ['None','لا يوجد'], x: ['Issue rooming list template to delegations','إصدار نموذج قوائم الغرف للوفود'], d: '01 Sep', resp: ['Guest accommodation, hotel contracting, rooming lists','إقامة الضيوف والتعاقد الفندقي وقوائم الغرف'], rk: ['Low — fully contracted','منخفض — التعاقد مكتمل'], ap: ['None','لا يوجد'], ms: ['Rooming lists issued · 01 Sep','إصدار قوائم الغرف · 1 سبتمبر'] },
    { n: ['Transportation','النقل'], s: 'a', p: 58, o: ['Ahmad Ali','أحمد علي'], dep: ['Mohamed Elmarzouki, Abdulaziz Almeqbali','محمد المرزوقي وعبدالعزيز المقبالي'], u: '02 Jul', a: ['Airport–hotel transfers arranged through Marhaba; airport transportation done','ترتيب النقل من المطار إلى الفنادق عبر «مرحبا»؛ نقل المطار منجز'], b: ['Cultural & gala transport under tender; WEF transport plan awaited pending venue','نقل الفعاليات الثقافية والعشاء قيد المناقصة؛ بانتظار خطة نقل المنتدى بعد تأكيد المكان'], x: ['Award cultural/gala transport tender; confirm shuttle scope with Metropolitan','ترسية مناقصة النقل وتأكيد نطاق الحافلات مع متروبوليتان'], d: '24 Jul', resp: ['Airport transfers, delegate shuttles, cultural & gala transport','نقل المطار وحافلات المشاركين ونقل الفعاليات الثقافية والعشاء'], rk: ['Tender timeline tied to unconfirmed gala venue','جدول المناقصة مرتبط بمكان العشاء غير المؤكد'], ap: ['Shuttle coverage scope for WEF delegates','نطاق تغطية الحافلات لوفود المنتدى'], ms: ['Transport tender award · 24 Jul','ترسية مناقصة النقل · 24 يوليو'] },
    { n: ['Safety & Security','السلامة والأمن'], s: 'a', p: 46, o: ['Khawla Alsuwaidi','خولة السويدي'], dep: ['Maria Ahli, Amna Alsuwaidi, Roudha AlMheiri','ماريا أهلي وآمنة السويدي وروضة المهيري'], u: '02 Jul', a: ['Security checks commencing this week; Madinat Jumeirah channel established','بدء الفحوصات الأمنية هذا الأسبوع؛ فتح قناة التنسيق مع مدينة جميرا'], b: ['Dubai Police coordination meeting not yet held','لم يُعقد بعد اجتماع التنسيق مع شرطة دبي'], x: ['Hold Dubai Police meeting; begin venue security checks','عقد اجتماع شرطة دبي وبدء الفحوصات الأمنية للموقع'], d: '10 Jul', resp: ['Security checks, Dubai Police liaison, venue security with Madinat Jumeirah','الفحوصات الأمنية والتنسيق مع شرطة دبي وأمن الموقع مع مدينة جميرا'], rk: ['Security clearance timeline for venue and delegates','جدول التصاريح الأمنية للموقع والمشاركين'], ap: ['None','لا يوجد'], ms: ['Dubai Police meeting · 10 Jul','اجتماع شرطة دبي · 10 يوليو'] },
    { n: ['Gala Dinner & Farewell','العشاء الرسمي وحفل الوداع'], s: 'r', p: 50, o: ['Shaima Khammas','شيماء خماس'], dep: ['Mariam AlMarzouqi','مريم المرزوقي'], u: '02 Jul', a: ['Venue shortlist complete; set menu direction agreed; food tasting scheduled','اكتمال القائمة المختصرة للأماكن واعتماد توجه القائمة الثابتة وجدولة تذوق الطعام'], b: ['Venue confirmation pending — blocks transport tender, branding and invitations','تأكيد المكان معلّق — يعطل مناقصة النقل والهوية والدعوات'], x: ['Confirm venue under Madinat Jumeirah cap; complete food tasting Tuesday','تأكيد المكان ضمن سقف مدينة جميرا وإتمام تذوق الطعام الثلاثاء'], d: '10 Jul', resp: ['Gala dinner, farewell reception, closing dinner','العشاء الرسمي وحفل الوداع وعشاء الختام'], rk: ['Critical path — venue decision blocks three downstream workstreams','مسار حرج — قرار المكان يعطل ثلاثة مسارات عمل'], ap: ['Venue & format sign-off','اعتماد المكان والصيغة'], ms: ['Venue confirmation · 10 Jul','تأكيد المكان · 10 يوليو'] },
    { n: ['Emirati Hospitality','الضيافة الإماراتية'], s: 'g', p: 72, o: ['Maryam AlMansoori','مريم المنصوري'], dep: ['Jasim AlShamsi','جاسم الشامسي'], u: '01 Jul', a: ['Dubai Chocolate approved; hospitality concept approvals complete','اعتماد شوكولاتة دبي واكتمال موافقات مفهوم الضيافة'], b: ['Gala dinner element still pending venue confirmation','عنصر العشاء الرسمي بانتظار تأكيد المكان'], x: ['Food tasting at Madinat Jumeirah on Tuesday; finalise daily F&B corners','تذوق الطعام في مدينة جميرا الثلاثاء واستكمال أركان الضيافة اليومية'], d: '07 Jul', resp: ['Emirati F&B experience — daily coffee/tea corners, dessert, roastery beans','تجربة الضيافة الإماراتية — أركان القهوة والشاي والحلويات والبن المحمص'], rk: ['Low — approvals secured','منخفض — الموافقات مؤمّنة'], ap: ['None','لا يوجد'], ms: ['Food tasting · 07 Jul','تذوق الطعام · 7 يوليو'] },
    { n: ['Emirati Cultural Performance','العروض الثقافية الإماراتية'], s: 'g', p: 80, o: ['Shamlan AlAmeri','شملان العامري'], dep: ['Shamma AlMarri','شما المري'], u: '01 Jul', a: ['Al Ahila dance confirmed for opening ceremony; Al Ayala for welcome','تأكيد عرض الأهلة لحفل الافتتاح والعيالة للاستقبال'], b: ['Performance transport tied to open transport tender','نقل العروض مرتبط بمناقصة النقل المفتوحة'], x: ['Confirm rehearsal schedule with troupes','تأكيد جدول البروفات مع الفرق'], d: '31 Jul', resp: ['Cultural performances for opening ceremony and welcome','العروض الثقافية لحفل الافتتاح والاستقبال'], rk: ['Transport dependency for performers','اعتماد نقل المؤدين على المناقصة'], ap: ['None','لا يوجد'], ms: ['Rehearsal schedule confirmed · 31 Jul','تأكيد جدول البروفات · 31 يوليو'] },
    { n: ['Opening Ceremony','حفل الافتتاح'], s: 'a', p: 35, o: ['Sumaya AlHakim','سمية الحكيم'], dep: ['Maitha Thani','ميثاء ثاني'], u: '02 Jul', a: ['Concept options in development; Al Ahila performance secured as anchor','خيارات المفهوم قيد الإعداد؛ تأمين عرض الأهلة كعنصر رئيسي'], b: ['Ceremony options not yet presented to leadership','لم تُعرض خيارات الحفل على القيادة بعد'], x: ['Present ceremony options to leadership Thursday','عرض خيارات الحفل على القيادة الخميس'], d: '09 Jul', resp: ['Opening ceremony concept, production and run-of-show','مفهوم حفل الافتتاح والإنتاج وسير البرنامج'], rk: ['Late concept lock compresses production timeline','تأخر اعتماد المفهوم يضغط جدول الإنتاج'], ap: ['Concept selection','اختيار المفهوم'], ms: ['Options presented · 09 Jul','عرض الخيارات · 9 يوليو'] },
    { n: ['Branding','الهوية والعلامة'], s: 'g', p: 70, o: ['Sumaya AlHakim','سمية الحكيم'], dep: ['Maitha Thani','ميثاء ثاني'], u: '30 Jun', a: ['Branding kit updated; layout stable with no major changes','تحديث حقيبة الهوية؛ التصميم مستقر دون تغييرات جوهرية'], b: ['Dinner branding scope awaits gala venue confirmation','نطاق هوية العشاء بانتظار تأكيد المكان'], x: ['Circulate updated layout; scope screens, welcome cards, dinner branding','تعميم التصميم المحدّث وتحديد نطاق الشاشات وبطاقات الترحيب وهوية العشاء'], d: '31 Jul', resp: ['Event branding kit, screens, signage, welcome cards, dinner branding','حقيبة هوية الحدث والشاشات واللوحات وبطاقات الترحيب وهوية العشاء'], rk: ['Dinner branding dependent on venue decision','هوية العشاء مرتبطة بقرار المكان'], ap: ['None','لا يوجد'], ms: ['Updated layout circulated · 08 Jul','تعميم التصميم المحدّث · 8 يوليو'] },
    { n: ['IT / Digital Services','تقنية المعلومات والخدمات الرقمية'], s: 'a', p: 30, o: ['Mohammed Al Yassi','محمد الياسي'], dep: ['Rafi Mohammed','رافي محمد'], u: '29 Jun', a: ['Infrastructure requirements scoped with venue counterparts','تحديد متطلبات البنية التحتية مع نظراء الموقع'], b: ['Still at planning stage — build phase not started','ما زال في مرحلة التخطيط — لم تبدأ مرحلة التنفيذ'], x: ['Complete infrastructure plan; follow up with Madinat Jumeirah on DDR','استكمال خطة البنية التحتية والمتابعة مع مدينة جميرا'], d: '15 Aug', resp: ['Event IT infrastructure, digital services, connectivity','البنية التحتية التقنية والخدمات الرقمية والاتصال'], rk: ['Planning-stage status with 14 weeks to event','البقاء في مرحلة التخطيط قبل 14 أسبوعاً من الحدث'], ap: ['Infrastructure budget','ميزانية البنية التحتية'], ms: ['Infrastructure plan approved · 15 Aug','اعتماد خطة البنية التحتية · 15 أغسطس'] },
    { n: ['Protocol','المراسم'], s: 'a', p: 40, o: ['Abdulla Ali','عبدالله علي'], dep: ['Mohammed Bin Suwaidan','محمد بن سويدان'], u: '30 Jun', a: ['Protocol framework for ministerial delegations drafted','إعداد إطار المراسم للوفود الوزارية'], b: ['Registration ownership unresolved (pending assignment)','مسؤولية التسجيل غير محسومة (بانتظار الإسناد)'], x: ['Resolve registration ownership; align ushers and invitation protocol','حسم مسؤولية التسجيل ومواءمة المرافقين وبروتوكول الدعوات'], d: '09 Jul', resp: ['VIP protocol, registration, ushers, invitations','مراسم كبار الشخصيات والتسجيل والمرافقون والدعوات'], rk: ['Unassigned registration ownership','عدم إسناد مسؤولية التسجيل'], ap: ['Registration owner assignment','إسناد مسؤول التسجيل'], ms: ['Registration owner confirmed · 09 Jul','تأكيد مسؤول التسجيل · 9 يوليو'] },
    { n: ['Agreements / MOU','الاتفاقيات ومذكرة التفاهم'], s: 'r', p: 25, o: ['Mohammed Sami','محمد سامي'], dep: ['Mohammed Sulaiman','محمد سليمان'], u: '02 Jul', a: ['UAE-side review of MOU and operational documents complete','اكتمال المراجعة الإماراتية لمذكرة التفاهم والوثائق التشغيلية'], b: ['MOU and operational documents pending with WEF beyond 30 Jun target','مذكرة التفاهم والوثائق التشغيلية معلّقة لدى المنتدى بعد موعد 30 يونيو'], x: ['Escalate via Operations Chief; weekly WEF liaison call in place','التصعيد عبر رئيسة العمليات مع اجتماع تنسيق أسبوعي مع المنتدى'], d: '15 Jul', resp: ['WEF MOU, operational documents, inter-party agreements','مذكرة تفاهم المنتدى والوثائق التشغيلية والاتفاقيات'], rk: ['Critical — no contractual basis for joint operations until signed','حرج — لا أساس تعاقدي للعمليات المشتركة قبل التوقيع'], ap: ['Ministerial escalation letter','خطاب تصعيد وزاري'], ms: ['MOU signature target · 15 Jul','الموعد المستهدف لتوقيع المذكرة · 15 يوليو'] },
    { n: ['Press Release','البيان الصحفي'], s: 'a', p: 45, o: ['Yahya Khalid','يحيى خالد'], dep: ['Maitha AlFarhan','ميثاء الفرحان'], u: '28 Jun', a: ['Announcement narrative drafted and aligned with communications','صياغة سردية الإعلان ومواءمتها مع الاتصال المؤسسي'], b: ['Release timing dependent on MOU signature','توقيت الإصدار مرتبط بتوقيع مذكرة التفاهم'], x: ['Prepare bilingual release package for post-MOU announcement','إعداد حزمة إعلامية ثنائية اللغة للإعلان بعد التوقيع'], d: '20 Jul', resp: ['Media announcements, press coordination, bilingual releases','الإعلانات الإعلامية والتنسيق الصحفي والبيانات ثنائية اللغة'], rk: ['Timing coupled to MOU','الارتباط الزمني بمذكرة التفاهم'], ap: ['Release approval','اعتماد البيان'], ms: ['Release package ready · 20 Jul','جاهزية الحزمة الإعلامية · 20 يوليو'] },
    { n: ['Translations & Photography','الترجمة والتصوير'], s: 'g', p: 65, o: ['Khawla Belqaizi','خولة بلقيزي'], dep: ['Maryam AlMarzoqi','مريم المرزوقي'], u: '29 Jun', a: ['Translation vendor shortlist complete; photography brief approved','اكتمال القائمة المختصرة لمزودي الترجمة واعتماد موجز التصوير'], b: ['None','لا يوجد'], x: ['Contract interpretation services for event day','التعاقد على خدمات الترجمة الفورية ليوم الحدث'], d: '15 Aug', resp: ['Interpretation, document translation, official photography','الترجمة الفورية وترجمة الوثائق والتصوير الرسمي'], rk: ['Low','منخفض'], ap: ['None','لا يوجد'], ms: ['Interpretation contracted · 15 Aug','التعاقد على الترجمة الفورية · 15 أغسطس'] },
    { n: ['Budgeting','الميزانية'], s: 'a', p: 55, o: ['Obada Shorrab','عبادة شراب'], dep: ['Hessa AlHosani, Majed BinHadher','حصة الحوساني وماجد بن حاضر'], u: '01 Jul', a: ['Flights budget committed (AED 2.7M); accommodation budget closed','التزام ميزانية الطيران (2.7 مليون درهم) وإغلاق ميزانية الإقامة'], b: ['Giveaways and gala budgets awaiting sign-off','ميزانيتا الهدايا والعشاء بانتظار الاعتماد'], x: ['Present consolidated budget position at Wednesday rollup','عرض الموقف المالي الموحد في تقرير الأربعاء'], d: '08 Jul', resp: ['Consolidated event budget, commitments tracking, approvals','الميزانية الموحدة وتتبع الالتزامات والاعتمادات'], rk: ['Open budget lines pending decisions','بنود ميزانية مفتوحة بانتظار القرارات'], ap: ['Giveaways AED 60,000','الهدايا 60,000 درهم'], ms: ['Consolidated budget review · 08 Jul','مراجعة الميزانية الموحدة · 8 يوليو'] },
    { n: ['Giveaways','الهدايا التذكارية'], s: 'g', p: 75, o: ['Jasim AlShamsi','جاسم الشامسي'], dep: ['Maryam AlMansoori','مريم المنصوري'], u: '01 Jul', a: ['Concept confirmed — Maliha foods / honey; costed at AED 150 × 400 pieces','تأكيد المفهوم — منتجات مليحة والعسل؛ بتكلفة 150 درهماً × 400 قطعة'], b: ['AED 60,000 budget awaiting management sign-off','ميزانية 60,000 درهم بانتظار اعتماد الإدارة'], x: ['Obtain budget approval; place production order','الحصول على اعتماد الميزانية وإصدار أمر الإنتاج'], d: '08 Jul', resp: ['Delegate giveaways sourcing, costing and production','توريد هدايا المشاركين وتكلفتها وإنتاجها'], rk: ['Production lead time if approval slips','مهلة الإنتاج في حال تأخر الاعتماد'], ap: ['Budget AED 60,000','ميزانية 60,000 درهم'], ms: ['Budget approval · 08 Jul','اعتماد الميزانية · 8 يوليو'] },
    { n: ['Volunteering','التطوع'], s: 'a', p: 38, o: ['Shamlan AlAmeri','شملان العامري'], dep: ['Shamma AlMarri','شما المري'], u: '27 Jun', a: ['Volunteer role matrix drafted across event functions','إعداد مصفوفة أدوار المتطوعين عبر وظائف الحدث'], b: ['Recruitment call not yet opened','لم يُفتح باب التسجيل بعد'], x: ['Open volunteer recruitment; align with protocol on usher roles','فتح باب التطوع والمواءمة مع المراسم بشأن أدوار المرافقين'], d: '01 Aug', resp: ['Volunteer recruitment, training, deployment','استقطاب المتطوعين وتدريبهم وتوزيعهم'], rk: ['Recruitment timeline','جدول الاستقطاب'], ap: ['None','لا يوجد'], ms: ['Recruitment opens · 01 Aug','فتح باب التسجيل · 1 أغسطس'] }
  ];

  RISKS = [
    { t: ['WEF MOU & operational documents unsigned','عدم توقيع مذكرة التفاهم والوثائق التشغيلية'], w: ['Agreements / MOU','الاتفاقيات ومذكرة التفاهم'], sev: 'Critical', st: ['Open — Escalated','مفتوح — مُصعَّد'], o: ['Mohammed Sami','محمد سامي'], imp: ['No contractual basis for joint operations; blocks press release and downstream commitments','لا أساس تعاقدي للعمليات المشتركة؛ يعطل البيان الصحفي والالتزامات اللاحقة'], mit: ['Weekly WEF liaison call established; escalation letter drafted for Operations Chief','اجتماع تنسيق أسبوعي مع المنتدى وإعداد خطاب تصعيد لرئيسة العمليات'], dec: ['Approve ministerial escalation to WEF leadership','اعتماد التصعيد الوزاري إلى قيادة المنتدى'], d: '15 Jul', L: 2, I: 2 },
    { t: ['Gala dinner venue unconfirmed','عدم تأكيد مكان العشاء الرسمي'], w: ['Gala Dinner & Farewell','العشاء الرسمي'], sev: 'Critical', st: ['Open','مفتوح'], o: ['Shaima Khammas','شيماء خماس'], imp: ['Blocks transportation tender, dinner branding and invitations — three workstreams held','يعطل مناقصة النقل وهوية العشاء والدعوات — ثلاثة مسارات متوقفة'], mit: ['Shortlist reduced to Madinat Jumeirah under existing cap; food tasting Tuesday','حصر الخيارات في مدينة جميرا ضمن السقف القائم وتذوق الطعام الثلاثاء'], dec: ['Venue & format sign-off','اعتماد المكان والصيغة'], d: '10 Jul', L: 2, I: 2 },
    { t: ['Cultural & gala transportation tender open','مناقصة نقل الفعاليات الثقافية والعشاء مفتوحة'], w: ['Transportation','النقل'], sev: 'High', st: ['Open','مفتوح'], o: ['Ahmad Ali','أحمد علي'], imp: ['Late award compresses vendor mobilisation for performers and gala logistics','تأخر الترسية يضغط جاهزية المزودين للعروض ولوجستيات العشاء'], mit: ['Tender documents issued; evaluation panel on standby pending venue','إصدار وثائق المناقصة ولجنة التقييم جاهزة بانتظار المكان'], dec: ['Award tender within 5 days of venue confirmation','الترسية خلال 5 أيام من تأكيد المكان'], d: '24 Jul', L: 1, I: 2 },
    { t: ['Registration ownership unresolved','مسؤولية التسجيل غير محسومة'], w: ['Protocol','المراسم'], sev: 'High', st: ['Open','مفتوح'], o: ['Abdulla Ali','عبدالله علي'], imp: ['Delegate registration setup cannot start; affects visa data and protocol planning','تعذّر بدء إعداد التسجيل؛ يؤثر على بيانات التأشيرات وتخطيط المراسم'], mit: ['Candidate owners identified; decision paper with Operations Chief','تحديد المرشحين وورقة قرار لدى رئيسة العمليات'], dec: ['Assign registration owner','إسناد مسؤول التسجيل'], d: '09 Jul', L: 2, I: 1 },
    { t: ['Compressed visa issuance window','ضيق نافذة إصدار التأشيرات'], w: ['Visa','التأشيرات'], sev: 'Medium', st: ['Monitored','قيد المتابعة'], o: ['Ali Essa','علي عيسى'], imp: ['Issuance starts mid-September for 175 delegates — limited buffer before travel','بدء الإصدار منتصف سبتمبر لـ175 مشاركاً — هامش محدود قبل السفر'], mit: ['SOP and data template prepared ahead of 15 Sep kickoff','تجهيز الإجراءات ونموذج البيانات قبل انطلاقة 15 سبتمبر'], dec: ['None — monitoring','لا يوجد — متابعة'], d: '15 Sep', L: 1, I: 1 },
    { t: ['WEF transport plan not yet shared','خطة نقل المنتدى لم تُشارك بعد'], w: ['Transportation','النقل'], sev: 'Medium', st: ['Monitored','قيد المتابعة'], o: ['Ahmad Ali','أحمد علي'], imp: ['Shuttle planning assumptions unvalidated until WEF confirms venue-side plan','افتراضات تخطيط الحافلات غير مؤكدة حتى تأكيد خطة المنتدى'], mit: ['Standing request with WEF counterparts; interim plan drafted','طلب قائم لدى نظراء المنتدى وخطة مؤقتة معدّة'], dec: ['None — monitoring','لا يوجد — متابعة'], d: '17 Jul', L: 1, I: 1 },
    { t: ['Shuttle coverage scope undefined (Metropolitan)','نطاق تغطية الحافلات غير محدد (متروبوليتان)'], w: ['Transportation','النقل'], sev: 'Medium', st: ['Open','مفتوح'], o: ['Ahmad Ali','أحمد علي'], imp: ['Unbudgeted shuttle scope if UAE side covers WEF delegate shuttles','نطاق غير مدرج بالميزانية إذا غطّى الجانب الإماراتي حافلات وفود المنتدى'], mit: ['Cost scenarios prepared for both coverage options','إعداد سيناريوهات التكلفة لخياري التغطية'], dec: ['Confirm shuttle coverage scope','تأكيد نطاق تغطية الحافلات'], d: '12 Jul', L: 1, I: 1 },
    { t: ['IT infrastructure at planning stage','البنية التحتية التقنية في مرحلة التخطيط'], w: ['IT / Digital Services','الخدمات الرقمية'], sev: 'Medium', st: ['Monitored','قيد المتابعة'], o: ['Mohammed Al Yassi','محمد الياسي'], imp: ['Build phase compression risk with 14 weeks to event','خطر ضغط مرحلة التنفيذ قبل 14 أسبوعاً من الحدث'], mit: ['Plan targeted for 15 Aug; DDR follow-up with Madinat Jumeirah underway','استهداف الخطة في 15 أغسطس والمتابعة مع مدينة جميرا'], dec: ['None — monitoring','لا يوجد — متابعة'], d: '15 Aug', L: 0, I: 1 }
  ];

  DECISIONS = [
    { t: ['Giveaways budget approval','اعتماد ميزانية الهدايا'], dl: '08 Jul', o: ['Obada Shorrab','عبادة شراب'], st: ['Awaiting decision','بانتظار القرار'], bg: ['Giveaway concept confirmed (Maliha foods / honey). Costed at AED 150 per piece × 400 pieces = AED 60,000 total.','تأكيد مفهوم الهدايا (منتجات مليحة والعسل) بتكلفة 150 درهماً للقطعة × 400 قطعة = 60,000 درهم.'], opts: [ { b: 'A', t: ['Approve AED 60,000 as costed','اعتماد 60,000 درهم كما هي'], cls: 'rec' }, { b: 'B', t: ['Reduce quantity to 300 pieces (AED 45,000)','خفض الكمية إلى 300 قطعة (45,000 درهم)'], cls: '' } ], rec: ['Approve as costed — quantity matches confirmed delegate count with buffer','الاعتماد كما هو — الكمية تطابق عدد المشاركين المؤكد مع هامش'], impd: ['Production lead time slips; delivery risk against event date','تأخر مهلة الإنتاج وخطر التسليم قبل موعد الحدث'] },
    { t: ['Registration ownership assignment','إسناد مسؤولية التسجيل'], dl: '09 Jul', o: ['Fouzia AlTayer AlMarri','فوزية الطاير المري'], st: ['Awaiting decision','بانتظار القرار'], bg: ['Delegate registration ownership is unassigned. Setup cannot begin, affecting visa data flow and protocol planning.','مسؤولية تسجيل المشاركين غير مسندة، ما يمنع بدء الإعداد ويؤثر على بيانات التأشيرات وتخطيط المراسم.'], opts: [ { b: 'A', t: ['Assign to Protocol (Abdulla Ali) with IT support','الإسناد إلى المراسم (عبدالله علي) بدعم تقني'], cls: 'rec' }, { b: 'B', t: ['Assign to Digital Services (Mohammed Al Yassi)','الإسناد إلى الخدمات الرقمية (محمد الياسي)'], cls: '' } ], rec: ['Assign to Protocol with Digital Services support — matches usher and invitation flow','الإسناد إلى المراسم بدعم الخدمات الرقمية — يتوافق مع مسار المرافقين والدعوات'], impd: ['Registration platform setup compresses; delegate data delays cascade to visa','ضغط إعداد منصة التسجيل وتأخر بيانات المشاركين وانعكاسه على التأشيرات'] },
    { t: ['Gala dinner venue & format','مكان العشاء الرسمي وصيغته'], dl: '10 Jul', o: ['Shaima Khammas','شيماء خماس'], st: ['Awaiting decision','بانتظار القرار'], bg: ['Venue shortlist complete. Food tasting at Madinat Jumeirah on Tuesday. Proposal to place the gala under the existing Madinat Jumeirah cap. Set menu direction agreed.','اكتملت القائمة المختصرة. تذوق الطعام في مدينة جميرا الثلاثاء. مقترح بوضع العشاء ضمن سقف مدينة جميرا القائم مع اعتماد القائمة الثابتة.'], opts: [ { b: 'A', t: ['Madinat Jumeirah under existing cap — set menu','مدينة جميرا ضمن السقف القائم — قائمة ثابتة'], cls: 'rec' }, { b: 'B', t: ['Alternative venue — new contract required','مكان بديل — يتطلب عقداً جديداً'], cls: '' } ], rec: ['Option A — leverages existing contract cap and confirmed tasting','الخيار أ — يستفيد من السقف التعاقدي القائم وجلسة التذوق المؤكدة'], impd: ['Transportation tender, dinner branding and invitations remain blocked','استمرار تعطل مناقصة النقل وهوية العشاء والدعوات'] },
    { t: ['Shuttle coverage for WEF delegates','تغطية الحافلات لوفود المنتدى'], dl: '12 Jul', o: ['Ahmad Ali','أحمد علي'], st: ['Awaiting decision','بانتظار القرار'], bg: ['Open question whether UAE side covers shuttles for WEF delegates (Metropolitan). Cost scenarios prepared for both options.','سؤال مفتوح حول تغطية الجانب الإماراتي لحافلات وفود المنتدى (متروبوليتان)، مع تجهيز سيناريوهات التكلفة للخيارين.'], opts: [ { b: 'A', t: ['UAE covers full shuttle scope','تغطية إماراتية كاملة للحافلات'], cls: '' }, { b: 'B', t: ['Split scope — WEF covers Metropolitan routes','تقاسم النطاق — المنتدى يغطي مسارات متروبوليتان'], cls: 'rec' } ], rec: ['Option B — aligned with precedent and prepared cost scenario','الخيار ب — يتوافق مع السوابق وسيناريو التكلفة المعد'], impd: ['Shuttle contracting delayed; scope ambiguity carries into tender award','تأخر التعاقد على الحافلات وامتداد غموض النطاق إلى الترسية'] },
    { t: ['WEF MOU escalation','تصعيد مذكرة تفاهم المنتدى'], dl: '15 Jul', o: ['Fouzia AlTayer AlMarri','فوزية الطاير المري'], st: ['Escalated','مُصعَّد'], bg: ['MOU and operational documents pending with WEF beyond the 30 Jun target. UAE-side review is complete. Weekly liaison call has not unblocked signature.','المذكرة والوثائق التشغيلية معلّقة لدى المنتدى بعد موعد 30 يونيو رغم اكتمال المراجعة الإماراتية واستمرار اجتماع التنسيق الأسبوعي.'], opts: [ { b: 'A', t: ['Ministerial escalation letter to WEF leadership','خطاب تصعيد وزاري إلى قيادة المنتدى'], cls: 'rec' }, { b: 'B', t: ['Continue working-level follow-up for 2 more weeks','مواصلة المتابعة الفنية أسبوعين إضافيين'], cls: '' } ], rec: ['Option A — signature is on the critical path for press release and joint operations','الخيار أ — التوقيع على المسار الحرج للبيان الصحفي والعمليات المشتركة'], impd: ['Joint operations proceed without contractual basis; announcement timing slips','استمرار العمليات دون أساس تعاقدي وتأخر توقيت الإعلان'] },
    { t: ['Reception dinner concept','مفهوم عشاء الاستقبال'], dl: '17 Jul', o: ['Shaima Khammas','شيماء خماس'], st: ['Awaiting decision','بانتظار القرار'], bg: ['Madinat Jumeirah reception options: food carnival with live cooking, traditional Emirati family-style seating, or repeat of last year\u2019s format.','خيارات الاستقبال في مدينة جميرا: كرنفال طعام مع طهي حي، أو جلسات إماراتية تقليدية عائلية، أو تكرار صيغة العام الماضي.'], opts: [ { b: 'A', t: ['Food carnival — live cooking, Emirati traditional seating','كرنفال طعام — طهي حي وجلسات إماراتية تقليدية'], cls: 'rec' }, { b: 'B', t: ['Repeat last year\u2019s format','تكرار صيغة العام الماضي'], cls: '' } ], rec: ['Option A — differentiated experience showcasing Emirati hospitality','الخيار أ — تجربة مميزة تُبرز الضيافة الإماراتية'], impd: ['Vendor booking and menu development window narrows','تقلص نافذة حجز المزودين وتطوير القائمة'] }
  ];

  MILESTONES = [
    { d: '12 Jun', t: ['Emirates contract signed — 25% delegate discount','توقيع عقد طيران الإمارات — خصم 25٪'], w: ['Flights & Tickets','الطيران والتذاكر'], st: ['Completed','منجز'], k: 'done' },
    { d: '20 Jun', t: ['All accommodation contracts confirmed','تأكيد جميع عقود الإقامة'], w: ['Accommodation','الإقامة'], st: ['Completed','منجز'], k: 'done' },
    { d: '25 Jun', t: ['Branding kit updated — layout stable','تحديث حقيبة الهوية — التصميم مستقر'], w: ['Branding','الهوية'], st: ['Completed','منجز'], k: 'done' },
    { d: '28 Jun', t: ['Dubai Chocolate & Emirati hospitality approvals','اعتماد شوكولاتة دبي والضيافة الإماراتية'], w: ['Emirati Hospitality','الضيافة الإماراتية'], st: ['Completed','منجز'], k: 'done' },
    { d: '30 Jun', t: ['MOU response from WEF — target missed','رد المنتدى على المذكرة — تجاوز الموعد'], w: ['Agreements / MOU','الاتفاقيات'], st: ['Overdue','متأخر'], k: 'over' },
    { d: '01 Jul', t: ['Cultural dances selected — Al Ahila & Al Ayala','اختيار العروض — الأهلة والعيالة'], w: ['Cultural Performance','العروض الثقافية'], st: ['Completed','منجز'], k: 'done' },
    { d: '06 Jul', t: ['Security checks commence','بدء الفحوصات الأمنية'], w: ['Safety & Security','السلامة والأمن'], st: ['This week','هذا الأسبوع'], k: 'up' },
    { d: '07 Jul', t: ['Food tasting at Madinat Jumeirah','تذوق الطعام في مدينة جميرا'], w: ['Emirati Hospitality','الضيافة الإماراتية'], st: ['Upcoming','قادم'], k: 'up' },
    { d: '09 Jul', t: ['Opening ceremony options presented','عرض خيارات حفل الافتتاح'], w: ['Opening Ceremony','حفل الافتتاح'], st: ['Upcoming','قادم'], k: 'up' },
    { d: '10 Jul', t: ['Gala dinner venue confirmation','تأكيد مكان العشاء الرسمي'], w: ['Gala Dinner & Farewell','العشاء الرسمي'], st: ['Critical','حرج'], k: 'crit' },
    { d: '10 Jul', t: ['Dubai Police coordination meeting','اجتماع التنسيق مع شرطة دبي'], w: ['Safety & Security','السلامة والأمن'], st: ['Upcoming','قادم'], k: 'up' },
    { d: '15 Jul', t: ['WEF MOU signature target','الموعد المستهدف لتوقيع المذكرة'], w: ['Agreements / MOU','الاتفاقيات'], st: ['Critical','حرج'], k: 'crit' },
    { d: '24 Jul', t: ['Cultural & gala transport tender award','ترسية مناقصة النقل'], w: ['Transportation','النقل'], st: ['Critical','حرج'], k: 'crit' },
    { d: '15 Aug', t: ['IT infrastructure plan approved','اعتماد خطة البنية التحتية التقنية'], w: ['IT / Digital Services','الخدمات الرقمية'], st: ['Upcoming','قادم'], k: 'up' },
    { d: '15 Sep', t: ['Visa process kickoff — issuance begins','انطلاق إجراءات التأشيرات وبدء الإصدار'], w: ['Visa','التأشيرات'], st: ['Upcoming','قادم'], k: 'up' },
    { d: '13 Oct', t: ['WEF Event Day — Opening Ceremony & Gala Dinner','يوم الحدث — حفل الافتتاح والعشاء الرسمي'], w: ['All workstreams','جميع المسارات'], st: ['Event','الحدث'], k: 'crit' }
  ];

  ATTENTION = [
    { n: '01', t: ['WEF MOU & operational documents unsigned — escalation recommended','عدم توقيع مذكرة التفاهم والوثائق التشغيلية — يُوصى بالتصعيد'], w: ['Agreements / MOU','الاتفاقيات'], d: '15 Jul' },
    { n: '02', t: ['Gala dinner venue decision blocking transport tender & invitations','قرار مكان العشاء يعطل مناقصة النقل والدعوات'], w: ['Gala Dinner & Farewell','العشاء الرسمي'], d: '10 Jul' },
    { n: '03', t: ['Cultural & gala transportation tender must be awarded','وجوب ترسية مناقصة النقل للفعاليات الثقافية والعشاء'], w: ['Transportation','النقل'], d: '24 Jul' },
    { n: '04', t: ['Registration ownership unassigned — decision paper submitted','مسؤولية التسجيل غير مسندة — ورقة القرار مرفوعة'], w: ['Protocol','المراسم'], d: '09 Jul' },
    { n: '05', t: ['Giveaways budget AED 60,000 awaiting sign-off','ميزانية الهدايا 60,000 درهم بانتظار الاعتماد'], w: ['Budgeting','الميزانية'], d: '08 Jul' }
  ];

  DEPTS = [
    { id:'d1', n:['Management & Communication','الإدارة والتواصل'], s:'g', u:'02 Jul',
      lead:{n:'Ali Essa', t:['Team Lead','قائد الفريق']}, dep:{n:'Khawla Alsuwaidi', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d1m1',n:'Team Member',r:['Internal Communications','التواصل الداخلي']},{id:'d1m2',n:'Team Member',r:['Media Coordination','تنسيق إعلامي']},{id:'d1m3',n:'Team Member',r:['Stakeholder Liaison','التنسيق مع الجهات']}],
      upd:[['Weekly communications plan approved by leadership','اعتماد خطة التواصل الأسبوعية من القيادة'],['Stakeholder contact matrix finalised across 11 departments','استكمال مصفوفة جهات الاتصال عبر 11 إدارة']],
      chal:[['Aligning messaging across departments before the public announcement','مواءمة الرسائل عبر الإدارات قبل الإعلان']],
      appr:{item:['Communications toolkit sign-off','اعتماد حزمة التواصل'],dec:['Approve final bilingual toolkit','اعتماد الحزمة النهائية ثنائية اللغة'],owner:'Fouzia AlTayer AlMarri',due:'09 Jul'},
      next:{action:['Circulate approved messaging to all department leads','تعميم الرسائل المعتمدة على قادة الإدارات'],who:'Ali Essa',due:'11 Jul'} },
    { id:'d2', n:['Event Management','إدارة الفعاليات'], s:'a', u:'02 Jul',
      lead:{n:'Shaima Khammas', t:['Team Lead','قائد الفريق']}, dep:{n:'Bader Ahmad', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d2m1',n:'Team Member',r:['Hospitality','الضيافة']},{id:'d2m2',n:'Team Member',r:['Admin Affairs','الشؤون الإدارية']},{id:'d2m3',n:'Team Member',r:['Gala Dinner','العشاء الرسمي']}],
      upd:[['Emirati hospitality approvals completed; food tasting scheduled','اكتمال موافقات الضيافة الإماراتية وجدولة تذوق الطعام'],['Venue shortlist reduced to Madinat Jumeirah','حصر خيارات المكان في مدينة جميرا']],
      chal:[['Gala dinner venue confirmation pending — affects downstream planning','تأكيد مكان العشاء معلّق — يؤثر على التخطيط اللاحق']],
      appr:{item:['Gala dinner venue & format','مكان العشاء الرسمي وصيغته'],dec:['Confirm Madinat Jumeirah under existing cap','تأكيد مدينة جميرا ضمن السقف القائم'],owner:'Shaima Khammas',due:'10 Jul'},
      next:{action:['Complete food tasting and lock the set menu','إتمام تذوق الطعام واعتماد القائمة الثابتة'],who:'Bader Ahmad',due:'08 Jul'} },
    { id:'d3', n:['Event Design / Branding / Security Check','تصميم الفعاليات والهوية والتدقيق الأمني'], s:'g', u:'01 Jul',
      lead:{n:'Sumaya AlHakim', t:['Team Lead','قائد الفريق']}, dep:{n:'Maria Ahli', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d3m1',n:'Amna Alsuwaidi',r:['Branding','الهوية']},{id:'d3m2',n:'Roudha AlMheiri',r:['Event Design','تصميم الفعاليات']},{id:'d3m3',n:'Maitha Thani',r:['Security Check','التدقيق الأمني']}],
      upd:[['Branding kit updated; layout stable with no major changes','تحديث حقيبة الهوية والتصميم مستقر دون تغييرات جوهرية'],['Screens, signage and welcome-card scope defined','تحديد نطاق الشاشات واللوحات وبطاقات الترحيب']],
      chal:[['Dinner branding scope awaits the gala venue decision','نطاق هوية العشاء بانتظار قرار المكان']],
      appr:{item:['Updated brand layout circulation','تعميم التصميم المحدّث'],dec:['Approve circulated layout for production','اعتماد التصميم للإنتاج'],owner:'Sumaya AlHakim',due:'08 Jul'},
      next:{action:['Finalise signage and welcome-card production files','استكمال ملفات إنتاج اللوحات وبطاقات الترحيب'],who:'Maria Ahli',due:'12 Jul'} },
    { id:'d4', n:['Safety & Security / Logistics / Transportation','السلامة والأمن واللوجستيات والنقل'], s:'a', u:'02 Jul',
      lead:{n:'Ahmad Ali', t:['Team Lead','قائد الفريق']}, dep:{n:'Rashed Alfalasi', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d4m1',n:'Mohamed Elmarzouki',r:['Logistics','اللوجستيات']},{id:'d4m2',n:'Abdulaziz Almeqbali',r:['Transportation','النقل']},{id:'d4m3',n:'Team Member',r:['Security Coordination','التنسيق الأمني']}],
      upd:[['Airport transfers arranged through Marhaba','ترتيب النقل من المطار عبر «مرحبا»'],['Security checks commencing; Madinat Jumeirah channel established','بدء الفحوصات الأمنية وفتح قناة التنسيق']],
      chal:[['Cultural & gala transport tender award tied to the venue decision','ترسية مناقصة النقل مرتبطة بقرار المكان']],
      appr:{item:['Shuttle coverage scope for WEF delegates','نطاق تغطية الحافلات لوفود المنتدى'],dec:['Confirm shuttle coverage scope','تأكيد نطاق تغطية الحافلات'],owner:'Ahmad Ali',due:'12 Jul'},
      next:{action:['Hold Dubai Police coordination meeting','عقد اجتماع التنسيق مع شرطة دبي'],who:'Rashed Alfalasi',due:'10 Jul'} },
    { id:'d5', n:['Budgeting','الميزانية'], s:'a', u:'01 Jul',
      lead:{n:'Obada Shorrab', t:['Team Lead','قائد الفريق']}, dep:{n:'Hessa AlHosani', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d5m1',n:'Majed BinHadher',r:['Budget Analyst','محلل ميزانية']},{id:'d5m2',n:'Team Member',r:['Commitments Tracking','تتبع الالتزامات']}],
      upd:[['Flights budget committed (AED 2.7M); accommodation budget closed','التزام ميزانية الطيران (2.7 مليون درهم) وإغلاق ميزانية الإقامة'],['Consolidated budget position prepared for weekly rollup','تجهيز الموقف المالي الموحد للتقرير الأسبوعي']],
      chal:[['Giveaways and gala budgets awaiting management sign-off','ميزانيتا الهدايا والعشاء بانتظار الاعتماد']],
      appr:{item:['Giveaways budget — AED 60,000','ميزانية الهدايا — 60,000 درهم'],dec:['Approve AED 60,000 (400 × AED 150)','اعتماد 60,000 درهم (400 × 150)'],owner:'Obada Shorrab',due:'08 Jul'},
      next:{action:['Present consolidated budget at Wednesday rollup','عرض الميزانية الموحدة في تقرير الأربعاء'],who:'Hessa AlHosani',due:'08 Jul'} },
    { id:'d6', n:['Cultural Activities & Volunteering','الأنشطة الثقافية والتطوع'], s:'g', u:'01 Jul',
      lead:{n:'Shamlan AlAmeri', t:['Team Lead','قائد الفريق']}, dep:{n:'Maitha AlFarhan', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d6m1',n:'Shamma AlMarri',r:['Volunteering Coordinator','منسق التطوع']},{id:'d6m2',n:'Team Member',r:['Cultural Programme','البرنامج الثقافي']}],
      upd:[['Al Ahila confirmed for the opening; Al Ayala for the welcome','تأكيد الأهلة للافتتاح والعيالة للاستقبال'],['Volunteer role matrix drafted across event functions','إعداد مصفوفة أدوار المتطوعين']],
      chal:[['Volunteer recruitment call not yet opened','لم يُفتح باب التسجيل للمتطوعين بعد']],
      appr:{item:['Volunteer deployment plan','خطة توزيع المتطوعين'],dec:['Approve recruitment and training plan','اعتماد خطة الاستقطاب والتدريب'],owner:'Shamlan AlAmeri',due:'15 Jul'},
      next:{action:['Open volunteer recruitment and confirm rehearsals','فتح باب التطوع وتأكيد البروفات'],who:'Maitha AlFarhan',due:'01 Aug'} },
    { id:'d7', n:['Digital Services','الخدمات الرقمية'], s:'a', u:'29 Jun',
      lead:{n:'Mohammed Al Yassi', t:['Team Lead','قائد الفريق']}, dep:{n:'Shamma AlMarri', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d7m1',n:'Team Member',r:['Registration Platform','منصة التسجيل']},{id:'d7m2',n:'Team Member',r:['Web & Apps','الويب والتطبيقات']}],
      upd:[['Infrastructure requirements scoped with venue counterparts','تحديد متطلبات البنية التحتية مع نظراء الموقع'],['Registration platform options under review','مراجعة خيارات منصة التسجيل']],
      chal:[['Still at planning stage — build phase not yet started','ما زال في مرحلة التخطيط ولم يبدأ التنفيذ']],
      appr:{item:['IT infrastructure budget','ميزانية البنية التحتية التقنية'],dec:['Approve infrastructure plan and budget','اعتماد خطة البنية التحتية والميزانية'],owner:'Mohammed Al Yassi',due:'15 Aug'},
      next:{action:['Complete infrastructure plan; follow up on DDR','استكمال خطة البنية التحتية والمتابعة'],who:'Shamma AlMarri',due:'15 Aug'} },
    { id:'d8', n:['Protocol','المراسم'], s:'a', u:'30 Jun',
      lead:{n:'Abdulla Ali', t:['Team Lead','قائد الفريق']}, dep:{n:'Hend AlMheiri', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d8m1',n:'Rafi Mohammed',r:['Ushers & Invitations','المرافقون والدعوات']},{id:'d8m2',n:'Team Member',r:['VIP Protocol','مراسم كبار الشخصيات']}],
      upd:[['Protocol framework for ministerial delegations drafted','إعداد إطار المراسم للوفود الوزارية'],['Usher and invitation flow aligned with registration','مواءمة مسار المرافقين والدعوات مع التسجيل']],
      chal:[['Registration ownership unresolved — pending assignment','مسؤولية التسجيل غير محسومة — بانتظار الإسناد']],
      appr:{item:['Registration owner assignment','إسناد مسؤول التسجيل'],dec:['Assign registration ownership to Protocol','إسناد مسؤولية التسجيل إلى المراسم'],owner:'Fouzia AlTayer AlMarri',due:'09 Jul'},
      next:{action:['Confirm registration owner and align ushers','تأكيد مسؤول التسجيل ومواءمة المرافقين'],who:'Abdulla Ali',due:'09 Jul'} },
    { id:'d9', n:['Translations & Photography','الترجمة والتصوير'], s:'g', u:'29 Jun',
      lead:{n:'Khawla Belqaizi', t:['Team Lead','قائد الفريق']}, dep:{n:'Mariam AlMarzouqi', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d9m1',n:'Team Member',r:['Interpretation','الترجمة الفورية']},{id:'d9m2',n:'Team Member',r:['Official Photography','التصوير الرسمي']}],
      upd:[['Translation vendor shortlist complete','اكتمال القائمة المختصرة لمزودي الترجمة'],['Photography brief approved','اعتماد موجز التصوير']],
      chal:[['None — on track','لا يوجد — على المسار']],
      appr:{item:['Interpretation services contract','عقد خدمات الترجمة الفورية'],dec:['Approve interpretation vendor for event day','اعتماد مزود الترجمة ليوم الحدث'],owner:'Khawla Belqaizi',due:'15 Aug'},
      next:{action:['Contract interpretation services for event day','التعاقد على الترجمة الفورية ليوم الحدث'],who:'Mariam AlMarzouqi',due:'15 Aug'} },
    { id:'d10', n:['Agreements','الاتفاقيات'], s:'r', u:'02 Jul',
      lead:{n:'Mohammed Sami', t:['Team Lead','قائد الفريق']}, dep:{n:'Mohammed Bin Suwaidan', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d10m1',n:'Team Member',r:['Legal Review','المراجعة القانونية']},{id:'d10m2',n:'Team Member',r:['Document Control','ضبط الوثائق']}],
      upd:[['UAE-side review of MOU and operational documents complete','اكتمال المراجعة الإماراتية للمذكرة والوثائق'],['Weekly WEF liaison call in place','عقد اجتماع تنسيق أسبوعي مع المنتدى']],
      chal:[['MOU pending with WEF beyond the 30 Jun target — escalation recommended','المذكرة معلّقة لدى المنتدى بعد موعد 30 يونيو — يُوصى بالتصعيد']],
      appr:{item:['WEF MOU escalation','تصعيد مذكرة تفاهم المنتدى'],dec:['Approve ministerial escalation letter','اعتماد خطاب التصعيد الوزاري'],owner:'Fouzia AlTayer AlMarri',due:'15 Jul'},
      next:{action:['Escalate MOU via Operations Chief','تصعيد المذكرة عبر رئيسة العمليات'],who:'Mohammed Sami',due:'15 Jul'} },
    { id:'d11', n:['Press Release','البيان الصحفي'], s:'a', u:'28 Jun',
      lead:{n:'Yahya Khalid', t:['Team Lead','قائد الفريق']}, dep:{n:'Mohammed Sulaiman', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d11m1',n:'Team Member',r:['Media Relations','العلاقات الإعلامية']},{id:'d11m2',n:'Team Member',r:['Bilingual Copy','التحرير ثنائي اللغة']}],
      upd:[['Announcement narrative drafted and aligned with communications','صياغة سردية الإعلان ومواءمتها مع الاتصال'],['Bilingual release package in preparation','إعداد الحزمة الإعلامية ثنائية اللغة']],
      chal:[['Release timing dependent on MOU signature','توقيت الإصدار مرتبط بتوقيع المذكرة']],
      appr:{item:['Press release approval','اعتماد البيان الصحفي'],dec:['Approve bilingual release for post-MOU announcement','اعتماد البيان للإعلان بعد التوقيع'],owner:'Yahya Khalid',due:'20 Jul'},
      next:{action:['Prepare bilingual release package','إعداد الحزمة الإعلامية ثنائية اللغة'],who:'Mohammed Sulaiman',due:'20 Jul'} },
    { id:'d12', n:['Cyber Security','الأمن السيبراني'], s:'a', u:'02 Jul',
      lead:{n:'Abdulrahman Alblooshi', t:['Team Lead','قائد الفريق']}, dep:{n:'—', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'d12m1',n:'Team Member',r:['Network Security','أمن الشبكات']},{id:'d12m2',n:'Team Member',r:['Incident Response','الاستجابة للحوادث']}],
      upd:[['Security architecture review completed for event systems','استكمال مراجعة البنية الأمنية لأنظمة الحدث'],['Access control and monitoring plan drafted','إعداد خطة التحكم بالوصول والمراقبة']],
      chal:[['Penetration testing window pending vendor onboarding','نافذة اختبار الاختراق بانتظار تعاقد المزود']],
      appr:{item:['Cyber security operations plan','خطة عمليات الأمن السيبراني'],dec:['Approve monitoring and incident response plan','اعتماد خطة المراقبة والاستجابة للحوادث'],owner:'Abdulrahman Alblooshi',due:'12 Jul'},
      next:{action:['Onboard security operations vendor','تعاقد مزود عمليات الأمن'],who:'Abdulrahman Alblooshi',due:'12 Jul'} }
  ];

  AGM_DEPTS = [
    { id:'agm-1', n:['Integrated Experience','التجربة المتكاملة'], s:'a', u:'07 Jul',
      lead:{n:'Khawla Al Suwaidi', t:['Team Lead','قائد الفريق']}, dep:{n:'Fawzia Al Tayer', t:['Operations Chief','رئيسة العمليات']},
      mem:[{id:'agm1m1',n:'Team Member',r:['Guest Journey','رحلة الضيف']},{id:'agm1m2',n:'Team Member',r:['Experience Design','تصميم التجربة']}],
      upd:[['New guest-experience app features proposed for the meetings','اقتراح خصائص جديدة لتطبيق تجربة الضيوف للاجتماعات'],['Integrated journey mapped across arrival, sessions and hospitality','رسم الرحلة المتكاملة عبر الوصول والجلسات والضيافة']],
      chal:[['Awaiting final clarifications from People on plans and budget','بانتظار التوضيحات النهائية من People بشأن الخطط والميزانية']],
      appr:{item:['New app feature set','حزمة خصائص التطبيق الجديدة'],dec:['Approve proposed guest-experience features','اعتماد خصائص تجربة الضيوف المقترحة'],owner:'Khawla Al Suwaidi',due:'—'},
      next:{action:['Present new experience ideas to the Project Manager','عرض أفكار التجربة الجديدة على مدير المشروع'],who:'Khawla Al Suwaidi',due:'—'} },
    { id:'agm-2', n:['Admin Affairs, Protocol & Events','الشؤون الإدارية والمراسم والفعاليات'], s:'a', u:'07 Jul',
      lead:{n:'Shaima Khammas', t:['Team Lead','قائد الفريق']}, dep:{n:'Sumaya Al Hakim', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm2m1',n:'Team Member',r:['Event Design','تصميم الحدث']},{id:'agm2m2',n:'Team Member',r:['Halls Management','إدارة القاعات']},{id:'agm2m3',n:'Team Member',r:['VIP Reception','استقبال كبار الشخصيات']}],
      upd:[['General design direction for the event confirmed','اعتماد التوجّه العام لتصميم الحدث'],['Halls and VIP reception scope defined','تحديد نطاق القاعات واستقبال كبار الشخصيات']],
      chal:[['Awaiting People team to deliver the final design; minor edits pending','بانتظار فريق People لتقديم التصميم النهائي مع تعديلات بسيطة']],
      appr:{item:['Council furniture — repair vs. new','أثاث المجلس — إصلاح أم تصنيع جديد'],dec:['Direct furniture approach based on People proposal','توجيه نهج الأثاث بناءً على مقترح People'],owner:'Shaima Khammas',due:'—'},
      next:{action:['Receive final design from People and confirm edits','استلام التصميم النهائي من People وتأكيد التعديلات'],who:'Sumaya Al Hakim',due:'—'} },
    { id:'agm-3', n:['Protocol','المراسم'], s:'a', u:'07 Jul',
      lead:{n:'Abdulla Ali', t:['Team Lead','قائد الفريق']}, dep:{n:'—', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm3m1',n:'Team Member',r:['VIP Protocol','مراسم كبار الشخصيات']},{id:'agm3m2',n:'Team Member',r:['Invitations','الدعوات']}],
      upd:[['Protocol framework for government delegations drafted','إعداد إطار المراسم للوفود الحكومية'],['Ushering and seating plan aligned with events','مواءمة خطة المرافقة والتجليس مع الفعاليات']],
      chal:[['VIP seating dependent on final guest list','التجليس مرتبط بقائمة الضيوف النهائية']],
      appr:{item:['VIP protocol framework','إطار مراسم كبار الشخصيات'],dec:['Approve delegation protocol framework','اعتماد إطار مراسم الوفود'],owner:'Abdulla Ali',due:'—'},
      next:{action:['Confirm ushering and seating plan','تأكيد خطة المرافقة والتجليس'],who:'Abdulla Ali',due:'—'} },
    { id:'agm-4', n:['Hospitality','الضيافة'], s:'g', u:'07 Jul',
      lead:{n:'Oud Al Ali', t:['Team Lead','قائد الفريق']}, dep:{n:'Bader Ahmad', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm4m1',n:'Team Member',r:['F&B Coordination','تنسيق الأطعمة والمشروبات']},{id:'agm4m2',n:'Team Member',r:['Emirati Hospitality','الضيافة الإماراتية']}],
      upd:[['Guest menu selected and approved with the hotel','اختيار قائمة الطعام واعتمادها مع الفندق'],['Distinguished Emirati hospitality concept prepared','تجهيز مفهوم الضيافة الإماراتية المميزة']],
      chal:[['Distinguished hospitality concept awaits Project Manager review','مفهوم الضيافة المميزة بانتظار مراجعة مدير المشروع']],
      appr:{item:['Distinguished hospitality concept','مفهوم الضيافة المميزة'],dec:['Approve premium hospitality experience','اعتماد تجربة الضيافة المميزة'],owner:'Oud Al Ali',due:'—'},
      next:{action:['Hold food tasting to lock the set menu','إجراء تذوق الطعام لاعتماد القائمة'],who:'Bader Ahmad',due:'20 Oct'} },
    { id:'agm-5', n:['Contact Center & Crowd Management','مركز الاتصال وإدارة الحشود'], s:'a', u:'07 Jul',
      lead:{n:'Shamlan Al Ameri', t:['Team Lead','قائد الفريق']}, dep:{n:'—', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm5m1',n:'Team Member',r:['Contact Center','مركز الاتصال']},{id:'agm5m2',n:'Team Member',r:['Crowd Flow','تنظيم الحشود']}],
      upd:[['Contact center operating model outlined','تحديد نموذج تشغيل مركز الاتصال'],['Crowd flow plan drafted for main halls','إعداد خطة انسياب الحشود للقاعات الرئيسية']],
      chal:[['Staffing levels depend on confirmed attendance','مستويات التوظيف مرتبطة بأعداد الحضور المؤكدة']],
      appr:{item:['Contact center staffing plan','خطة توظيف مركز الاتصال'],dec:['Approve staffing and shifts','اعتماد التوظيف والورديات'],owner:'Shamlan Al Ameri',due:'—'},
      next:{action:['Finalise crowd management deployment','استكمال خطة توزيع إدارة الحشود'],who:'Shamlan Al Ameri',due:'—'} },
    { id:'agm-6', n:['Virtual Assistant','المساعد الافتراضي'], s:'a', u:'07 Jul',
      lead:{n:'Shamma Al Marri', t:['Team Lead','قائد الفريق']}, dep:{n:'—', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm6m1',n:'Team Member',r:['Product','المنتج']},{id:'agm6m2',n:'Team Member',r:['Content','المحتوى']}],
      upd:[['Virtual assistant feature set under review with the PM','مراجعة حزمة خصائص المساعد الافتراضي مع مدير المشروع'],['Distinguished features scoped to improve guest experience','تحديد خصائص مميزة لتطوير تجربة الضيوف']],
      chal:[['Feature scope awaits final direction from leadership','نطاق الخصائص بانتظار التوجيه النهائي من القيادة']],
      appr:{item:['Assistant feature scope','نطاق خصائص المساعد'],dec:['Approve final feature scope','اعتماد نطاق الخصائص النهائي'],owner:'Shamma Al Marri',due:'—'},
      next:{action:['Align feature roadmap with the Project Manager','مواءمة خارطة الخصائص مع مدير المشروع'],who:'Shamma Al Marri',due:'—'} },
    { id:'agm-7', n:['Budget','الموازنة'], s:'a', u:'07 Jul',
      lead:{n:'Obada Shorrab', t:['Team Lead','قائد الفريق']}, dep:{n:'—', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm7m1',n:'Team Member',r:['Budget Analyst','محلل ميزانية']},{id:'agm7m2',n:'Team Member',r:['Commitments','الالتزامات']}],
      upd:[['Consolidated budget position prepared for the meetings','تجهيز الموقف المالي الموحد للاجتماعات'],['Hotel and transport commitments recorded','تسجيل التزامات الفنادق والنقل']],
      chal:[['Several lines pending management sign-off','عدة بنود بانتظار اعتماد الإدارة']],
      appr:{item:['Consolidated operating budget','الموازنة التشغيلية الموحدة'],dec:['Approve consolidated budget','اعتماد الموازنة الموحدة'],owner:'Obada Shorrab',due:'—'},
      next:{action:['Present consolidated budget at the rollup','عرض الموازنة الموحدة في التقرير'],who:'Obada Shorrab',due:'—'} },
    { id:'agm-8', n:['Content, Photography & Translation','المحتوى والتصوير والترجمة'], s:'a', u:'07 Jul',
      lead:{n:'Khawla Belqaizi', t:['Team Lead','قائد الفريق']}, dep:{n:'—', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm8m1',n:'Team Member',r:['Documentation','التوثيق']},{id:'agm8m2',n:'Team Member',r:['Photography','التصوير']}],
      upd:[['Content and documentation plan drafted','إعداد خطة المحتوى والتوثيق'],['Translation and photography scope defined','تحديد نطاق الترجمة والتصوير']],
      chal:[['Vendor confirmation pending for interpretation','بانتظار تأكيد مزود الترجمة الفورية']],
      appr:{item:['Interpretation & photography vendors','مزودو الترجمة والتصوير'],dec:['Approve vendors for event day','اعتماد المزودين ليوم الحدث'],owner:'Khawla Belqaizi',due:'—'},
      next:{action:['Confirm interpretation and photography teams','تأكيد فرق الترجمة والتصوير'],who:'Khawla Belqaizi',due:'—'} },
    { id:'agm-9', n:['Hotels, Contracts & Procurement','الفنادق والعقود والمشتريات'], s:'g', u:'07 Jul',
      lead:{n:'Mohammed Al Marzouqi', t:['Team Lead','قائد الفريق']}, dep:{n:'—', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm9m1',n:'Team Member',r:['Contracts','العقود']},{id:'agm9m2',n:'Team Member',r:['Procurement','المشتريات']}],
      upd:[['Rotana Hotel contract signed','توقيع عقد فندق روتانا'],['St. Regis Hotel contract in signing','فندق سانت ريجيس قيد توقيع العقد']],
      chal:[['St. Regis signature to be completed','استكمال توقيع سانت ريجيس']],
      appr:{item:['St. Regis hotel contract','عقد فندق سانت ريجيس'],dec:['Approve St. Regis final contract','اعتماد عقد سانت ريجيس النهائي'],owner:'Mohammed Al Marzouqi',due:'—'},
      next:{action:['Complete St. Regis signature','إتمام توقيع سانت ريجيس'],who:'Mohammed Al Marzouqi',due:'—'} },
    { id:'agm-10', n:['Transportation','المواصلات'], s:'g', u:'07 Jul',
      lead:{n:'Abdulaziz Almeqbali', t:['Team Lead','قائد الفريق']}, dep:{n:'—', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm10m1',n:'Team Member',r:['Fleet','الأسطول']},{id:'agm10m2',n:'Team Member',r:['Routing','المسارات']}],
      upd:[['Transportation provider contracted','التعاقد مع مزود المواصلات'],['Delegate transfer routes drafted','إعداد مسارات نقل المشاركين']],
      chal:[['Routes to finalise once venues confirmed','استكمال المسارات بعد تأكيد المواقع']],
      appr:{item:['Delegate transfer routes','مسارات نقل المشاركين'],dec:['Approve final transfer routing','اعتماد مسارات النقل النهائية'],owner:'Abdulaziz Almeqbali',due:'—'},
      next:{action:['Confirm shuttle and transfer plan','تأكيد خطة الحافلات والنقل'],who:'Abdulaziz Almeqbali',due:'—'} },
    { id:'agm-11', n:['Gifts & Giveaways','الهدايا والتوزيعات'], s:'a', u:'07 Jul',
      lead:{n:'Wadha Mohammed', t:['Team Lead','قائد الفريق']}, dep:{n:'—', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm11m1',n:'Team Member',r:['Sourcing','التوريد']},{id:'agm11m2',n:'Team Member',r:['Distribution','التوزيع']}],
      upd:[['Giveaway options and distributions prepared','تجهيز خيارات الهدايا والتوزيعات']],
      chal:[['Distributions awaiting Project Manager approval','التوزيعات بانتظار اعتماد مدير المشروع']],
      appr:{item:['Giveaways & distributions','الهدايا والتوزيعات'],dec:['Approve giveaway items and distribution','اعتماد الهدايا وخطة التوزيع'],owner:'Wadha Mohammed',due:'—'},
      next:{action:['Confirm distributions with the Project Manager','تأكيد التوزيعات مع مدير المشروع'],who:'Wadha Mohammed',due:'—'} },
    { id:'agm-12', n:['Event Security & Safety','أمن وسلامة الفعالية'], s:'a', u:'07 Jul',
      lead:{n:'Rashed Al Falasi', t:['Team Lead','قائد الفريق']}, dep:{n:'Ahmad Ali', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm12m1',n:'Team Member',r:['Security Audit','التدقيق الأمني']},{id:'agm12m2',n:'Team Member',r:['Logistics Ops','العمليات اللوجستية']}],
      upd:[['Security audit scope defined for venues','تحديد نطاق التدقيق الأمني للمواقع'],['Logistics operations plan drafted','إعداد خطة العمليات اللوجستية']],
      chal:[['On-site audits pending venue access windows','التدقيق الميداني بانتظار مواعيد الدخول']],
      appr:{item:['Venue security clearance','التصريح الأمني للموقع'],dec:['Approve security and safety plan','اعتماد خطة الأمن والسلامة'],owner:'Rashed Al Falasi',due:'—'},
      next:{action:['Begin on-site security checks','بدء الفحوصات الأمنية الميدانية'],who:'Ahmad Ali',due:'—'} },
    { id:'agm-13', n:['Digital Services & Cyber Security','الخدمات الرقمية والأمن السيبراني'], s:'a', u:'07 Jul',
      lead:{n:'Mohammed Al Yassi', t:['Team Lead','قائد الفريق']}, dep:{n:'Abdulrahman Al Balushi', t:['Deputy Lead','نائب القائد']},
      mem:[{id:'agm13m1',n:'Team Member',r:['Infrastructure','البنية التحتية']},{id:'agm13m2',n:'Team Member',r:['Cyber Security','الأمن السيبراني']}],
      upd:[['Digital infrastructure requirements scoped','تحديد متطلبات البنية التحتية الرقمية'],['Cyber security plan under preparation','إعداد خطة الأمن السيبراني']],
      chal:[['Registration and reservations ownership to confirm','تأكيد مسؤولية التسجيل والحجوزات']],
      appr:{item:['Digital infrastructure plan','خطة البنية التحتية الرقمية'],dec:['Approve infrastructure and security plan','اعتماد خطة البنية التحتية والأمن'],owner:'Mohammed Al Yassi',due:'—'},
      next:{action:['Finalise infrastructure and reservations platform','استكمال البنية التحتية ومنصة الحجوزات'],who:'Abdulrahman Al Balushi',due:'—'} }
  ];

  T = {
    en: {
      brandTitle: 'WEF Operational Tracker', brandSub: 'Executive Operations Dashboard · Ministerial & Senior Management Oversight',
      viewDetails: 'View details', detUpdates: 'Updates', detChallenges: 'Challenges', detApprovals: 'Pending Approvals', detNext: 'Next Steps', logAdd: 'Add', logSave: 'Save', logCancel: 'Cancel', logPh: 'Write an entry…', logHistT: 'Submission history', logHistEmpty: 'No entries yet.', logDelQ: 'Delete?', logShowL: 'Show on card', logHideL: 'Hide from card', taskAddL: 'Add task', taskAddT: 'Add task', taskEditT: 'Edit task', taskDeleteL: 'Delete task', taskDeleteQ: 'Delete this task?', taskDeleteYes: 'Yes, delete', genGuide: 'Generate Guide', moveTo: 'Move to team', progStatus: 'Programme Status', wsCount: '18 workstreams',
      days: 'days', hrs: 'hrs', min: 'min', sec: 'sec', toWef: 'to WEF · 13 Oct 2026', lastUpdated: 'Last updated · 02 Jul 2026, 17:40 GST',
      nav: ['Executive Overview','Command Center','Teams & Workstreams','Org Structure','Timeline','Risks & Blockers','Pending Decisions','Submit Update','Reports','Executive Summary'],
      adminBtn: 'Admin', signOut: 'Sign out', adminTitle: 'Administrator Access', adminSub: 'Sign in to edit workstream data and manage team members.', password: 'Password', signIn: 'Sign In', cancel: 'Cancel', wrongPwd: 'Incorrect password. Please try again.',
      editTitle: 'Edit Workstream', saveChanges: 'Save Changes', edit: 'Edit', adminMode: 'Admin mode — editing enabled', editEnabled: 'Editing enabled',
      orgTitle: 'Workforce', orgSub: 'Department leads, deputies and team members across all operational teams. In admin mode you can add, remove, edit and photograph people — then generate a live team guide.', teamLead: 'Team Lead', noMembers: 'No members added yet.', memberName: 'Member name', roles: { deputy: 'Deputy', member: 'Member', advisor: 'Advisor' }, submitUpdateLink: 'Submit workstream update →', prefillFor: 'Submitting an update for', uploadHint: 'Click a photo to upload',
      alertStrong: '2 items require ministerial attention:', alertRest: 'WEF MOU remains unsigned, and the gala dinner venue decision is blocking the transportation tender and invitations.', reviewRisks: 'Open tracker →',
      readiness: 'Overall Event Readiness', heroP1: 'Operations for the 2026 Annual Meeting of the Global Future Councils are progressing across all 18 workstreams. Contracting and accommodation are secured; venue confirmation and the WEF MOU are the critical path.',
      cdTitle: 'Countdown to Event Day', cdEvt1: 'WEF Annual Meeting of the Global Future Councils', cdEvt2: '13 October 2026 · Dubai, UAE',
      tlSummary: 'Traffic-Light Summary', green: 'Green', amber: 'Amber', red: 'Red', tlNote: '18 workstreams · reviewed weekly by the Operational PM',
      execSum: 'Executive Summary', top5: 'Top 5 Management Attention Items', due: 'Due', updated: 'Updated',
      dashTitle: 'Operational Tracker', myStreamsSec: 'My Streams', otherStreamsSec: 'Other Streams', dashSub: 'Select a team to open its full operational view.',
      backToTeam: 'Back to team', allTasksSub: 'Complete task list for this workstream.',
      ach: 'Key Achievement', blk: 'Current Blocker', nxt: 'Next Action',
      teamsTitle: 'Teams & Workstreams', teamsSub: 'Operational structure for WEF 2026, under the Operations Chief with PM-led follow-up across all teams.',
      pmName: 'Khawla Alsuwaidi', pmRole: 'Operational PM · Cross-Team Follow-up & Executive Reporting', chiefName: 'Fouzia AlTayer AlMarri', chiefRole: 'Operations Chief',
      pmNoteBand: 'The Operational PM collects updates from all team leads, tracks progress and risks, and consolidates this dashboard for the Minister and senior management.',
      lead: 'Lead', deputy: 'Deputy', resp: 'Current Responsibilities', risksL: 'Risks', pendAppr: 'Pending Approvals', nextMs: 'Next Milestone',
      tlTitle: 'Timeline & Milestones', tlSub: 'Milestone track to event day, with overdue items flagged for leadership.', daysToWef: 'days to WEF', msTrack: 'Milestone Track', rhythm: 'Operating Rhythm', critDl: 'Critical Deadlines',
      rTitle: 'Risks & Blockers', rSub: 'Register of open risks across all workstreams. Critical items are surfaced first for leadership attention.',
      heatmap: 'Risk Heatmap', heatSub: 'Open risks by impact × likelihood', likelihood: 'Likelihood →', impactL: 'Impact', regSum: 'Register Summary', mitig: 'Mitigation Plan', reqDec: 'Required Decision', dueDate: 'Due Date', owner: 'Owner',
      dTitle: 'Pending Decisions', dSub: 'Decisions required from the Minister and senior management, ordered by deadline.', awaiting: '6 awaiting decision',
      background: 'Background', options: 'Options', recAction: 'Recommended Action', impDelay: 'Impact if Delayed',
      sTitle: 'Submit Workstream Update', sSub: 'Team leads submit weekly updates here. Submissions flow to the Operational PM and are consolidated into the executive dashboard.',
      fWs: 'Workstream', fLead: 'Team Lead Name', fProg: 'Progress %', fStatus: 'Status', fAch: 'Achievements Since Last Update', fBlk: 'Updates', fRisks: 'Challenges', fBudget: 'Pending Approvals', fAppr: 'Next Steps', fNext: 'Next Steps', fSupport: 'Required Management Support', fNotes: 'Attachments / Notes', fDate: 'Update Date',
      phLead: 'e.g. Shaima Khammas', phAch: 'Completed items, signed contracts, confirmed approvals…', phNotes: 'Link or reference to supporting documents',
      submitNote: 'Submissions are reviewed by Khawla Alsuwaidi before publication to leadership.', submitBtn: 'Submit Update',
      addTasksL: 'Add Tasks / Action Items', addTasksSub: 'Add new tracker tasks for this team. They appear in the Operational Tracker table.', addTaskBtn: 'Add Task', taskNL: 'Task', taskPh: 'Describe the action or task',
      guideTitle: 'Generate Team Guide', guideSub: 'Choose what to include in the generated report.', guideLeaders: 'Team leaders & deputies only', guideMembers: 'All members', guideUpdates: 'Updates & action items',
      repTitle: 'Reports', repSub: 'Weekly executive summaries and filterable workstream reporting.', exportPdf: 'Export to PDF', download: 'Download Report', printView: 'Print View',
      weekSum: 'Weekly Executive Summary', weekLabel: 'Week 27 · 29 Jun – 02 Jul 2026', issued: 'Issued to Minister',
      progWeek: 'Progress This Week', progWeekTxt: 'Emirati hospitality approvals completed (Dubai Chocolate confirmed); cultural dances selected — Al Ahila for opening, Al Ayala for welcome; security checks commencing; food tasting scheduled at Madinat Jumeirah.',
      escal: 'Escalations', escalTxt: 'WEF MOU and operational documents still pending; gala dinner venue confirmation required to release the transportation tender and invitations.',
      fOwner: 'Owner', fRisk: 'Risk Level', thWs: 'Workstream', thProg: 'Progress', thRisk: 'Risk',
      brEyebrow: 'Leadership Briefing · One Page', brTitle: 'WEF 2026 Operations — Executive Summary', brMeta: 'Annual Meeting of the Global Future Councils · 13 October 2026 · Dubai', readinessS: 'Readiness',
      brOnH: 'On Track', brAttnH: 'Needs Attention', brRedH: 'Delayed / At Risk', brDecH: 'Decisions Needed From Leadership', brDlH: 'Major Upcoming Deadlines',
      brDlTxt: '07 Jul — Food tasting at Madinat Jumeirah · 09 Jul — Opening ceremony options · 24 Jul — Transport tender award · 15 Sep — Visa kickoff · 13 Oct — Event Day.',
      pmNoteH: 'Operational PM Note', pmNoteTxt: 'All 18 workstreams are reporting on the weekly rhythm and momentum is strong. My focus for the next two weeks is closing the two critical-path items — the WEF MOU and the gala dinner venue — after which the transportation tender, branding and invitations can proceed without compression. I recommend leadership attention on the four decisions listed above at this week\u2019s review.',
      sig: '— Khawla Alsuwaidi, Operational PM',
      foot1: 'WEF Operations Command Center · Annual Meeting of the Global Future Councils 2026 · Dubai', foot2: 'Operational PM: Khawla Alsuwaidi · Operations Chief: Fouzia AlTayer AlMarri', foot3: 'CONFIDENTIAL — FOR LEADERSHIP REVIEW',
      dashChips: ['All (18)','On Track (7)','Attention (9)','At Risk (2)'], sevChips: ['All (8)','Critical (2)','High (2)','Medium (4)'],
      statuses: { g: 'On Track', a: 'Attention', r: 'At Risk' }, riskLvl: { g: 'Low', a: 'Elevated', r: 'Critical' },
      statusOpts: ['Green — On Track','Amber — Attention','Red — At Risk'],
      allWs: 'All workstreams', allSt: 'All statuses', allOw: 'All owners', allLv: 'All levels', hiOnly: 'Elevated risk only', shown: 'workstreams shown',
      stG: 'Green — On Track', stA: 'Amber — Attention', stR: 'Red — At Risk',
      kpis: [['Workstreams','18','Active across 6 team clusters',''],['Completed Items','34','Closed since programme start','var(--g)'],['Pending Items','21','In progress or awaiting input',''],['Delayed Items','3','Past target date','var(--a)'],['Critical Risks','2','Requiring leadership decision','var(--r)'],['Pending Approvals','6','Awaiting management sign-off','']],
      execP1: 'Operations stand at 56% readiness. Accommodation and flights are contractually secured — Emirates has signed with a 25% delegate discount covering 175 participants (AED 2.7M). The Emirati cultural programme is defined: Al Ahila for the opening ceremony and Al Ayala for the welcome. Emirati hospitality approvals are complete, with food tasting scheduled at Madinat Jumeirah.',
      execP2: 'Two items sit on the critical path: the WEF MOU and operational documents remain pending with WEF, and the gala dinner venue is unconfirmed, which holds up the transportation tender, branding and invitations. Visa issuance begins mid-September; the kickoff meeting is set for 15 September.',
      rhy: [['Daily','Team-lead check-ins collected by the Operational PM; blockers escalated same day.'],['Weekly — Sunday','Full operations sync with all 18 workstream leads.'],['Weekly — Wednesday','Executive rollup issued to the Minister and senior management.']],
      deadlines: [['08 Jul','Giveaways budget decision','Budgeting'],['10 Jul','Gala venue confirmation','Gala Dinner'],['15 Jul','WEF MOU signature target','Agreements'],['24 Jul','Transport tender award','Transportation']],
      regRows: [['Critical','2','var(--r)'],['High','2','var(--ink)'],['Medium','4','var(--ink)'],['Closed this month','5','var(--g)']],
      brOn: [['Flights & Accommodation secured.','Emirates contract signed with 25% discount; 175 participant tickets confirmed at AED 2.7M. All guest accommodation and contracts confirmed.'],['Cultural programme defined.','Al Ahila dance confirmed for the opening ceremony; Al Ayala for the welcome. Emirati hospitality approvals complete.'],['Branding kit updated;','layout stable with refreshed materials being circulated.']],
      brAttn: [['Transportation:','airport transfers via Marhaba arranged; contract finalisation in progress. Cultural and gala transport under tender — award needed by 24 Jul.'],['Visa:','issuance opens mid-September; kickoff meeting 15 Sep. Compressed window requires a locked SOP in advance.'],['Security:','checks commencing this week; Dubai Police meeting being scheduled; team connecting with Madinat Jumeirah.']],
      brRed: [['WEF MOU and operational documents','remain pending with WEF beyond the 30 Jun target. Escalation recommended.'],['Gala dinner venue unconfirmed','— blocking the transportation tender, branding and invitations.']],
      brDec: [['Gala dinner venue and format sign-off','by 10 Jul'],['Giveaways budget approval — AED 60,000 (400 × AED 150)','by 08 Jul'],['Ministerial escalation of the WEF MOU','by 15 Jul'],['Shuttle coverage scope for WEF delegates','by 12 Jul']],
      brAsOf: d => 'AS OF 02 JUL 2026 · ' + d + ' DAYS TO EVENT',
      toastMsg: ws => 'Update submitted for PM review.'
    },
    ar: {
      brandTitle: 'متتبع عمليات المنتدى الاقتصادي العالمي', brandSub: 'لوحة العمليات التنفيذية · لإشراف معالي الوزير والإدارة العليا',
      viewDetails: 'عرض التفاصيل', detUpdates: 'التحديثات', detChallenges: 'التحديات', detApprovals: 'الموافقات المعلّقة', logAdd: 'إضافة', logSave: 'حفظ', logCancel: 'إلغاء', logPh: 'اكتب إدخالاً…', logHistT: 'سجل الإدخالات', logHistEmpty: 'لا توجد إدخالات بعد.', logDelQ: 'حذف؟', logShowL: 'إظهار في البطاقة', logHideL: 'إخفاء من البطاقة', taskAddL: 'إضافة مهمة', taskAddT: 'إضافة مهمة', taskEditT: 'تعديل المهمة', taskDeleteL: 'حذف المهمة', taskDeleteQ: 'حذف هذه المهمة؟', taskDeleteYes: 'نعم، احذف', detNext: 'الخطوات التالية', genGuide: 'إنشاء الدليل', moveTo: 'نقل إلى فريق', progStatus: 'حالة البرنامج', wsCount: '18 مسار عمل',
      days: 'يوم', hrs: 'ساعة', min: 'دقيقة', sec: 'ثانية', toWef: 'حتى المنتدى · 13 أكتوبر 2026', lastUpdated: 'آخر تحديث · 2 يوليو 2026، 17:40 بتوقيت الخليج',
      nav: ['النظرة التنفيذية','مركز القيادة','الفرق ومسارات العمل','الهيكل التنظيمي','الجدول الزمني','المخاطر والمعوقات','القرارات المعلّقة','رفع التحديثات','التقارير','الملخص التنفيذي'],
      adminBtn: 'المشرف', signOut: 'تسجيل الخروج', adminTitle: 'دخول المشرف', adminSub: 'سجّل الدخول لتعديل بيانات مسارات العمل وإدارة أعضاء الفرق.', password: 'كلمة المرور', signIn: 'تسجيل الدخول', cancel: 'إلغاء', wrongPwd: 'كلمة المرور غير صحيحة. حاول مرة أخرى.',
      editTitle: 'تعديل مسار العمل', saveChanges: 'حفظ التغييرات', edit: 'تعديل', adminMode: 'وضع المشرف — التعديل مُفعّل', editEnabled: 'التعديل مُفعّل',
      orgTitle: 'فريق العمل', orgSub: 'قادة الإدارات ونوابهم وأعضاء الفرق عبر جميع الفرق التشغيلية. في وضع المشرف يمكنك إضافة الأعضاء وتعديلهم وحذفهم وتحميل صورهم ثم إنشاء دليل مباشر للفريق.', teamLead: 'قائد الفريق', noMembers: 'لم تتم إضافة أعضاء بعد.', memberName: 'اسم العضو', roles: { deputy: 'نائب', member: 'عضو', advisor: 'مستشار' }, submitUpdateLink: '← رفع تحديث مسار العمل', prefillFor: 'رفع تحديث لمسار', uploadHint: 'انقر الصورة للتحميل',
      alertStrong: 'بندان يتطلبان اهتمام معالي الوزير:', alertRest: 'مذكرة تفاهم المنتدى لم تُوقَّع بعد، وقرار مكان العشاء الرسمي يعطل مناقصة النقل والدعوات.', reviewRisks: '← فتح المتتبع',
      readiness: 'الجاهزية العامة للحدث', heroP1: 'تتقدم عمليات الاجتماع السنوي لمجالس المستقبل العالمية 2026 عبر مسارات العمل الثمانية عشر كافة. التعاقدات والإقامة مؤمّنة؛ ويبقى تأكيد المكان ومذكرة التفاهم على المسار الحرج.',
      cdTitle: 'العد التنازلي ليوم الحدث', cdEvt1: 'الاجتماع السنوي لمجالس المستقبل العالمية', cdEvt2: '13 أكتوبر 2026 · دبي، الإمارات',
      tlSummary: 'ملخص المؤشرات', green: 'أخضر', amber: 'برتقالي', red: 'أحمر', tlNote: '18 مسار عمل · تُراجع أسبوعياً من مديرة المشروع التشغيلية',
      execSum: 'الملخص التنفيذي', top5: 'أهم 5 بنود لاهتمام الإدارة', due: 'الاستحقاق', updated: 'آخر تحديث',
      dashTitle: 'متتبع العمليات', myStreamsSec: 'مساراتي', otherStreamsSec: 'المسارات الأخرى', dashSub: 'ملكية الفرق ومتابعة إجراءاتها الحية عبر جميع الفرق التشغيلية. اختر فريقاً لفتح صفحته التشغيلية الكاملة.',
      backToTeam: 'العودة إلى الفريق', allTasksSub: 'قائمة المهام الكاملة لمسار العمل هذا.',
      ach: 'أبرز الإنجازات', blk: 'المعوّق الحالي', nxt: 'الإجراء التالي',
      teamsTitle: 'الفرق ومسارات العمل', teamsSub: 'الهيكل التشغيلي للمنتدى 2026 بقيادة رئيسة العمليات ومتابعة مديرة المشروع عبر جميع الفرق.',
      pmName: 'خولة السويدي', pmRole: 'مديرة المشروع التشغيلية · المتابعة عبر الفرق والتقارير التنفيذية', chiefName: 'فوزية الطاير المري', chiefRole: 'رئيسة العمليات',
      pmNoteBand: 'تجمع مديرة المشروع التشغيلية التحديثات من قادة الفرق كافة، وتتابع التقدم والمخاطر، وتوحّد هذه اللوحة لمعالي الوزير والإدارة العليا.',
      lead: 'القائد', deputy: 'النائب', resp: 'المسؤوليات الحالية', risksL: 'المخاطر', pendAppr: 'الموافقات المعلّقة', nextMs: 'المعلم التالي',
      tlTitle: 'الجدول الزمني والمعالم', tlSub: 'مسار المعالم حتى يوم الحدث مع إبراز البنود المتأخرة للقيادة.', daysToWef: 'يوماً حتى المنتدى', msTrack: 'مسار المعالم', rhythm: 'إيقاع العمل', critDl: 'المواعيد الحرجة',
      rTitle: 'المخاطر والمعوقات', rSub: 'سجل المخاطر المفتوحة عبر جميع مسارات العمل، مع تصدّر البنود الحرجة لاهتمام القيادة.',
      heatmap: 'خريطة المخاطر', heatSub: 'المخاطر المفتوحة حسب الأثر × الاحتمالية', likelihood: '→ الاحتمالية', impactL: 'الأثر', regSum: 'ملخص السجل', mitig: 'خطة المعالجة', reqDec: 'القرار المطلوب', dueDate: 'تاريخ الاستحقاق', owner: 'المسؤول',
      dTitle: 'القرارات المعلّقة', dSub: 'قرارات مطلوبة من معالي الوزير والإدارة العليا مرتبة حسب الموعد النهائي.', awaiting: '6 بانتظار القرار',
      background: 'الخلفية', options: 'الخيارات', recAction: 'الإجراء الموصى به', impDelay: 'أثر التأخير',
      sTitle: 'رفع تحديث مسار العمل', sSub: 'يرفع قادة الفرق تحديثاتهم الأسبوعية هنا، وتصل إلى مديرة المشروع التشغيلية وتُدمج في اللوحة التنفيذية.',
      fWs: 'مسار العمل', fLead: 'اسم قائد الفريق', fProg: 'نسبة الإنجاز ٪', fStatus: 'الحالة', fAch: 'الإنجازات منذ آخر تحديث', fBlk: 'المعوقات الحالية', fRisks: 'التحديات', fBudget: 'الموافقات المعلّقة', fAppr: 'الخطوات التالية', fNext: 'الخطوات التالية', fSupport: 'الدعم المطلوب من الإدارة', fNotes: 'المرفقات / الملاحظات', fDate: 'تاريخ التحديث',
      phLead: 'مثال: شيماء خماس', phAch: 'البنود المنجزة والعقود الموقعة والموافقات المؤكدة…', phNotes: 'رابط أو مرجع للوثائق الداعمة',
      submitNote: 'تُراجع خولة السويدي التحديثات قبل نشرها للقيادة.', submitBtn: 'رفع التحديث',
      addTasksL: 'إضافة مهام / بنود عمل', addTasksSub: 'أضف بنود عمل جديدة لهذا الفريق، وستظهر في جدول المتتبع التشغيلي.', addTaskBtn: 'إضافة مهمة', taskNL: 'مهمة', taskPh: 'صف الإجراء أو المهمة',
      guideTitle: 'إنشاء دليل الفريق', guideSub: 'اختر ما تريد تضمينه في التقرير.', guideLeaders: 'قادة الفرق ونوابهم فقط', guideMembers: 'جميع الأعضاء', guideUpdates: 'التحديثات وبنود العمل',
      repTitle: 'التقارير', repSub: 'ملخصات تنفيذية أسبوعية وتقارير مسارات عمل قابلة للتصفية.', exportPdf: 'تصدير PDF', download: 'تنزيل التقرير', printView: 'نسخة الطباعة',
      weekSum: 'الملخص التنفيذي الأسبوعي', weekLabel: 'الأسبوع 27 · 29 يونيو – 2 يوليو 2026', issued: 'أُرسل لمعالي الوزير',
      progWeek: 'تقدم هذا الأسبوع', progWeekTxt: 'اكتمال موافقات الضيافة الإماراتية (تأكيد شوكولاتة دبي)؛ اختيار العروض الثقافية — الأهلة للافتتاح والعيالة للاستقبال؛ بدء الفحوصات الأمنية؛ وجدولة تذوق الطعام في مدينة جميرا.',
      escal: 'التصعيدات', escalTxt: 'مذكرة التفاهم والوثائق التشغيلية ما زالت معلّقة؛ ويلزم تأكيد مكان العشاء الرسمي لإطلاق مناقصة النقل والدعوات.',
      fOwner: 'المسؤول', fRisk: 'مستوى الخطر', thWs: 'مسار العمل', thProg: 'الإنجاز', thRisk: 'الخطر',
      brEyebrow: 'إحاطة القيادة · صفحة واحدة', brTitle: 'عمليات المنتدى 2026 — الملخص التنفيذي', brMeta: 'الاجتماع السنوي لمجالس المستقبل العالمية · 13 أكتوبر 2026 · دبي', readinessS: 'الجاهزية',
      brOnH: 'على المسار', brAttnH: 'يتطلب المتابعة', brRedH: 'متأخر / معرّض للخطر', brDecH: 'قرارات مطلوبة من القيادة', brDlH: 'أبرز المواعيد القادمة',
      brDlTxt: '7 يوليو — تذوق الطعام في مدينة جميرا · 9 يوليو — خيارات حفل الافتتاح · 24 يوليو — ترسية مناقصة النقل · 15 سبتمبر — انطلاق التأشيرات · 13 أكتوبر — يوم الحدث.',
      pmNoteH: 'ملاحظة مديرة المشروع التشغيلية', pmNoteTxt: 'تلتزم مسارات العمل الثمانية عشر كافة بالإيقاع الأسبوعي والزخم قوي. تركيزي خلال الأسبوعين المقبلين على إغلاق بندي المسار الحرج — مذكرة التفاهم ومكان العشاء الرسمي — ليتسنى بعدها المضي في مناقصة النقل والهوية والدعوات دون ضغط. وأوصي باهتمام القيادة بالقرارات الأربعة المدرجة أعلاه في مراجعة هذا الأسبوع.',
      sig: '— خولة السويدي، مديرة المشروع التشغيلية',
      foot1: 'مركز قيادة عمليات المنتدى · الاجتماع السنوي لمجالس المستقبل العالمية 2026 · دبي', foot2: 'مديرة المشروع التشغيلية: خولة السويدي · رئيسة العمليات: فوزية الطاير المري', foot3: 'سري — لمراجعة القيادة',
      dashChips: ['الكل (18)','على المسار (7)','يتطلب متابعة (9)','معرّض للخطر (2)'], sevChips: ['الكل (8)','حرج (2)','مرتفع (2)','متوسط (4)'],
      statuses: { g: 'على المسار', a: 'يتطلب متابعة', r: 'معرّض للخطر' }, riskLvl: { g: 'منخفض', a: 'مرتفع', r: 'حرج' },
      statusOpts: ['أخضر — على المسار','برتقالي — يتطلب متابعة','أحمر — معرّض للخطر'],
      allWs: 'جميع مسارات العمل', allSt: 'جميع الحالات', allOw: 'جميع المسؤولين', allLv: 'جميع المستويات', hiOnly: 'الخطر المرتفع فقط', shown: 'مسار عمل معروض',
      stG: 'أخضر — على المسار', stA: 'برتقالي — يتطلب متابعة', stR: 'أحمر — معرّض للخطر',
      kpis: [['مسارات العمل','18','نشطة عبر 6 مجموعات فرق',''],['البنود المنجزة','34','أُغلقت منذ بداية البرنامج','var(--g)'],['البنود المعلّقة','21','قيد التنفيذ أو بانتظار مدخلات',''],['البنود المتأخرة','3','تجاوزت الموعد المستهدف','var(--a)'],['المخاطر الحرجة','2','تتطلب قرار القيادة','var(--r)'],['الموافقات المعلّقة','6','بانتظار اعتماد الإدارة','']],
      execP1: 'تبلغ الجاهزية التشغيلية 56٪. الإقامة والطيران مؤمّنان تعاقدياً — وقّعت طيران الإمارات بخصم 25٪ يغطي 175 مشاركاً (2.7 مليون درهم). والبرنامج الثقافي الإماراتي محدد: الأهلة لحفل الافتتاح والعيالة للاستقبال. واكتملت موافقات الضيافة الإماراتية مع جدولة تذوق الطعام في مدينة جميرا.',
      execP2: 'يقع بندان على المسار الحرج: مذكرة التفاهم والوثائق التشغيلية ما زالت معلّقة لدى المنتدى، ومكان العشاء الرسمي غير مؤكد ما يعطل مناقصة النقل والهوية والدعوات. ويبدأ إصدار التأشيرات منتصف سبتمبر مع اجتماع الانطلاق في 15 سبتمبر.',
      rhy: [['يومياً','تجمع مديرة المشروع تحديثات قادة الفرق وتُصعَّد المعوقات في اليوم نفسه.'],['أسبوعياً — الأحد','اجتماع تشغيلي كامل مع قادة مسارات العمل الثمانية عشر.'],['أسبوعياً — الأربعاء','إصدار التقرير التنفيذي لمعالي الوزير والإدارة العليا.']],
      deadlines: [['8 يوليو','قرار ميزانية الهدايا','الميزانية'],['10 يوليو','تأكيد مكان العشاء الرسمي','العشاء الرسمي'],['15 يوليو','الموعد المستهدف لتوقيع المذكرة','الاتفاقيات'],['24 يوليو','ترسية مناقصة النقل','النقل']],
      regRows: [['حرج','2','var(--r)'],['مرتفع','2','var(--ink)'],['متوسط','4','var(--ink)'],['أُغلق هذا الشهر','5','var(--g)']],
      brOn: [['الطيران والإقامة مؤمّنان.','عقد طيران الإمارات موقّع بخصم 25٪؛ 175 تذكرة مؤكدة بقيمة 2.7 مليون درهم. وجميع عقود الإقامة مؤكدة.'],['البرنامج الثقافي محدد.','تأكيد عرض الأهلة لحفل الافتتاح والعيالة للاستقبال، واكتمال موافقات الضيافة الإماراتية.'],['حقيبة الهوية محدّثة؛','التصميم مستقر ويجري تعميم المواد المحدّثة.']],
      brAttn: [['النقل:','نقل المطار عبر «مرحبا» مرتب والعقد قيد الاستكمال. نقل الفعاليات الثقافية والعشاء قيد المناقصة — الترسية مطلوبة قبل 24 يوليو.'],['التأشيرات:','الإصدار يبدأ منتصف سبتمبر واجتماع الانطلاق في 15 سبتمبر. النافذة الضيقة تتطلب اعتماد الإجراءات مسبقاً.'],['الأمن:','الفحوصات تبدأ هذا الأسبوع وتجري جدولة اجتماع شرطة دبي والتنسيق مع مدينة جميرا.']],
      brRed: [['مذكرة التفاهم والوثائق التشغيلية','ما زالت معلّقة لدى المنتدى بعد موعد 30 يونيو. يُوصى بالتصعيد.'],['مكان العشاء الرسمي غير مؤكد','— يعطل مناقصة النقل والهوية والدعوات.']],
      brDec: [['اعتماد مكان العشاء الرسمي وصيغته','قبل 10 يوليو'],['اعتماد ميزانية الهدايا — 60,000 درهم (400 × 150 درهماً)','قبل 8 يوليو'],['التصعيد الوزاري لمذكرة تفاهم المنتدى','قبل 15 يوليو'],['نطاق تغطية الحافلات لوفود المنتدى','قبل 12 يوليو']],
      brAsOf: d => 'كما في 2 يوليو 2026 · ' + d + ' يوماً حتى الحدث',
      toastMsg: ws => 'تم إرسال التحديث لمراجعة إدارة المشروع.'
    }
  };

  AR_MONTHS = { Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل', May: 'مايو', Jun: 'يونيو', Jul: 'يوليو', Aug: 'أغسطس', Sep: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر' };

  go(id) { return () => { this.setState({ page: id, submitWs: null, teamView: null, actionKey: null, agendaKey: null }); window.scrollTo(0, 0); }; }
  photoObj(id, initText, baseStyle) {
    const p = (this.state.photos || {})[id];
    const style = p ? 'background-image:url(' + p + ');color:transparent;' + (baseStyle || '') : (baseStyle || '');
    const imgEl = p ? React.createElement('img', { className: 'avimg', src: p, alt: '' }) : null;
    return { style, init: p ? '' : initText, cls: this.state.admin ? 'av-edit' : '', pick: this.pickPhoto(id), url: p || '', hasPhoto: !!p, imgEl };
  }

  EVENTS = [
    { id: 'wef', en: 'Annual Meeting of Global Future Leaders 2026', ar: 'المنتدى الاقتصادي العالمي', logo: 'assets/logo-wef.png', status: 'active', period: ['13–15 Oct 2026 · Dubai', '13–15 أكتوبر 2026 · دبي'] },
    { id: 'agm', en: 'Annual Government Meetings of UAE', ar: 'الاجتماعات السنوية لحكومة دولة الإمارات', logo: 'assets/logo-agm-black.png', status: 'active', period: ['9–10 Nov 2026 · Abu Dhabi', '9–10 نوفمبر 2026 · أبوظبي'] },
    { id: 'mbr', en: 'MBR Government Excellence Award', ar: 'جائزة محمد بن راشد للأداء الحكومي المتميز', logo: 'assets/logo-mbrgea-nobg.png', status: 'blank', period: ['5 Nov 2026 · Dubai', '5 ديسمبر 2026 · دبي'] }
  ];
  allEvents() {
    const edits = this.state.eventEdits || {}; const del = this.state.eventDeleted || [];
    return [...this.EVENTS, ...(this.state.customEvents || [])]
      .filter(ev => !del.includes(ev.id))
      .map(ev => { const e2 = edits[ev.id]; return e2 ? { ...ev, en: e2.en ?? ev.en, ar: e2.ar ?? ev.ar, period: e2.period ?? ev.period, logo: e2.logo !== undefined ? e2.logo : ev.logo, owner: e2.owner ?? ev.owner } : ev; });
  }
  SEED_TEAMS = { agm: [
    { id: 'agm-1', n: ['Integrated Experience', 'التجربة المتكاملة'], leadN: ['Khawla Al Suwaidi', 'خولة السويدي'], depN: ['Fawzia Al Tayer', 'فوزية الطاير'], s: 'a', p: 45, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-2', n: ['Admin Affairs, Protocol & Events', 'الشؤون الإدارية والمراسم والفعاليات'], leadN: ['Shaima Khammas', 'شيماء خماس'], depN: ['Sumaya Al Hakim', 'سمية الحكيم'], s: 'a', p: 55, due: ['20 Oct', '20 أكتوبر'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-3', n: ['Protocol', 'المراسم'], leadN: ['Abdulla Ali', 'عبدالله علي'], depN: ['—', '—'], s: 'a', p: 40, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-4', n: ['Hospitality', 'الضيافة'], leadN: ['Oud Al Ali', 'عود آل علي'], depN: ['Bader Ahmad', 'بدر أحمد'], s: 'g', p: 70, due: ['20 Oct', '20 أكتوبر'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-5', n: ['Contact Center & Crowd Management', 'مركز الاتصال وإدارة الحشود'], leadN: ['Shamlan Al Ameri', 'شملان العامري'], depN: ['—', '—'], s: 'a', p: 40, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-6', n: ['Virtual Assistant', 'المساعد الافتراضي'], leadN: ['Shamma Al Marri', 'شما المري'], depN: ['—', '—'], s: 'a', p: 45, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-7', n: ['Budget', 'الموازنة'], leadN: ['Obada Shorrab', 'عباده شوراب'], depN: ['—', '—'], s: 'a', p: 50, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-8', n: ['Content, Photography & Translation', 'المحتوى والتصوير والترجمة'], leadN: ['Khawla Belqaizi', 'خولة بالقيزي'], depN: ['—', '—'], s: 'a', p: 45, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-9', n: ['Hotels, Contracts & Procurement', 'الفنادق والعقود والمشتريات'], leadN: ['Mohammed Al Marzouqi', 'محمد المرزوقي'], depN: ['—', '—'], s: 'g', p: 65, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-10', n: ['Transportation', 'المواصلات'], leadN: ['Abdulaziz Almeqbali', 'عبدالعزيز المقبالي'], depN: ['—', '—'], s: 'g', p: 75, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-11', n: ['Gifts & Giveaways', 'الهدايا والتوزيعات'], leadN: ['Wadha Mohammed', 'وضاء محمد'], depN: ['—', '—'], s: 'a', p: 40, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-12', n: ['Event Security & Safety', 'أمن وسلامة الفعالية'], leadN: ['Rashed Al Falasi', 'راشد الفلاسي'], depN: ['Ahmad Ali', 'أحمد علي'], s: 'a', p: 50, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] },
    { id: 'agm-13', n: ['Digital Services & Cyber Security', 'الخدمات الرقمية والأمن السيبراني'], leadN: ['Mohammed Al Yassi', 'محمد الياسي'], depN: ['Abdulrahman Al Balushi', 'عبدالرحمن البلوشي'], s: 'a', p: 35, due: ['TBC', 'يُحدد'], u: ['07 Jul', '07 يوليو'] }
  ] };
  getEvent(id) { return this.allEvents().find(e => e.id === id) || null; }
  openEvent = (id) => () => { const r = this.state.role || 'inputter'; this.setState({ event: id, page: (r === 'admin' || r === 'he') ? 'overview' : 'dash', teamView: null, actionKey: null, agendaKey: null, showAddEvent: false }); window.scrollTo(0, 0); };
  backToEvents = () => { const st = this.state; if (st.taskFull) { this.setState({ taskFull: false }); } else if (st.teamView) { this.setState({ teamView: null, sel: {}, wfAdd: false, wfRemove: false, taskFull: false }); } else { this.setState({ event: null, page: 'overview', teamView: null, actionKey: null, agendaKey: null, showAddEvent: false }); } window.scrollTo(0, 0); };
  resolveAsset(p) { try { if (p && window.__resources) { const metas = document.querySelectorAll('meta[name="ext-resource-dependency"]'); for (const m of metas) { if (m.getAttribute('content') === p) { const r = window.__resources[m.getAttribute('data-resource-id')]; if (r) return r; } } } } catch (e) {} return p; }
  openAddEvent = () => this.setState({ showAddEvent: true, newLogoName: null });
  openEditEvent = (id) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this._editLogo = undefined; this.setState({ editEventId: id, editLogoName: null }); };
  closeEditEvent = () => { this._editLogo = undefined; this.setState({ editEventId: null, editLogoName: null }); };
  pickEditLogo = () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const rd = new FileReader(); rd.onload = () => { this._editLogo = rd.result; this.setState({ editLogoName: file.name }); }; rd.readAsDataURL(file); }; inp.click(); };
  saveEventEdit = (e) => {
    e.preventDefault(); const id = this.state.editEventId; if (!id) return;
    const f = new FormData(e.target); const en = (f.get('en') || '').trim(); if (!en) return;
    const arName = (f.get('ar') || '').trim() || en; const period = (f.get('period') || '').trim(); const owner = (f.get('owner') || '').trim();
    const cur = this.allEvents().find(x => x.id === id) || {};
    const curP = cur.period || ['', ''];
    const patch = { en, ar: arName, period: period === curP[0] ? curP : [period || 'To be confirmed', period || 'يُحدد لاحقاً'], owner };
    if (this._editLogo !== undefined) patch.logo = this._editLogo;
    const eventEdits = { ...(this.state.eventEdits || {}), [id]: { ...(this.state.eventEdits || {})[id], ...patch } };
    this.persist('wef_event_edits', eventEdits); this._editLogo = undefined;
    this.setState({ eventEdits, editEventId: null, editLogoName: null });
  };
  askDelEvent = (id) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ confirmDelEvent: id }); };
  cancelDelEvent = () => this.setState({ confirmDelEvent: null });
  doDelEvent = () => {
    const id = this.state.confirmDelEvent; if (!id) return;
    const eventDeleted = [...(this.state.eventDeleted || []), id];
    this.persist('wef_event_deleted', eventDeleted);
    const customEvents = (this.state.customEvents || []).filter(ev => ev.id !== id);
    this.persist('wef_custom_events', customEvents);
    this.setState({ eventDeleted, customEvents, confirmDelEvent: null, event: this.state.event === id ? null : this.state.event });
  };
  closeAddEvent = () => { this._newLogo = null; this.setState({ showAddEvent: false, newLogoName: null }); };
  pickNewLogo = () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => { this._newLogo = r.result; this.setState({ newLogoName: file.name }); }; r.readAsDataURL(file); }; inp.click(); };
  createEvent = (e) => {
    e.preventDefault(); const f = new FormData(e.target); const en = (f.get('en') || '').trim(); if (!en) return;
    const arName = (f.get('ar') || '').trim() || en; const period = (f.get('period') || '').trim(); const owner = (f.get('owner') || '').trim();
    const id = 'ev' + Date.now();
    const ev = { id, en, ar: arName, logo: this._newLogo || '', status: 'blank', period: [period || 'To be confirmed', period || 'يُحدد لاحقاً'], owner, custom: true };
    const customEvents = [...(this.state.customEvents || []), ev];
    this.persist('wef_custom_events', customEvents); this._newLogo = null;
    this.setState({ customEvents, showAddEvent: false, newLogoName: null, event: id, page: 'overview', teamView: null }); window.scrollTo(0, 0);
  };
  toggleDensity = () => { const cur = this.state.density || ((this.props.compact ?? false) ? 'compact' : 'comfortable'); this.setState({ density: cur === 'compact' ? 'comfortable' : 'compact' }); };

  getEventTeams(id) { return (this.state.eventTeams || {})[id] || []; }
  saveEventTeams = (id, list) => { const et = { ...(this.state.eventTeams || {}), [id]: list }; this.persist('wef_event_teams', et); this.setState({ eventTeams: et }); };
  openAddTeam = () => this.setState({ showAddTeam: true });
  closeAddTeam = () => this.setState({ showAddTeam: false });
  removeTeamFn = (id, tid) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.saveEventTeams(id, this.getEventTeams(id).filter(x => x.id !== tid)); };
  flashToast = (msg) => { this.setState({ toast: msg }); clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: null }), 5000); };
  createTeam = (e) => {
    e.preventDefault(); const id = this.state.event; if (!id) return; const f = new FormData(e.target);
    const en = (f.get('en') || '').trim(); if (!en) return; const arName = (f.get('ar') || '').trim() || en;
    const team = { id: 't' + Date.now(), n: [en, arName], leadN: (f.get('lead') || '').trim(), depN: (f.get('dep') || '').trim(), s: f.get('status') || 'a', p: Math.max(0, Math.min(100, Number(f.get('p')) || 0)), due: (f.get('due') || '').trim() || '—', u: (f.get('u') || '').trim() || '—' };
    this.saveEventTeams(id, [...this.getEventTeams(id), team]); this.setState({ showAddTeam: false });
  };
  parseCSV(text) {
    const lines = String(text).split(/\r?\n/).filter(l => l.trim()); if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idx = (names) => { for (const n of names) { const i = headers.indexOf(n); if (i >= 0) return i; } return -1; };
    const iT = idx(['team', 'name', 'streamline', 'workstream']), iL = idx(['lead', 'team lead', 'owner']), iD = idx(['deputy', 'deputy lead']), iP = idx(['progress', 'progress %', 'percent', '%']), iS = idx(['status']), iU = idx(['due', 'due date', 'next due']);
    return lines.slice(1).map(l => { const c = l.split(','); const g = i => i >= 0 ? (c[i] || '').trim() : ''; return { team: g(iT), lead: g(iL), deputy: g(iD), progress: g(iP), status: g(iS), due: g(iU) }; }).filter(r => r.team);
  }
  importTeams = () => {
    const id = this.state.event; if (!id) return; const ar = this.state.lang === 'ar';
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,.xlsx,.xls,text/csv';
    inp.onchange = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return;
      const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv';
      if (!isCsv) { this.flashToast(ar ? 'يرجى استخدام ملف CSV للاستيراد في هذا النموذج.' : 'Please use a .csv file for import in this prototype.'); return; }
      const r = new FileReader(); r.onload = () => { const rows = this.parseCSV(r.result);
        if (!rows.length) { this.flashToast(ar ? 'لم يُعثر على صفوف قابلة للاستيراد.' : 'No valid rows found in the sheet.'); return; }
        const sm = { green: 'g', 'on track': 'g', amber: 'a', attention: 'a', red: 'r', 'at risk': 'r' };
        const teams = rows.map((row, i) => ({ id: 't' + Date.now() + '-' + i, n: [row.team, row.team], leadN: row.lead || '', depN: row.deputy || '', s: sm[(row.status || '').toLowerCase()] || 'a', p: Math.max(0, Math.min(100, Number(String(row.progress).replace('%', '')) || 0)), due: row.due || '—', u: ar ? 'مُستورد' : 'imported' }));
        this.saveEventTeams(id, [...this.getEventTeams(id), ...teams]);
        this.flashToast((ar ? 'تم استيراد ' : 'Imported ') + teams.length + (ar ? ' فريق' : ' team(s)'));
      }; r.readAsText(file);
    }; inp.click();
  };

  adminClick = () => { if (this.state.admin) this.setRole('inputter')(); else this.setState({ showLogin: true, loginErr: null }); };
  doLogin = (e) => { e.preventDefault(); const pwd = new FormData(e.target).get('pwd'); if (pwd === '1234') { this.setRole('admin')(); this.setState({ showLogin: false, loginErr: null }); } else this.setState({ loginErr: this.T[this.state.lang].wrongPwd }); };
  setRole = (r) => () => {
    this.persist('wef_role', r);
    const patch = { role: r, admin: r === 'admin' };
    const canExec = r === 'admin' || r === 'he';
    if (!canExec && (this.state.page === 'overview' || this.state.page === 'approvals')) patch.page = 'dash';
    if (r === 'hotel') patch.page = 'hotel';
    else if (this.state.page === 'hotel') patch.page = 'dash';
    this.setState(patch);
  };
  setMyStream = (e) => { const v = e.target.value; const ev = this.state.event; if (!ev) return; const myStreams = { ...(this.state.myStreams || {}), [ev]: v }; this.persist('wef_mystream', myStreams); this.setState({ myStreams }); };
  canEditTeam(teamId) { const r = this.state.role || 'inputter'; if (r === 'admin') return true; if (r === 'inputter') return (this.state.myStreams || {})[this.state.event] === teamId; if (r === 'lead') return this._leadStreams().indexOf(teamId) !== -1; return false; }
  openEdit = (i) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ editIdx: i, detailIdx: null }); };
  closeEdit = () => this.setState({ editIdx: null });
  openDetail = (i) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ detailIdx: i }); };
  openDetailGuard = (i) => (e) => { if (e && e.target && e.target.closest && e.target.closest('button,select,input,textarea,form,.leadav,.memav')) return; this.setState({ detailIdx: i }); };
  closeDetail = () => this.setState({ detailIdx: null });
  moveMemberFn = (fromIdx, id) => (e) => {
    const toIdx = Number(e.target.value);
    if (toIdx === fromIdx || Number.isNaN(toIdx)) return;
    const members = { ...this.state.members };
    const mv = (members[fromIdx] || []).find(m => m.id === id);
    if (!mv) return;
    members[fromIdx] = (members[fromIdx] || []).filter(m => m.id !== id);
    members[toIdx] = [...(members[toIdx] || []), mv];
    this.persist('wef_members', members);
    this.setState({ members });
  };
  saveEditFn = (e) => {
    e.preventDefault(); const f = new FormData(e.target); const i = this.state.editIdx;
    const ov = { o: f.get('o'), p: Math.max(0, Math.min(100, Number(f.get('p')) || 0)), s: f.get('s'), a: f.get('a'), b: f.get('b'), x: f.get('x'), d: f.get('d') };
    const edits = { ...this.state.edits, [i]: ov };
    this.persist('wef_edits', edits);
    this.setState({ edits, editIdx: null });
  };
  addMemberFn = (i) => (e) => {
    e.preventDefault(); const f = new FormData(e.target); const name = (f.get('name') || '').trim(); if (!name) return;
    const roleKey = f.get('role') || 'member';
    const list = [...(this.state.members[i] || []), { id: 'm' + Date.now(), n: [name, name], roleKey }];
    const members = { ...this.state.members, [i]: list };
    this.persist('wef_members', members);
    e.target.reset();
    this.setState({ members });
  };
  removeMemberFn = (i, id) => () => {
    const list = (this.state.members[i] || []).filter(m => m.id !== id);
    const members = { ...this.state.members, [i]: list };
    this.persist('wef_members', members);
    this.setState({ members });
  };
  pickPhoto = (id) => () => {
    if (!this.state.admin) return;
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => { const photos = { ...this.state.photos, [id]: r.result }; this.persist('wef_photos', photos); this.setState({ photos }); }; r.readAsDataURL(file); };
    inp.click();
  };
  getOrder = () => this.state.order && this.state.order.length === this.WS.length ? this.state.order : this.WS.map((_, i) => i);
  moveTeamFn = (wsIdx, dir) => () => {
    const ord = [...this.getOrder()]; const p = ord.indexOf(wsIdx); const np = p + dir;
    if (np < 0 || np >= ord.length) return;
    [ord[p], ord[np]] = [ord[np], ord[p]];
    this.persist('wef_order', ord);
    this.setState({ order: ord });
  };
  goUpdateFn = (wsName) => () => { this.setState({ page: 'submit', submitWs: wsName, detailIdx: null }); window.scrollTo(0, 0); };
  resetData = () => {
    ['wef_edits', 'wef_photos', 'wef_order', 'wef_members', 'wef_deptedits', 'wef_deptmembers'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    this.setState({ edits: {}, photos: {}, order: null, members: this.seedMembers(), deptEdits: {}, deptMembers: this.seedDeptMembers() });
  };
  STREAM_LEADS = [
    { id: 'ali', n: 'Ali Essa', streams: ['d1', 'd6', 'agm-1', 'agm-2', 'agm-5'] },
    { id: 'shaima', n: 'Shaima Khammas', streams: ['d2', 'd8', 'agm-3', 'agm-4', 'agm-11'] },
    { id: 'shamlan', n: 'Shamlan Al Ameri', streams: ['d4', 'd12', 'agm-10', 'agm-12', 'agm-13'] },
    { id: 'khawla', n: 'Khawla Belqaizi', streams: ['d7', 'd9', 'd11', 'agm-6', 'agm-8'] },
    { id: 'obada', n: 'Obada Shorrab', streams: ['d5', 'd10', 'agm-7', 'agm-9'] }
  ];
  _leadStreams() { const L = this.STREAM_LEADS.find(x => x.id === (this.state.leadId || 'ali')); return L ? L.streams : []; }
  setLead = (e) => { const v = e.target.value; this.persist('wef_lead', v); this.setState({ leadId: v }); };
  seedUsers = () => [
    { id: 'u1', n: 'Local Admin', email: 'admin@moca.gov.ae', role: 'admin', stream: '', pass: '', last: null },
    { id: 'u2', n: 'Khawla Alsuwaidi', email: 'khawla.alsuwaidi@moca.gov.ae', role: 'admin', stream: '', pass: '', last: null },
    { id: 'u3', n: 'Ali Essa', email: 'ali.essa@moca.gov.ae', role: 'lead', stream: '', pass: '', last: null },
    { id: 'u4', n: 'Shaima Khammas', email: 'shaima.khammas@moca.gov.ae', role: 'lead', stream: '', pass: '', last: null },
    { id: 'u5', n: 'Suhail AlHarthi', email: 'suhail.alharthi@moca.gov.ae', role: 'inputter', stream: '', pass: '', last: null },
    { id: 'u6', n: 'Team Account', email: 'team@moca.gov.ae', role: 'inputter', stream: '', pass: '', last: null },
    { id: 'u7', n: 'Stream Lead Account', email: 'lead@moca.gov.ae', role: 'lead', stream: '', pass: '', last: null },
    { id: 'u8', n: 'Hotel Desk', email: 'hotel@moca.gov.ae', role: 'hotel', stream: '', pass: '', last: null },
    { id: 'u9', n: 'H.E. Office', email: 'he@moca.gov.ae', role: 'he', stream: '', pass: '', last: null }
  ];
  mgmtUpdateUser = (id, patch) => { const users = (this.state.users || []).map(u => u.id === id ? { ...u, ...patch } : u); this.persist('wef_users', users); this.setState({ users }); };
  mgmtSetRole = (id) => (e) => { const v = e.target.value; this.mgmtUpdateUser(id, { role: v, ...(v === 'lead' || v === 'inputter' ? {} : { stream: '' }) }); };
  mgmtSetStream = (id) => (e) => { this.mgmtUpdateUser(id, { stream: e.target.value }); };
  mgmtTypePass = (id) => (e) => { this.mgmtUpdateUser(id, { pass: e.target.value }); };
  mgmtGenPass = (id) => () => { const p = Math.random().toString(36).slice(2, 8) + '!' + Math.floor(Math.random() * 90 + 10); this.mgmtUpdateUser(id, { pass: p }); };
  seedDeptMembers = () => { const out = {}; [...this.DEPTS, ...this.AGM_DEPTS].forEach(d => { out[d.id] = d.mem.map(m => ({ id: m.id, n: m.n, r: m.r })); }); return out; };
  openTeam = (id) => (e) => { if (e && e.target && e.target.closest && e.target.closest('button,select,input,textarea,form,.leadav')) return; this.setState({ teamView: id, page: 'dash', sel: {}, taskFull: false }); window.scrollTo(0, 0); };
  closeTeam = () => { this.setState({ teamView: null, sel: {}, wfAdd: false, wfRemove: false, taskFull: false }); window.scrollTo(0, 0); };
  openTaskFull = (id) => () => { this.setState({ taskFull: true }); window.scrollTo(0, 0); };
  closeTaskFull = () => { this.setState({ taskFull: false }); window.scrollTo(0, 0); };
  openAction = (id, i) => () => this.setState({ actionKey: id + ':' + i });
  closeAction = () => this.setState({ actionKey: null });
  openTaskEdit = (teamId, idx) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ taskEdit: { teamId, idx } }); };
  openTaskAdd = (teamId) => () => this.setState({ taskEdit: { teamId, idx: null } });
  closeTaskEdit = () => this.setState({ taskEdit: null });
  askDeleteTask = () => this.setState(s => ({ taskEdit: s.taskEdit ? { ...s.taskEdit, confirmDel: true } : null }));
  cancelDeleteTask = () => this.setState(s => ({ taskEdit: s.taskEdit ? { ...s.taskEdit, confirmDel: false } : null }));
  confirmDeleteTask = () => {
    const te = this.state.taskEdit; if (!te || te.idx == null) return;
    const taskDel = { ...(this.state.taskDel || {}) };
    taskDel[te.teamId] = [...(taskDel[te.teamId] || []), te.idx];
    this.persist('wef_taskdel', taskDel);
    this.setState({ taskDel, taskEdit: null });
    this.flashToast(this.state.lang === 'ar' ? 'تم حذف المهمة' : 'Task deleted');
  };
  saveTaskEdit = (e) => {
    e.preventDefault();
    const te = this.state.taskEdit; if (!te) return;
    const f = new FormData(e.target); const g = k => (f.get(k) || '').trim();
    const tt = g('t'); if (!tt) return;
    const dRaw = g('d');
    const dDisp = (() => { if (!dRaw) return '—'; const p = dRaw.split('-'); if (p.length !== 3) return dRaw; const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(p[1]) - 1] || ''; return Number(p[2]) + ' ' + mo + ' ' + p[0]; })();
    const vals = { t: [tt, tt], o: g('o') || '—', s: f.get('s') || 'g', pr: f.get('pr') || 'm', ap: f.get('ap') || 'nr', mt: f.get('hasMt') ? { rec: g('mtRec'), pur: g('mtPur'), loc: g('mtLoc'), d: g('mtDate'), tm: g('mtTime') } : null, d: dDisp, nx: [g('nx') || '—', g('nx') || '—'] };
    if (te.idx == null) {
      const tasks = { ...(this.state.tasks || {}) };
      tasks[te.teamId] = [...(tasks[te.teamId] || []), { ...vals, dep: ['—', '—'] }];
      this.persist('wef_tasks', tasks);
      this.setState({ tasks, taskEdit: null });
    } else {
      const taskOv = { ...(this.state.taskOv || {}) };
      taskOv[te.teamId] = { ...(taskOv[te.teamId] || {}), [te.idx]: vals };
      this.persist('wef_taskov', taskOv);
      this.setState({ taskOv, taskEdit: null });
    }
  };
  openBlock = (di, bi) => () => this.setState({ agendaKey: di + ':' + bi });
  closeAgenda = () => this.setState({ agendaKey: null });
  toggleTlMode = () => this.setState({ tlMode: !this.state.tlMode, tlKey: null, tlDayKey: null });
  openTlBlock = (di, bi) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ tlKey: di + ':' + bi, tlDayKey: null }); };
  openTlDay = (di) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ tlDayKey: String(di), tlKey: null }); };
  closeTl = () => this.setState({ tlKey: null, tlDayKey: null });
  _tlStore() { const ev = this.state.event || 'wef'; const cur = (this.state.tlEdits || {})[ev] || {}; return { blocks: { ...(cur.blocks || {}) }, days: { ...(cur.days || {}) } }; }
  _saveTl(store) { const ev = this.state.event || 'wef'; const all = { ...(this.state.tlEdits || {}), [ev]: store }; this.persist('wef_tledits', all); this.setState({ tlEdits: all }); }
  saveTlBlock = (e) => { e.preventDefault(); const f = new FormData(e.target); const key = this.state.tlKey; const store = this._tlStore(); store.blocks[key] = { time: f.get('time') || '', t: f.get('t') || '', sub: f.get('sub') || '', loc: f.get('loc') || '', team: f.get('team') || '', notes: f.get('notes') || '' }; this._saveTl(store); this.setState({ tlKey: null }); this.flashToast(this.state.lang === 'ar' ? 'تم حفظ الجدول' : 'Timeline updated'); };
  saveTlDay = (e) => { e.preventDefault(); const f = new FormData(e.target); const di = this.state.tlDayKey; const store = this._tlStore(); store.days[di] = { date: f.get('date') || '', day: f.get('day') || '', tagline: f.get('tagline') || '' }; this._saveTl(store); this.setState({ tlDayKey: null }); this.flashToast(this.state.lang === 'ar' ? 'تم حفظ الجدول' : 'Timeline updated'); };
  openTeamPdf = (id) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ pdfKey: id }); };
  closePdf = () => this.setState({ pdfKey: null });
  downloadTeamPdf = (d) => () => {
    const w = window.open('', '_blank');
    if (!w) { this.flashToast(d.ar ? 'يرجى السماح بالنوافذ المنبثقة لتنزيل ملف PDF.' : 'Please allow pop-ups to download the PDF.'); return; }
    w.document.open(); w.document.write(d.html); w.document.close();
    const go = () => { try { w.focus(); w.print(); } catch (e) {} };
    if (w.document.readyState === 'complete') setTimeout(go, 400); else w.onload = () => setTimeout(go, 400);
  };
  shareTeamPdfNative = (d) => async () => {
    try {
      if (navigator.share) { await navigator.share({ title: d.shareTitle, text: d.shareText + '\n\n' + d.link }); }
      else { this.flashToast(d.ar ? 'المشاركة المباشرة غير مدعومة — استخدم تنزيل PDF.' : 'Direct share is not supported here — use Download PDF instead.'); }
    } catch (e) {}
  };
  teamPdfHtml(d) {
    const ar = d.ar;
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const SC = { g: '#1F8A5B', a: '#B9821C', r: '#C0392B' };
    const SB = { g: '#E7F3EC', a: '#FAF1DE', r: '#F7E7E4' };
    const col = SC[d.s] || '#1B66C9', colb = SB[d.s] || '#EAF1FB';
    const L = d.L;
    const initOf = n => String(n || '').trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
    const SC2 = { n: '#5A6A83', p: '#2C64A8', a: '#B9821C', g: '#1F8A5B' };
    const SB2 = { n: '#EEF1F6', p: '#E7EEF8', a: '#FAF1DE', g: '#E7F3EC' };
    const APC = { req: '#B9821C', nr: '#5A6A83', pend: '#2C64A8' };
    const APB = { req: '#FAF1DE', nr: '#EEF1F6', pend: '#E7EEF8' };
    const wfCards = (d.wf || []).map(p => '<div class="wfp"><div class="wfav">' + esc(initOf(p.n)) + '</div><div class="wfn">' + esc(p.n) + '</div><div class="wfr">' + esc(p.role) + '</div></div>').join('');
    const actRows = (d.actions || []).length ? (d.actions || []).map(a => '<tr><td class="a-t">' + esc(a.t) + '</td><td>' + esc(a.o) + '</td><td><span class="tag" style="color:' + (SC2[a.sk] || col) + ';background:' + (SB2[a.sk] || colb) + '">' + esc(a.sl) + '</span></td><td><span class="tag" style="color:' + (APC[a.apK] || '#5A6A83') + ';background:' + (APB[a.apK] || '#EEF1F6') + '">' + esc(a.apL) + '</span></td><td>' + esc(a.d) + '</td><td>' + esc(a.nx) + '</td><td>' + esc(a.ch) + '</td></tr>').join('') : '<tr><td colspan="7" class="muted" style="text-align:center;padding:14px">—</td></tr>';
    const css = '@page{size:A4;margin:14mm 13mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font-family:"Helvetica Neue",Helvetica,Arial,"Segoe UI",sans-serif;color:#16233A;font-size:11px;line-height:1.5}'
      + '.wrap{max-width:760px;margin:0 auto;padding:6px 2px}'
      + '.top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:2px solid ' + '#1B66C9' + ';padding-bottom:14px}'
      + '.brand{display:flex;gap:12px;align-items:center}'
      + '.logo{width:44px;height:44px;border-radius:10px;background:#0F2440;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px;overflow:hidden;flex:none}'
      + '.logo img{width:100%;height:100%;object-fit:cover}'
      + '.ev{font-size:15px;font-weight:700;color:#0F2440;letter-spacing:-.01em}'
      + '.evsub{font-size:10px;color:#5A6A83;margin-top:3px;text-transform:uppercase;letter-spacing:.08em;font-weight:600}'
      + '.gen{font-size:9.5px;color:#5A6A83;text-align:' + (ar ? 'left' : 'right') + ';white-space:nowrap}'
      + '.gen b{display:block;color:#16233A;font-size:10.5px;margin-top:2px}'
      + '.hero{margin-top:18px;display:flex;justify-content:space-between;align-items:flex-end;gap:18px}'
      + '.tname{font-size:23px;font-weight:700;color:#0F2440;letter-spacing:-.02em;line-height:1.15}'
      + '.hmeta{display:flex;gap:8px;align-items:center;margin-top:9px;flex-wrap:wrap}'
      + '.pill{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;padding:4px 11px;border-radius:999px;color:' + col + ';background:' + colb + '}'
      + '.pill .d{width:6px;height:6px;border-radius:50%;background:' + col + '}'
      + '.hstat{display:flex;gap:26px;text-align:' + (ar ? 'right' : 'left') + '}'
      + '.hk{font-size:9px;color:#5A6A83;text-transform:uppercase;letter-spacing:.07em;font-weight:600}'
      + '.hv{font-size:19px;font-weight:700;color:#0F2440;margin-top:3px;line-height:1}'
      + '.sec{margin-top:20px;break-inside:avoid}'
      + '.sh{font-size:11px;font-weight:700;color:#1B66C9;text-transform:uppercase;letter-spacing:.08em;padding-bottom:7px;border-bottom:1px solid #E2E8F2;margin-bottom:11px}'
      + '.cols{display:flex;gap:24px}.cols>div{flex:1;min-width:0}'
      + '.lead{display:flex;gap:10px;align-items:center;padding:9px 12px;border:1px solid #E2E8F2;border-radius:10px;background:#F8FAFD}'
      + '.lav{width:34px;height:34px;border-radius:8px;background:#EAF1FB;color:#1B66C9;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex:none}'
      + '.ln{font-size:12px;font-weight:700;color:#0F2440}.lr{font-size:9.5px;color:#5A6A83;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-top:2px}'
      + '.bul{display:flex;gap:8px;align-items:flex-start;padding:3px 0;font-size:10.5px}'
      + '.bul .bd{width:5px;height:5px;border-radius:50%;flex:none;margin-top:6px}'
      + '.muted{color:#8494AC;font-size:10.5px}'
      + 'table{width:100%;border-collapse:collapse}'
      + '.wfgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px 12px}'
      + '.wfp{text-align:center}'
      + '.wfav{width:46px;height:46px;border-radius:50%;background:#EAF1FB;color:#1B66C9;border:2px solid #1B66C9;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 7px}'
      + '.wfn{font-size:10.5px;font-weight:700;color:#0F2440;line-height:1.3}'
      + '.wfr{font-size:9px;color:#5A6A83;margin-top:2px;line-height:1.3}'
      + '.at{margin-top:6px}.at th{font-size:8.5px;text-transform:uppercase;letter-spacing:.05em;color:#5A6A83;text-align:' + (ar ? 'right' : 'left') + ';padding:0 8px 7px;border-bottom:1px solid #E2E8F2;font-weight:700}'
      + '.at td{padding:8px;border-bottom:1px solid #EDF1F7;font-size:9.5px;vertical-align:top}.at .a-t{font-weight:600;color:#0F2440}'
      + '.tag{display:inline-block;font-size:8.5px;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap}'
      + '.foot{margin-top:26px;padding-top:16px;border-top:1px solid #E2E8F2;display:flex;justify-content:center}'
      + '.openbtn{display:inline-block;background:#1B66C9;color:#fff;font-size:11px;font-weight:700;padding:11px 26px;border-radius:10px;text-decoration:none;letter-spacing:.02em}';
    const html = '<!DOCTYPE html><html dir="' + (ar ? 'rtl' : 'ltr') + '" lang="' + (ar ? 'ar' : 'en') + '"><head><meta charset="utf-8"><title>' + esc(d.fname.replace(/\.pdf$/, '')) + '</title><style>' + css + '</style></head><body><div class="wrap">'
      + '<div class="top"><div class="brand"><div class="logo">' + (d.logo ? '<img src="' + esc(d.logo) + '" alt="">' : esc(d.evInit)) + '</div><div><div class="ev">' + esc(d.eventName) + '</div><div class="evsub">' + esc(L.secv) + (d.period ? ' · ' + esc(d.period) : '') + '</div></div></div><div class="gen">' + esc(L.generated) + '<b>' + esc(d.genAt) + '</b></div></div>'
      + '<div class="hero"><div><div class="tname">' + esc(d.n) + '</div><div class="hmeta"><span class="pill"><span class="d"></span>' + esc(d.sl) + '</span><span class="muted">' + esc(L.upd) + ': ' + esc(d.u) + '</span>' + (d.delay ? '<span class="pill" style="color:#C0392B;background:#F7E7E4"><span class="d" style="background:#C0392B"></span>' + esc(L.delayFlag) + '</span>' : '') + '</div></div>'
      + '<div class="hstat"><div><div class="hk">' + esc(L.prog) + '</div><div class="hv">' + d.p + '%</div></div><div><div class="hk">' + esc(L.due) + '</div><div class="hv">' + esc(d.due) + '</div></div></div></div>'
      + '<div class="sec"><div class="sh">' + esc(L.workforce) + '</div><div class="wfgrid">' + wfCards + '</div></div>'
      + '<div class="sec"><div class="sh">' + esc(L.opTracker) + '</div><table class="at"><thead><tr><th>' + esc(L.action) + '</th><th>' + esc(L.owner) + '</th><th>' + esc(L.status) + '</th><th>' + esc(L.approval) + '</th><th>' + esc(L.due) + '</th><th>' + esc(L.nextSteps) + '</th><th>' + esc(L.challenges) + '</th></tr></thead><tbody>' + actRows + '</tbody></table></div>'
      + '<div class="foot"><a class="openbtn" href="' + esc(d.link) + '">' + esc(L.openTracker) + '</a></div>'
      + '</div></body></html>';
    return html;
  }
  buildCalDownload(title, dateEn, timeStr, loc, notes) {
    return () => {
      const M = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      const md = (dateEn || '').match(/(\d{1,2})\s+([A-Za-z]{3})/);
      const day = md ? +md[1] : 13, mon = md ? M[md[2]] : 9, yr = 2026;
      const parts = (timeStr || '').replace(/[\u2013\u2014]/g, '-').split('-').map(s => s.trim());
      const pt = t => { const m = (t || '').match(/(\d{1,2}):(\d{2})/); return m ? [+m[1], +m[2]] : null; };
      const s = pt(parts[0]) || [9, 0]; const e = parts[1] ? pt(parts[1]) : null;
      const pad = n => String(n).padStart(2, '0');
      const toUTC = (h, mi) => new Date(Date.UTC(yr, mon, day, h - 4, mi));
      const sdt = toUTC(s[0], s[1]); const edt = e ? toUTC(e[0], e[1]) : new Date(sdt.getTime() + 3600000);
      const fmt = dt => dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()) + 'T' + pad(dt.getUTCHours()) + pad(dt.getUTCMinutes()) + '00Z';
      const esc = v => String(v || '').replace(/[,;\\]/g, x => '\\' + x).replace(/\n/g, '\\n');
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MOCA//Events Tracker//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@moca.gov.ae', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(sdt), 'DTEND:' + fmt(edt), 'SUMMARY:' + esc(title), 'LOCATION:' + esc(loc), 'DESCRIPTION:' + esc(notes), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' }); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = (title || 'session').replace(/[^\w]+/g, '_') + '.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }
  icon = (type) => {
    const P = {
      plane: ['M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z'],
      sessions: ['M3 4.5h18v11H3z', 'M12 15.5v4', 'M8 19.5h8'],
      culture: ['M9 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6', 'M3.5 20a5.5 5.5 0 0 1 11 0', 'M16.5 11a2.5 2.5 0 1 0 0-5', 'M15.5 14.2A4.5 4.5 0 0 1 21 20'],
      dining: ['M6 3v18', 'M4 3v5a2 2 0 0 0 4 0V3', 'M18 3c-1.6 0-2.6 2-2.6 5s1 4 2.6 4v9'],
      ceremony: ['M12 3.5l2.6 5.3 5.8.9-4.2 4.1 1 5.8L12 22l-5.2 2.6 1-5.8L3.6 9.7l5.8-.9z'],
      doc: ['M6 3h9l4 4v14H6z', 'M15 3v4h4', 'M9 11h6', 'M9 15h6'],
      passport: ['M5 3h14v18H5z', 'M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6', 'M9 16h6'],
      bed: ['M3 6v12', 'M3 14h18v4', 'M21 14v-3a2 2 0 0 0-2-2H9v5', 'M6 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3'],
      car: ['M5 16v3.5h2.5V18h9v1.5H19V16', 'M5 16l1.4-5a2 2 0 0 1 1.9-1.5h7.4a2 2 0 0 1 1.9 1.5L19 16z', 'M8 13h.01', 'M16 13h.01'],
      palette: ['M12 3a9 9 0 1 0 0 18c1.2 0 2-.9 2-2 0-.6-.3-1-.3-1.6 0-1.2 1-2.3 2.3-2.4H18a3 3 0 0 0 3-3c0-5-4-9-9-9', 'M7.5 10.5h.01', 'M12 7.5h.01', 'M16.5 10.5h.01'],
      music: ['M9 18a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7', 'M12.5 14.5L19 5', 'M19 5l1.7 1.7'],
      dot: ['M12 12h.01']
    };
    const paths = P[type] || P.dot;
    return React.createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }, paths.map((d, i) => React.createElement('path', { key: i, d })));
  };

  OPS_UPDATES = [
    { ic: 'doc', n: ['MOU', 'مذكرة التفاهم'], items: [
      ['Operational documents: pending with WEF.', 'الوثائق التشغيلية: معلّقة لدى المنتدى.'],
      ['MOU document: pending with WEF.', 'وثيقة مذكرة التفاهم: معلّقة لدى المنتدى.'] ] },
    { ic: 'passport', n: ['Visa', 'التأشيرات'], items: [
      ['Visa issuance will begin in mid-September.', 'يبدأ إصدار التأشيرات منتصف سبتمبر.'] ] },
    { ic: 'plane', n: ['Flights', 'الطيران'], items: [
      ['Emirates to confirm the 25% discount; contract has been signed.', 'طيران الإمارات ستؤكد خصم 25٪، وقد تم توقيع العقد.'] ] },
    { ic: 'bed', n: ['Accommodation', 'الإقامة'], items: [
      ['Accommodation for all guests is confirmed.', 'تم تأكيد الإقامة لجميع الضيوف.'],
      ['Contracts are confirmed.', 'تم تأكيد العقود.'] ] },
    { ic: 'dining', n: ['Gala Dinner & Farewell Reception', 'العشاء الرسمي وحفل الوداع'], items: [
      ['Venue selection and food tasting arrangements for the gala dinner are underway.', 'جارٍ اختيار المكان وترتيبات تذوق الطعام للعشاء الرسمي.'],
      ['Emirati food experience proposal will be provided by Wednesday.', 'سيُقدَّم مقترح تجربة الطعام الإماراتي يوم الأربعاء.'],
      ['Giveaways, reception dinner and closing dinner proposals under process.', 'مقترحات الهدايا وعشاء الاستقبال والعشاء الختامي قيد الإجراء.'] ] },
    { ic: 'music', n: ['Emirati Cultural Performance', 'العرض الثقافي الإماراتي'], items: [
      ['Studying the options; to be shared by Tuesday.', 'تجري دراسة الخيارات وستُشارَك يوم الثلاثاء.'] ] },
    { ic: 'palette', n: ['Opening Ceremony', 'حفل الافتتاح'], items: [
      ['Studying the options; to be shared by Thursday.', 'تجري دراسة الخيارات وستُشارَك يوم الخميس.'] ] },
    { ic: 'car', n: ['Transportation', 'النقل'], items: [
      ['Airport–hotel transportation will be through Marhaba. Airport transportation done; contract under process.', 'النقل من المطار إلى الفندق عبر «مرحبا». نقل المطار منجز والعقد قيد الإجراء.'],
      ['Transportation for cultural activities and the gala dinner is currently under tender.', 'نقل الفعاليات الثقافية والعشاء الرسمي قيد المناقصة حالياً.'],
      ['Waiting for WEF to share the transportation plan after confirming the venue.', 'بانتظار مشاركة المنتدى خطة النقل بعد تأكيد المكان.'] ] },
    { ic: 'sessions', n: ['IT', 'تقنية المعلومات'], items: [
      ['Planning stage of infrastructure.', 'مرحلة التخطيط للبنية التحتية.'] ] },
    { ic: 'ceremony', n: ['Branding', 'الهوية والعلامة'], items: [
      ['Updated branding kit. No major layout changes; updated layout to be shared.', 'تحديث حزمة الهوية. لا تغييرات كبيرة على التصميم وسيُشارَك التصميم المحدّث.'] ] }
  ];

  DEPT_META = {
    d1: { p: 68, due: '11 Jul', delay: false, actions: [
      { t: ['Finalise stakeholder contact matrix', 'استكمال مصفوفة جهات الاتصال'], o: 'Ali Essa', s: 'g', pr: 'm', d: '08 Jul', dep: ['—', '—'], nx: ['Publish matrix to department leads', 'نشر المصفوفة لقادة الإدارات'], up: ['Matrix drafted across all 11 departments', 'إعداد المصفوفة عبر 11 إدارة'], ch: ['Two final confirmations outstanding', 'بانتظار تأكيدين نهائيين'] },
      { t: ['Communications toolkit sign-off', 'اعتماد حزمة التواصل'], o: 'Ali Essa', s: 'a', pr: 'h', d: '09 Jul', dep: ['Leadership approval', 'موافقة القيادة'], nx: ['Circulate approved bilingual messaging', 'تعميم الرسائل المعتمدة'], up: ['Bilingual toolkit prepared for review', 'تجهيز الحزمة للمراجعة'], ch: ['Awaiting leadership sign-off', 'بانتظار اعتماد القيادة'] },
      { t: ['Maintain weekly communications rhythm', 'الحفاظ على إيقاع التواصل الأسبوعي'], o: 'Khawla Alsuwaidi', s: 'g', pr: 'l', d: '07 Jul', dep: ['—', '—'], nx: ['Issue Wednesday executive rollup', 'إصدار تقرير الأربعاء التنفيذي'], up: ['Weekly plan approved by leadership', 'اعتماد الخطة الأسبوعية'], ch: ['None', 'لا يوجد'] }
    ] },
    d2: { p: 52, due: '10 Jul', delay: true, actions: [
      { t: ['Confirm gala dinner venue', 'تأكيد مكان العشاء الرسمي'], o: 'Shaima Khammas', s: 'r', pr: 'h', d: '10 Jul', dep: ['Madinat Jumeirah cap', 'سقف مدينة جميرا'], nx: ['Confirm venue under existing cap', 'تأكيد المكان ضمن السقف'], up: ['Shortlist reduced to Madinat Jumeirah', 'حصر الخيارات في مدينة جميرا'], ch: ['Decision blocks transport & invitations', 'القرار يعطل النقل والدعوات'] },
      { t: ['Complete food tasting & lock set menu', 'إتمام تذوق الطعام واعتماد القائمة'], o: 'Bader Ahmad', s: 'a', pr: 'm', d: '08 Jul', dep: ['Venue confirmation', 'تأكيد المكان'], nx: ['Finalise set menu after tasting', 'اعتماد القائمة بعد التذوق'], up: ['Food tasting scheduled Tuesday', 'جدولة التذوق الثلاثاء'], ch: ['Menu tied to venue decision', 'القائمة مرتبطة بقرار المكان'] },
      { t: ['Confirm hospitality F&B corners', 'تأكيد أركان الضيافة'], o: 'Shaima Khammas', s: 'g', pr: 'l', d: '12 Jul', dep: ['—', '—'], nx: ['Finalise daily coffee & tea corners', 'استكمال أركان القهوة اليومية'], up: ['Emirati hospitality approvals complete', 'اكتمال موافقات الضيافة'], ch: ['None', 'لا يوجد'] }
    ] },
    d3: { p: 70, due: '12 Jul', delay: false, actions: [
      { t: ['Circulate updated brand layout', 'تعميم التصميم المحدّث'], o: 'Sumaya AlHakim', s: 'g', pr: 'm', d: '08 Jul', dep: ['—', '—'], nx: ['Approve layout for production', 'اعتماد التصميم للإنتاج'], up: ['Branding kit updated; layout stable', 'تحديث حقيبة الهوية والتصميم مستقر'], ch: ['None', 'لا يوجد'] },
      { t: ['Finalise signage & welcome-card files', 'استكمال ملفات اللوحات وبطاقات الترحيب'], o: 'Maria Ahli', s: 'a', pr: 'm', d: '12 Jul', dep: ['Gala venue', 'مكان العشاء'], nx: ['Send production files to vendor', 'إرسال ملفات الإنتاج للمزود'], up: ['Screens & signage scope defined', 'تحديد نطاق الشاشات واللوحات'], ch: ['Dinner branding awaits venue', 'هوية العشاء بانتظار المكان'] },
      { t: ['Complete venue security check', 'إتمام التدقيق الأمني للموقع'], o: 'Maitha Thani', s: 'a', pr: 'h', d: '10 Jul', dep: ['Madinat Jumeirah access', 'دخول مدينة جميرا'], nx: ['Begin on-site security checks', 'بدء الفحوصات في الموقع'], up: ['Coordination channel established', 'فتح قناة التنسيق'], ch: ['Awaiting access windows', 'بانتظار مواعيد الدخول'] }
    ] },
    d4: { p: 50, due: '10 Jul', delay: false, actions: [
      { t: ['Hold Dubai Police coordination meeting', 'عقد اجتماع التنسيق مع شرطة دبي'], o: 'Ahmad Ali', s: 'a', pr: 'h', d: '10 Jul', dep: ['—', '—'], nx: ['Schedule and hold the meeting', 'جدولة الاجتماع وعقده'], up: ['Agenda prepared with security scope', 'تجهيز الأجندة ونطاق الأمن'], ch: ['Meeting not yet held', 'لم يُعقد بعد'] },
      { t: ['Award cultural & gala transport tender', 'ترسية مناقصة النقل'], o: 'Abdulaziz Almeqbali', s: 'a', pr: 'h', d: '24 Jul', dep: ['Gala venue decision', 'قرار مكان العشاء'], nx: ['Award within 5 days of venue', 'الترسية خلال 5 أيام من تأكيد المكان'], up: ['Tender documents issued', 'إصدار وثائق المناقصة'], ch: ['Award tied to venue confirmation', 'الترسية مرتبطة بتأكيد المكان'] },
      { t: ['Confirm shuttle coverage scope', 'تأكيد نطاق تغطية الحافلات'], o: 'Mohamed Elmarzouki', s: 'g', pr: 'm', d: '12 Jul', dep: ['WEF transport plan', 'خطة نقل المنتدى'], nx: ['Confirm scope with Metropolitan', 'تأكيد النطاق مع متروبوليتان'], up: ['Airport transfers arranged via Marhaba', 'ترتيب نقل المطار عبر مرحبا'], ch: ['WEF plan not yet shared', 'خطة المنتدى لم تُشارك'] }
    ] },
    d5: { p: 55, due: '08 Jul', delay: false, actions: [
      { t: ['Present consolidated budget at rollup', 'عرض الميزانية الموحدة'], o: 'Obada Shorrab', s: 'a', pr: 'h', d: '08 Jul', dep: ['—', '—'], nx: ['Present at Wednesday rollup', 'العرض في تقرير الأربعاء'], up: ['Consolidated position prepared', 'تجهيز الموقف الموحد'], ch: ['Open lines pending decisions', 'بنود مفتوحة بانتظار القرار'] },
      { t: ['Secure giveaways budget — AED 60,000', 'اعتماد ميزانية الهدايا — 60,000 درهم'], o: 'Hessa AlHosani', s: 'a', pr: 'm', d: '08 Jul', dep: ['Management sign-off', 'اعتماد الإدارة'], nx: ['Obtain sign-off; release order', 'الحصول على الاعتماد وإصدار الأمر'], up: ['Costed at 400 × AED 150', 'بتكلفة 400 × 150 درهماً'], ch: ['Awaiting management approval', 'بانتظار اعتماد الإدارة'] },
      { t: ['Close flights & accommodation lines', 'إغلاق بنود الطيران والإقامة'], o: 'Majed BinHadher', s: 'g', pr: 'l', d: '07 Jul', dep: ['—', '—'], nx: ['Record final commitments', 'تسجيل الالتزامات النهائية'], up: ['Flights committed (AED 2.7M)', 'التزام الطيران (2.7 مليون درهم)'], ch: ['None', 'لا يوجد'] }
    ] },
    d6: { p: 62, due: '01 Aug', delay: false, actions: [
      { t: ['Confirm rehearsal schedule with troupes', 'تأكيد جدول البروفات مع الفرق'], o: 'Shamlan AlAmeri', s: 'g', pr: 'm', d: '31 Jul', dep: ['Transport tender', 'مناقصة النقل'], nx: ['Lock rehearsal dates', 'اعتماد مواعيد البروفات'], up: ['Al Ahila & Al Ayala confirmed', 'تأكيد الأهلة والعيالة'], ch: ['Performer transport dependency', 'اعتماد نقل المؤدين'] },
      { t: ['Open volunteer recruitment', 'فتح باب التطوع'], o: 'Maitha AlFarhan', s: 'a', pr: 'm', d: '01 Aug', dep: ['Protocol usher roles', 'أدوار المرافقين'], nx: ['Publish recruitment call', 'نشر إعلان التطوع'], up: ['Role matrix drafted', 'إعداد مصفوفة الأدوار'], ch: ['Recruitment not yet opened', 'لم يُفتح التسجيل'] },
      { t: ['Align volunteer deployment plan', 'مواءمة خطة توزيع المتطوعين'], o: 'Shamma AlMarri', s: 'g', pr: 'l', d: '05 Aug', dep: ['—', '—'], nx: ['Approve training plan', 'اعتماد خطة التدريب'], up: ['Deployment plan in draft', 'مسودة خطة التوزيع'], ch: ['None', 'لا يوجد'] }
    ] },
    d7: { p: 30, due: '15 Aug', delay: false, actions: [
      { t: ['Complete IT infrastructure plan', 'استكمال خطة البنية التحتية'], o: 'Mohammed Al Yassi', s: 'a', pr: 'h', d: '15 Aug', dep: ['Venue DDR', 'مواصفات الموقع'], nx: ['Finalise plan; follow up on DDR', 'استكمال الخطة والمتابعة'], up: ['Requirements scoped with venue', 'تحديد المتطلبات مع الموقع'], ch: ['Still at planning stage', 'ما زال في التخطيط'] },
      { t: ['Select registration platform', 'اختيار منصة التسجيل'], o: 'Rafi Mohammed', s: 'a', pr: 'm', d: '20 Jul', dep: ['Registration ownership', 'مسؤولية التسجيل'], nx: ['Confirm platform vendor', 'تأكيد مزود المنصة'], up: ['Options under review', 'مراجعة الخيارات'], ch: ['Ownership unresolved', 'المسؤولية غير محسومة'] },
      { t: ['Approve infrastructure budget', 'اعتماد ميزانية البنية التحتية'], o: 'Mohammed Al Yassi', s: 'a', pr: 'm', d: '15 Aug', dep: ['Budgeting', 'الميزانية'], nx: ['Submit budget for approval', 'رفع الميزانية للاعتماد'], up: ['Draft budget prepared', 'تجهيز مسودة الميزانية'], ch: ['Awaiting sign-off', 'بانتظار الاعتماد'] }
    ] },
    d8: { p: 40, due: '09 Jul', delay: false, actions: [
      { t: ['Assign registration ownership', 'إسناد مسؤولية التسجيل'], o: 'Abdulla Ali', s: 'a', pr: 'h', d: '09 Jul', dep: ['Ops Chief decision', 'قرار رئيسة العمليات'], nx: ['Confirm owner with IT support', 'تأكيد المسؤول بدعم تقني'], up: ['Decision paper submitted', 'رفع ورقة القرار'], ch: ['Ownership unassigned', 'المسؤولية غير مسندة'] },
      { t: ['Align ushers & invitation protocol', 'مواءمة المرافقين والدعوات'], o: 'Rafi Mohammed', s: 'a', pr: 'm', d: '12 Jul', dep: ['Registration owner', 'مسؤول التسجيل'], nx: ['Confirm usher roles', 'تأكيد أدوار المرافقين'], up: ['Flow aligned with registration', 'مواءمة المسار مع التسجيل'], ch: ['Depends on registration owner', 'يعتمد على مسؤول التسجيل'] },
      { t: ['Draft VIP protocol framework', 'إعداد إطار مراسم كبار الشخصيات'], o: 'Abdulla Ali', s: 'g', pr: 'l', d: '11 Jul', dep: ['—', '—'], nx: ['Circulate for review', 'التعميم للمراجعة'], up: ['Framework drafted for delegations', 'إعداد الإطار للوفود'], ch: ['None', 'لا يوجد'] }
    ] },
    d9: { p: 65, due: '15 Aug', delay: false, actions: [
      { t: ['Contract interpretation services', 'التعاقد على الترجمة الفورية'], o: 'Khawla Belqaizi', s: 'g', pr: 'm', d: '15 Aug', dep: ['—', '—'], nx: ['Award interpretation vendor', 'ترسية مزود الترجمة'], up: ['Vendor shortlist complete', 'اكتمال القائمة المختصرة'], ch: ['None', 'لا يوجد'] },
      { t: ['Confirm official photography plan', 'تأكيد خطة التصوير الرسمي'], o: 'Mariam AlMarzouqi', s: 'g', pr: 'l', d: '20 Jul', dep: ['—', '—'], nx: ['Assign photography team', 'إسناد فريق التصوير'], up: ['Photography brief approved', 'اعتماد موجز التصوير'], ch: ['None', 'لا يوجد'] },
      { t: ['Prepare document translation queue', 'تجهيز قائمة ترجمة الوثائق'], o: 'Khawla Belqaizi', s: 'g', pr: 'l', d: '01 Aug', dep: ['—', '—'], nx: ['Set turnaround SLAs', 'تحديد مدد الإنجاز'], up: ['Workflow drafted', 'إعداد سير العمل'], ch: ['None', 'لا يوجد'] }
    ] },
    d10: { p: 25, due: '15 Jul', delay: true, actions: [
      { t: ['Escalate WEF MOU signature', 'تصعيد توقيع مذكرة التفاهم'], o: 'Mohammed Sami', s: 'r', pr: 'h', d: '15 Jul', dep: ['Ops Chief approval', 'اعتماد رئيسة العمليات'], nx: ['Send ministerial escalation letter', 'إرسال خطاب التصعيد الوزاري'], up: ['UAE-side review complete', 'اكتمال المراجعة الإماراتية'], ch: ['MOU pending with WEF past target', 'المذكرة معلّقة بعد الموعد'] },
      { t: ['Finalise operational documents', 'استكمال الوثائق التشغيلية'], o: 'Mohammed Bin Suwaidan', s: 'r', pr: 'h', d: '15 Jul', dep: ['MOU signature', 'توقيع المذكرة'], nx: ['Align documents post-signature', 'مواءمة الوثائق بعد التوقيع'], up: ['Documents reviewed UAE-side', 'مراجعة الوثائق إماراتياً'], ch: ['Blocked until MOU signed', 'معلّق حتى توقيع المذكرة'] },
      { t: ['Maintain weekly WEF liaison call', 'عقد اجتماع التنسيق الأسبوعي'], o: 'Mohammed Sami', s: 'a', pr: 'm', d: '09 Jul', dep: ['—', '—'], nx: ['Track signature commitments', 'متابعة التزامات التوقيع'], up: ['Weekly call in place', 'عقد الاجتماع الأسبوعي'], ch: ['No signature commitment yet', 'لا التزام بالتوقيع بعد'] }
    ] },
    d11: { p: 45, due: '20 Jul', delay: false, actions: [
      { t: ['Prepare bilingual release package', 'إعداد الحزمة الإعلامية ثنائية اللغة'], o: 'Yahya Khalid', s: 'a', pr: 'm', d: '20 Jul', dep: ['MOU signature', 'توقيع المذكرة'], nx: ['Finalise package for announcement', 'استكمال الحزمة للإعلان'], up: ['Announcement narrative drafted', 'صياغة سردية الإعلان'], ch: ['Timing tied to MOU', 'التوقيت مرتبط بالمذكرة'] },
      { t: ['Secure press release approval', 'اعتماد البيان الصحفي'], o: 'Mohammed Sulaiman', s: 'a', pr: 'm', d: '20 Jul', dep: ['Communications', 'التواصل'], nx: ['Obtain leadership approval', 'الحصول على اعتماد القيادة'], up: ['Draft aligned with comms', 'مواءمة المسودة مع التواصل'], ch: ['Awaiting MOU to publish', 'بانتظار المذكرة للنشر'] },
      { t: ['Brief media relations contacts', 'إحاطة جهات العلاقات الإعلامية'], o: 'Yahya Khalid', s: 'g', pr: 'l', d: '18 Jul', dep: ['—', '—'], nx: ['Share embargo timeline', 'مشاركة الجدول الزمني'], up: ['Contact list prepared', 'تجهيز قائمة الجهات'], ch: ['None', 'لا يوجد'] }
    ] },
    d12: { p: 40, due: '12 Jul', delay: false, actions: [
      { t: ['Onboard security operations vendor', 'تعاقد مزود عمليات الأمن'], o: 'Abdulrahman Alblooshi', s: 'a', pr: 'h', d: '12 Jul', dep: ['Procurement', 'المشتريات'], nx: ['Complete vendor onboarding', 'استكمال تعاقد المزود'], up: ['Vendor shortlist prepared', 'تجهيز القائمة المختصرة للمزودين'], ch: ['Onboarding blocks penetration testing', 'التعاقد يعطل اختبار الاختراق'] },
      { t: ['Complete penetration testing', 'إتمام اختبار الاختراق'], o: 'Abdulrahman Alblooshi', s: 'a', pr: 'h', d: '15 Jul', dep: ['Vendor onboarding', 'تعاقد المزود'], nx: ['Schedule testing window', 'جدولة نافذة الاختبار'], up: ['Scope defined for event systems', 'تحديد النطاق لأنظمة الحدث'], ch: ['Awaiting vendor onboarding', 'بانتظار تعاقد المزود'] },
      { t: ['Finalise monitoring & incident response', 'استكمال المراقبة والاستجابة للحوادث'], o: 'Abdulrahman Alblooshi', s: 'g', pr: 'm', d: '10 Jul', dep: ['—', '—'], nx: ['Approve response runbook', 'اعتماد دليل الاستجابة'], up: ['Access control plan drafted', 'إعداد خطة التحكم بالوصول'], ch: ['None', 'لا يوجد'] }
    ] }
  };
  AGM_META = {
    'agm-1': { p: 45, due: '—', delay: false, actions: [
      { t: ['Present new app features to PM', 'عرض خصائص التطبيق الجديدة على مدير المشروع'], o: 'Khawla Al Suwaidi', s: 'a', pr: 'm', d: '—', dep: ['PM review', 'مراجعة مدير المشروع'], nx: ['Confirm feature set', 'تأكيد حزمة الخصائص'], up: ['Feature concepts drafted', 'إعداد مفاهيم الخصائص'], ch: ['Awaiting plans & budget clarity', 'بانتظار وضوح الخطط والميزانية'] },
      { t: ['Map integrated guest journey', 'رسم رحلة الضيف المتكاملة'], o: 'Khawla Al Suwaidi', s: 'g', pr: 'l', d: '—', dep: ['—', '—'], nx: ['Share journey with teams', 'مشاركة الرحلة مع الفرق'], up: ['Journey mapped end-to-end', 'رسم الرحلة كاملة'], ch: ['None', 'لا يوجد'] }
    ] },
    'agm-2': { p: 55, due: '—', delay: false, actions: [
      { t: ['Receive final design from People', 'استلام التصميم النهائي من People'], o: 'Sumaya Al Hakim', s: 'a', pr: 'h', d: '—', dep: ['People delivery', 'تسليم People'], nx: ['Confirm minor edits', 'تأكيد التعديلات البسيطة'], up: ['Design direction approved', 'اعتماد توجّه التصميم'], ch: ['Final design pending', 'التصميم النهائي معلّق'] },
      { t: ['Decide council furniture approach', 'تحديد نهج أثاث المجلس'], o: 'Shaima Khammas', s: 'a', pr: 'm', d: '—', dep: ['People proposal', 'مقترح People'], nx: ['Repair or manufacture new', 'إصلاح أو تصنيع جديد'], up: ['Proposal awaited from People', 'بانتظار مقترح People'], ch: ['Decision pending proposal', 'القرار بانتظار المقترح'] }
    ] },
    'agm-3': { p: 40, due: '—', delay: false, actions: [
      { t: ['Approve delegation protocol framework', 'اعتماد إطار مراسم الوفود'], o: 'Abdulla Ali', s: 'a', pr: 'm', d: '—', dep: ['—', '—'], nx: ['Circulate for review', 'التعميم للمراجعة'], up: ['Framework drafted', 'إعداد الإطار'], ch: ['Seating tied to guest list', 'التجليس مرتبط بقائمة الضيوف'] },
      { t: ['Confirm ushering & seating plan', 'تأكيد خطة المرافقة والتجليس'], o: 'Abdulla Ali', s: 'a', pr: 'm', d: '—', dep: ['Guest list', 'قائمة الضيوف'], nx: ['Lock seating chart', 'اعتماد مخطط التجليس'], up: ['Plan aligned with events', 'مواءمة الخطة مع الفعاليات'], ch: ['Awaiting final guest list', 'بانتظار القائمة النهائية'] }
    ] },
    'agm-4': { p: 70, due: '20 Oct', delay: false, actions: [
      { t: ['Hold food tasting; lock set menu', 'إجراء تذوق الطعام واعتماد القائمة'], o: 'Bader Ahmad', s: 'a', pr: 'm', d: '20 Oct', dep: ['Hotel coordination', 'تنسيق الفندق'], nx: ['Confirm menu after tasting', 'اعتماد القائمة بعد التذوق'], up: ['Preliminary date set 20 Oct', 'تحديد موعد أولي 20 أكتوبر'], ch: ['None', 'لا يوجد'] },
      { t: ['Approve distinguished hospitality concept', 'اعتماد مفهوم الضيافة المميزة'], o: 'Oud Al Ali', s: 'a', pr: 'm', d: '—', dep: ['PM review', 'مراجعة مدير المشروع'], nx: ['Present concept to PM', 'عرض المفهوم على مدير المشروع'], up: ['Menu approved with hotel', 'اعتماد القائمة مع الفندق'], ch: ['Concept awaits PM review', 'المفهوم بانتظار المراجعة'] }
    ] },
    'agm-5': { p: 40, due: '—', delay: false, actions: [
      { t: ['Approve contact center staffing', 'اعتماد توظيف مركز الاتصال'], o: 'Shamlan Al Ameri', s: 'a', pr: 'm', d: '—', dep: ['Attendance numbers', 'أعداد الحضور'], nx: ['Confirm shifts', 'تأكيد الورديات'], up: ['Operating model outlined', 'تحديد نموذج التشغيل'], ch: ['Staffing tied to attendance', 'التوظيف مرتبط بالحضور'] },
      { t: ['Finalise crowd deployment plan', 'استكمال خطة توزيع الحشود'], o: 'Shamlan Al Ameri', s: 'a', pr: 'l', d: '—', dep: ['—', '—'], nx: ['Approve deployment', 'اعتماد التوزيع'], up: ['Flow plan drafted', 'إعداد خطة الانسياب'], ch: ['None', 'لا يوجد'] }
    ] },
    'agm-6': { p: 45, due: '—', delay: false, actions: [
      { t: ['Approve assistant feature scope', 'اعتماد نطاق خصائص المساعد'], o: 'Shamma Al Marri', s: 'a', pr: 'm', d: '—', dep: ['Leadership direction', 'توجيه القيادة'], nx: ['Align roadmap with PM', 'مواءمة الخارطة مع مدير المشروع'], up: ['Feature set under review', 'مراجعة حزمة الخصائص'], ch: ['Scope awaits direction', 'النطاق بانتظار التوجيه'] }
    ] },
    'agm-7': { p: 50, due: '—', delay: false, actions: [
      { t: ['Present consolidated budget', 'عرض الموازنة الموحدة'], o: 'Obada Shorrab', s: 'a', pr: 'h', d: '—', dep: ['—', '—'], nx: ['Present at rollup', 'العرض في التقرير'], up: ['Consolidated position prepared', 'تجهيز الموقف الموحد'], ch: ['Lines pending sign-off', 'بنود بانتظار الاعتماد'] },
      { t: ['Record hotel & transport commitments', 'تسجيل التزامات الفنادق والنقل'], o: 'Obada Shorrab', s: 'g', pr: 'l', d: '—', dep: ['—', '—'], nx: ['Update commitments log', 'تحديث سجل الالتزامات'], up: ['Commitments recorded', 'تسجيل الالتزامات'], ch: ['None', 'لا يوجد'] }
    ] },
    'agm-8': { p: 45, due: '—', delay: false, actions: [
      { t: ['Confirm interpretation vendor', 'تأكيد مزود الترجمة الفورية'], o: 'Khawla Belqaizi', s: 'a', pr: 'm', d: '—', dep: ['—', '—'], nx: ['Award vendor', 'ترسية المزود'], up: ['Scope defined', 'تحديد النطاق'], ch: ['Vendor confirmation pending', 'بانتظار تأكيد المزود'] },
      { t: ['Confirm photography team', 'تأكيد فريق التصوير'], o: 'Khawla Belqaizi', s: 'g', pr: 'l', d: '—', dep: ['—', '—'], nx: ['Assign photographers', 'إسناد المصورين'], up: ['Photography scope set', 'تحديد نطاق التصوير'], ch: ['None', 'لا يوجد'] }
    ] },
    'agm-9': { p: 65, due: '—', delay: false, actions: [
      { t: ['Complete St. Regis contract signature', 'إتمام توقيع عقد سانت ريجيس'], o: 'Mohammed Al Marzouqi', s: 'a', pr: 'h', d: '—', dep: ['Hotel sign-off', 'اعتماد الفندق'], nx: ['Finalise signature', 'استكمال التوقيع'], up: ['Contract in signing', 'العقد قيد التوقيع'], ch: ['Signature outstanding', 'التوقيع معلّق'] },
      { t: ['Rotana Hotel contract', 'عقد فندق روتانا'], o: 'Mohammed Al Marzouqi', s: 'g', pr: 'm', d: '—', dep: ['—', '—'], nx: ['Close out contract', 'إغلاق العقد'], up: ['Contract signed', 'توقيع العقد'], ch: ['None', 'لا يوجد'] }
    ] },
    'agm-10': { p: 75, due: '—', delay: false, actions: [
      { t: ['Confirm shuttle & transfer plan', 'تأكيد خطة الحافلات والنقل'], o: 'Abdulaziz Almeqbali', s: 'a', pr: 'm', d: '—', dep: ['Venue confirmation', 'تأكيد المواقع'], nx: ['Finalise routing', 'استكمال المسارات'], up: ['Provider contracted', 'التعاقد مع المزود'], ch: ['Routes tied to venues', 'المسارات مرتبطة بالمواقع'] }
    ] },
    'agm-11': { p: 40, due: '—', delay: false, actions: [
      { t: ['Confirm distributions with PM', 'تأكيد التوزيعات مع مدير المشروع'], o: 'Wadha Mohammed', s: 'a', pr: 'm', d: '—', dep: ['PM approval', 'اعتماد مدير المشروع'], nx: ['Obtain approval; release order', 'الحصول على الاعتماد وإصدار الأمر'], up: ['Options prepared', 'تجهيز الخيارات'], ch: ['Awaiting PM approval', 'بانتظار اعتماد مدير المشروع'] }
    ] },
    'agm-12': { p: 50, due: '—', delay: false, actions: [
      { t: ['Begin on-site security checks', 'بدء الفحوصات الأمنية الميدانية'], o: 'Ahmad Ali', s: 'a', pr: 'h', d: '—', dep: ['Venue access', 'دخول الموقع'], nx: ['Schedule site audits', 'جدولة التدقيق الميداني'], up: ['Audit scope defined', 'تحديد نطاق التدقيق'], ch: ['Awaiting access windows', 'بانتظار مواعيد الدخول'] },
      { t: ['Finalise logistics operations plan', 'استكمال خطة العمليات اللوجستية'], o: 'Rashed Al Falasi', s: 'a', pr: 'm', d: '—', dep: ['—', '—'], nx: ['Approve logistics plan', 'اعتماد الخطة اللوجستية'], up: ['Plan drafted', 'إعداد الخطة'], ch: ['None', 'لا يوجد'] }
    ] },
    'agm-13': { p: 35, due: '—', delay: false, actions: [
      { t: ['Finalise digital infrastructure plan', 'استكمال خطة البنية التحتية الرقمية'], o: 'Mohammed Al Yassi', s: 'a', pr: 'h', d: '—', dep: ['Venue DDR', 'مواصفات الموقع'], nx: ['Complete plan', 'استكمال الخطة'], up: ['Requirements scoped', 'تحديد المتطلبات'], ch: ['Registration ownership open', 'مسؤولية التسجيل مفتوحة'] },
      { t: ['Confirm reservations platform', 'تأكيد منصة الحجوزات'], o: 'Abdulrahman Al Balushi', s: 'a', pr: 'm', d: '—', dep: ['Ownership decision', 'قرار المسؤولية'], nx: ['Select platform', 'اختيار المنصة'], up: ['Options under review', 'مراجعة الخيارات'], ch: ['Ownership to confirm', 'تأكيد المسؤولية'] }
    ] }
  };

  EVENT = [
    { icon: 'plane', date: ['11–12 Oct', '11–12 أكتوبر'], day: ['Guests Arrival', 'وصول الضيوف'],
      desc: ['Delegations arrive and check in at Madinat Jumeirah hotels ahead of Day 0.', 'وصول الوفود وتسجيل الدخول في فنادق مدينة جميرا قبل اليوم صفر.'] },
    { icon: 'sessions', date: ['12 Oct', '12 أكتوبر'], day: ['Day 0', 'اليوم صفر'], blocks: [
      { time: '10:00 – 14:00', icon: 'sessions', t: ['Sessions', 'الجلسات'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Event Management', 'إدارة الفعاليات'], notes: ['Opening working sessions for the Global Future Councils.', 'الجلسات الافتتاحية لمجالس المستقبل العالمية.'] },
      { time: '14:00 – 16:00', icon: 'culture', t: ['Cultural Activation', 'فعالية ثقافية'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Cultural Activities', 'الأنشطة الثقافية'], notes: ['Emirati cultural activation for delegates.', 'فعالية ثقافية إماراتية للمشاركين.'] },
      { time: '19:00 – 21:30', icon: 'dining', t: ['Gala Dinner', 'العشاء الرسمي'], sub: ['Illiana · Marsa Al Arab Hotel', 'إليانا · فندق مرسى العرب'], loc: ['Marsa Al Arab Hotel', 'فندق مرسى العرب'], team: ['Event Management', 'إدارة الفعاليات'], notes: ['Formal gala dinner for delegations and leadership.', 'العشاء الرسمي للوفود والقيادة.'] }
    ] },
    { icon: 'ceremony', date: ['13 Oct', '13 أكتوبر'], day: ['Main Event — Day 1', 'الحدث الرئيسي — اليوم 1'], tagline: ['Emirati cultural performance', 'عرض ثقافي إماراتي'], blocks: [
      { time: '08:00 – 12:30', icon: 'sessions', t: ['Sessions', 'الجلسات'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Event Management', 'إدارة الفعاليات'], notes: ['Morning council sessions.', 'الجلسات الصباحية للمجالس.'] },
      { time: '10:00 – 11:27', icon: 'ceremony', t: ['Opening Ceremony', 'حفل الافتتاح'], loc: ['Main Hall', 'القاعة الرئيسية'], team: ['Opening Ceremony', 'حفل الافتتاح'], notes: ['Al Ahila performance anchors the opening ceremony.', 'عرض الأهلة يتصدّر حفل الافتتاح.'] },
      { time: '14:00 – 16:45', icon: 'sessions', t: ['Sessions & Food Innovation Hub', 'الجلسات ومركز ابتكار الغذاء'], sub: ['Council Meeting', 'اجتماع المجلس'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Event Management', 'إدارة الفعاليات'], notes: ['Afternoon sessions and Food Innovation Hub council meeting.', 'جلسات بعد الظهر واجتماع مركز ابتكار الغذاء.'] },
      { time: '19:00 – 20:45', icon: 'dining', t: ['Community Dinner', 'عشاء المجتمع'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Emirati Hospitality', 'الضيافة الإماراتية'], notes: ['Community dinner with an Emirati hospitality experience.', 'عشاء المجتمع بتجربة الضيافة الإماراتية.'] }
    ] },
    { icon: 'culture', date: ['14 Oct', '14 أكتوبر'], day: ['Main Event — Day 2', 'الحدث الرئيسي — اليوم 2'], blocks: [
      { time: '08:00 – 11:45', icon: 'sessions', t: ['Sessions', 'الجلسات'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Event Management', 'إدارة الفعاليات'], notes: ['Morning council sessions.', 'الجلسات الصباحية للمجالس.'] },
      { time: '12:30 – 13:00', icon: 'dining', t: ['Networking Lunch', 'غداء التواصل'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Event Management', 'إدارة الفعاليات'], notes: ['Networking lunch for delegates.', 'غداء تواصل للمشاركين.'] },
      { time: '13:00 – 16:00', icon: 'sessions', t: ['Sessions', 'الجلسات'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Event Management', 'إدارة الفعاليات'], notes: ['Afternoon closing sessions.', 'الجلسات الختامية بعد الظهر.'] },
      { time: '17:30', icon: 'culture', t: ['Cultural Activation', 'فعالية ثقافية'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Cultural Activities', 'الأنشطة الثقافية'], notes: ['Closing cultural activation.', 'فعالية ثقافية ختامية.'] },
      { time: '17:30 – 19:00', icon: 'dining', t: ['Farewell Reception', 'حفل الوداع'], loc: ['Madinat Jumeirah', 'مدينة جميرا'], team: ['Event Management', 'إدارة الفعاليات'], notes: ['Farewell reception to close the programme.', 'حفل الوداع لختام البرنامج.'] }
    ] }
  ];

  AGM_EVENT = [
    { icon: 'ceremony', date: ['Signed', 'موقّع'], day: ['Rotana Hotel Contract', 'عقد فندق روتانا'],
      desc: ['Rotana Hotel accommodation contract signed. St. Regis contract is in the final signing stage.', 'توقيع عقد الإقامة مع فندق روتانا، وعقد سانت ريجيس في مرحلة التوقيع النهائية.'] },
    { icon: 'plane', date: ['Contracted', 'تم التعاقد'], day: ['Transportation', 'المواصلات'],
      desc: ['Transportation provider contracted; delegate transfer routes are being finalised.', 'التعاقد مع مزود المواصلات ويجري استكمال مسارات نقل المشاركين.'] },
    { icon: 'dining', date: ['Approved', 'معتمد'], day: ['Guest Menu Selection', 'اختيار قائمة الطعام'],
      desc: ['Guest menu selected and approved with the hotel. Distinguished Emirati hospitality concept prepared for review.', 'اختيار قائمة الطعام واعتمادها مع الفندق، وتجهيز مفهوم الضيافة الإماراتية المميزة للمراجعة.'] },
    { icon: 'dining', date: ['20 Oct', '20 أكتوبر'], day: ['Food Tasting', 'تذوق الطعام'],
      desc: ['Preliminary food tasting date set for 20 October to lock the final set menu.', 'تحديد موعد أولي لتذوق الطعام في 20 أكتوبر لاعتماد القائمة النهائية.'] },
    { icon: 'sessions', date: ['In progress', 'قيد التنفيذ'], day: ['Event Design', 'تصميم الحدث'],
      desc: ['General design direction confirmed; awaiting the People team to deliver the final design with minor edits.', 'اعتماد التوجّه العام للتصميم، بانتظار فريق People لتقديم التصميم النهائي مع تعديلات بسيطة.'] },
    { icon: 'sessions', date: ['Pending', 'قيد الانتظار'], day: ['Council Furniture', 'أثاث المجلس'],
      desc: ['People team to submit a furniture proposal; PM will then direct repair of existing furniture or manufacture of new.', 'يقدّم فريق People مقترح الأثاث، ثم يوجّه مدير المشروع بإصلاح الأثاث الحالي أو تصنيع جديد.'] },
    { icon: 'culture', date: ['In progress', 'قيد التنفيذ'], day: ['Organizers Guide & Workshop', 'دليل المنظمين والورشة التعريفية'],
      desc: ['Organizers guide is being prepared and designed; the induction workshop date will be set with the PM once the guide is complete.', 'يجري إعداد وتصميم دليل المنظمين، وسيُحدد موعد الورشة التعريفية مع مدير المشروع بعد الانتهاء منه.'] },
    { icon: 'culture', date: ['In review', 'قيد المراجعة'], day: ['Virtual Assistant App', 'تطبيق المساعد الافتراضي'],
      desc: ['New guest-experience app features are under review with the Project Manager.', 'خصائص جديدة لتطبيق تجربة الضيوف قيد المراجعة مع مدير المشروع.'] },
    { icon: 'ceremony', date: ['Pending', 'قيد الانتظار'], day: ['Gifts & Distributions', 'الهدايا والتوزيعات'],
      desc: ['Giveaway options prepared; distributions are awaiting Project Manager approval.', 'تجهيز خيارات الهدايا، والتوزيعات بانتظار اعتماد مدير المشروع.'] }
  ];

  openDeptGuard = (id) => (e) => { if (e && e.target && e.target.closest && e.target.closest('button,select,input,textarea,form,.leadav')) return; this.setState({ deptIdx: id, acc: { wf: true } }); };
  closeDept = () => this.setState({ deptIdx: null });
  openDeptEdit = (id) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ deptEditIdx: id, deptIdx: null }); };
  closeDeptEdit = () => this.setState({ deptEditIdx: null });
  toggleAcc = (key) => () => { const acc = this.state.acc || {}; this.setState({ acc: { ...acc, [key]: !acc[key] } }); };
  saveDeptEdit = (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const id = this.state.deptEditIdx;
    const g = k => fd.get(k);
    const ov = { n: g('n'), s: g('s'), u: g('u'), leadN: g('leadN'), leadT: g('leadT'), depN: g('depN'), depT: g('depT'), upd: g('upd'), chal: g('chal'), apprItem: g('apprItem'), apprDec: g('apprDec'), apprOwner: g('apprOwner'), apprDue: g('apprDue'), nextAction: g('nextAction'), nextWho: g('nextWho'), nextDue: g('nextDue') };
    const deptEdits = { ...this.state.deptEdits, [id]: ov };
    this.persist('wef_deptedits', deptEdits);
    this.setState({ deptEdits, deptEditIdx: null });
  };
  addDeptMember = (id) => (e) => {
    e.preventDefault(); const fd = new FormData(e.target); const name = (fd.get('name') || '').trim(); if (!name) return;
    const role = (fd.get('role') || '').trim() || 'Member';
    const list = [...(this.state.deptMembers[id] || []), { id: 'dm' + Date.now(), n: name, r: role }];
    const deptMembers = { ...this.state.deptMembers, [id]: list };
    this.persist('wef_deptmembers', deptMembers); e.target.reset(); this.setState({ deptMembers });
  };
  toggleWfAdd = () => this.setState(s => ({ wfAdd: !s.wfAdd, wfRemove: false }));
  toggleWfRemove = () => this.setState(s => ({ wfRemove: !s.wfRemove, wfAdd: false }));
  removeDeptMemberNow = (id, mid) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); const list = (this.state.deptMembers[id] || []).filter(m => m.id !== mid); const deptMembers = { ...this.state.deptMembers, [id]: list }; this.persist('wef_deptmembers', deptMembers); this.setState({ deptMembers }); };
  addDeptMemberInline = (id) => (e) => { e.preventDefault(); const fd = new FormData(e.target); const name = (fd.get('name') || '').trim(); if (!name) return; const role = (fd.get('role') || '').trim() || (this.state.lang === 'ar' ? '\u0639\u0636\u0648 \u0627\u0644\u0641\u0631\u064a\u0642' : 'Team Member'); const list = [...(this.state.deptMembers[id] || []), { id: 'dm' + Date.now(), n: name, r: role }]; const deptMembers = { ...this.state.deptMembers, [id]: list }; this.persist('wef_deptmembers', deptMembers); e.target.reset(); this.setState({ deptMembers }); };
  _deptById = (id) => [...this.DEPTS, ...this.AGM_DEPTS].find(d => d.id === id);
  openWfEdit = (deptId, kind, mid) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!this.state.admin && !this.canEditTeam(deptId)) return;
    const ar = this.state.lang === 'ar';
    const tx = v => Array.isArray(v) ? v[ar ? 1 : 0] : v;
    const photos = this.state.photos || {};
    let name = '', role = '', photoId = '', isNew = false, acc = false, accP = '';
    if (kind === 'member' && !mid) {
      isNew = true; photoId = 'dm' + Date.now();
    } else if (kind === 'member') {
      const m = (this.state.deptMembers[deptId] || []).find(x => x.id === mid) || {};
      name = tx(m.n) || ''; role = tx(m.r) || ''; photoId = mid; acc = !!m.acc; accP = m.accP || '';
    } else {
      const base = this._deptById(deptId) || { lead: { n: '', t: '' }, dep: { n: '', t: '' } };
      const e2 = (this.state.deptEdits || {})[deptId] || {};
      if (kind === 'lead') { name = e2.leadN || base.lead.n; role = e2.leadT || tx(base.lead.t); photoId = 'DL' + deptId; }
      else { name = e2.depN || base.dep.n; role = e2.depT || tx(base.dep.t); photoId = 'DD' + deptId; }
    }
    this.setState({ wfEdit: { deptId, kind, mid, isNew, name, role, photoId, acc, accP, photo: photos[photoId] || null } });
  };
  closeWfEdit = () => this.setState({ wfEdit: null });
  pickEmpDir = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,.xlsx,.xls';
    inp.onchange = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const ar = this.state.lang === 'ar';
      if (/\.xlsx?$|\.xls$/i.test(file.name)) { this.flashToast(ar ? 'يرجى حفظ الملف بصيغة CSV من إكسل (ملف > حفظ باسم > CSV) ثم رفعه.' : 'Please save the sheet as CSV in Excel (File > Save As > CSV), then upload it.'); return; }
      const r = new FileReader(); r.onload = () => { const list = this.parseEmpCSV(String(r.result || ''));
        if (!list.length) { this.flashToast(ar ? 'لم يُعثر على موظفين في الملف.' : 'No employees found in the file.'); return; }
        this.persist('wef_empdir', list); this.setState({ empDir: list });
        this.flashToast((ar ? 'تم تحميل ' : 'Loaded ') + list.length + (ar ? ' موظفاً في الدليل' : ' employees into the directory')); };
      r.readAsText(file); };
    inp.click();
  };
  parseEmpCSV(text) {
    const rows = [];
    String(text).replace(/^\uFEFF/, '').split(/\r?\n/).forEach(line => { if (!line.trim()) return;
      const cells = []; let cur = '', q = false;
      for (let i = 0; i < line.length; i++) { const c = line[i];
        if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
        else if (c === '"') q = true; else if (c === ',') { cells.push(cur); cur = ''; } else cur += c; }
      cells.push(cur); rows.push(cells.map(s => s.trim())); });
    if (!rows.length) return [];
    const h = rows[0].map(s => s.toLowerCase());
    const fi = keys => h.findIndex(c => keys.some(k => c.includes(k)));
    let ni = fi(['name', 'الاسم', 'اسم']), ei = fi(['email', 'mail', 'بريد']), pi = fi(['phone', 'mobile', 'هاتف', 'جوال', 'رقم']), gi = fi(['gender', 'sex', 'الجنس', 'جنس']), idi = fi(['id', 'رقم الموظف', 'الرقم الوظيفي']);
    let body = rows.slice(1);
    if (ni < 0) { ni = 0; if (ei < 0) ei = 1; if (pi < 0) pi = 2; body = rows; }
    const gnorm = v => { const s = String(v || '').trim().toLowerCase(); if (!s) return ''; if (s.startsWith('m') || s.includes('ذكر')) return 'M'; if (s.startsWith('f') || s.includes('أنث') || s.includes('انث')) return 'F'; return ''; };
    return body.map(rw => ({ eid: idi >= 0 ? (rw[idi] || '') : '', n: rw[ni] || '', em: ei >= 0 ? (rw[ei] || '') : '', ph: pi >= 0 ? (rw[pi] || '') : '', gd: gi >= 0 ? gnorm(rw[gi]) : '' })).filter(x => x.n);
  }
  clearEmpDir = () => { this.persist('wef_empdir', []); this.setState({ empDir: [] }); };
  approveWfNom = (deptId, nid) => () => {
    const nom = { ...(this.state.wfNom || {}) }; const list = nom[deptId] || [];
    const item = list.find(x => x.id === nid); if (!item) return;
    const photos = { ...(this.state.photos || {}) };
    let deptMembers = this.state.deptMembers, deptEdits = this.state.deptEdits;
    if (item.kind === 'lead' || item.kind === 'dep') {
      deptEdits = { ...(deptEdits || {}) }; const cur = { ...(deptEdits[deptId] || {}) };
      if (item.kind === 'lead') { cur.leadN = item.n; cur.leadT = item.r; } else { cur.depN = item.n; cur.depT = item.r; }
      deptEdits[deptId] = cur; this.persist('wef_deptedits', deptEdits);
      if (item.photo) { photos[(item.kind === 'lead' ? 'DL' : 'DD') + deptId] = item.photo; }
    } else if (item.type === 'edit' && item.mid) {
      deptMembers = { ...deptMembers, [deptId]: (deptMembers[deptId] || []).map(m => m.id === item.mid ? { ...m, n: item.n, r: item.r, em: item.em || m.em || '', ph: item.ph || m.ph || '', acc: !!item.acc, accP: item.accP || '' } : m) };
      this.persist('wef_deptmembers', deptMembers);
      if (item.photo) photos[item.mid] = item.photo;
    } else {
      const pid = 'dm' + Date.now();
      deptMembers = { ...deptMembers, [deptId]: [...(deptMembers[deptId] || []), { id: pid, n: item.n, r: item.r, em: item.em || '', ph: item.ph || '', acc: !!item.acc, accP: item.accP || '' }] };
      this.persist('wef_deptmembers', deptMembers);
      if (item.photo) photos[pid] = item.photo;
    }
    nom[deptId] = list.filter(x => x.id !== nid);
    this.persist('wef_photos', photos); this.persist('wef_wfnom', nom);
    this.setState({ deptMembers, deptEdits, photos, wfNom: nom });
    this.flashToast(this.state.lang === 'ar' ? 'تم اعتماد التعديل' : 'Change approved and applied');
  };
  setHotelField = (mid, key) => (e) => {
    const v = e.target.value;
    const ha = { ...(this.state.hotelAssign || {}) };
    ha[mid] = { ...(ha[mid] || {}), [key]: v };
    if (key === 'mate') { ha[mid].mateRejected = v === '' ? true : false; ha[mid].mateApproved = false; }
    this.persist('wef_hotel', ha); this.setState({ hotelAssign: ha });
  };
  htExport = () => {
    const ar = this.state.lang === 'ar';
    const rows = this._htRows || [];
    const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const head = ar ? ['الاسم', 'الفريق', 'البريد الإلكتروني', 'الهاتف', 'الجنس', 'الفندق', 'رقم التأكيد', 'تسجيل الدخول', 'تسجيل الخروج', 'شريك السكن', 'الشريك المفضل'] : ['Name', 'Team', 'Email', 'Phone', 'Gender', 'Hotel', 'Confirmation No.', 'Check-in', 'Check-out', 'Roommate', 'Preferred Roommate'];
    const body = rows.map(h => [h.n, h.team, h.em, h.ph, h.gender === 'M' ? (ar ? 'ذكر' : 'Male') : h.gender === 'F' ? (ar ? 'أنثى' : 'Female') : '', h.hotel, h.conf, h.cin ? h.cin.replace('T', ' ') : '', h.cout ? h.cout.replace('T', ' ') : '', h.mate, h.pref]);
    const csv = '\uFEFF' + [head, ...body].map(r => r.map(esc).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'accommodation-list.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  fbExport = () => {
    const ar = this.state.lang === 'ar';
    const items = ((this.state.feedback || {})[this.state.event] || []);
    const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const head = ar ? ['التاريخ', 'مقدم الملاحظات', 'الفريق المعني', 'الملاحظات'] : ['Date', 'Submitted By', 'About Team', 'Feedback'];
    const rows = items.map(f => [new Date(f.ts).toLocaleDateString(ar ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), f.by || '', f.team || '', f.text || '']);
    const csv = '\uFEFF' + [head, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'feedback-report.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  fbOpenNow = () => { const fb = { ...(this.state.fbOpen || {}) }; fb[this.state.event] = true; this.persist('wef_fbopen', fb); this.setState({ fbOpen: fb }); };
  fbSubmit = (e) => {
    e.preventDefault(); const f = new FormData(e.target); const text = (f.get('text') || '').trim(); if (!text) return;
    const ar = this.state.lang === 'ar';
    const author = (f.get('author') || '').trim();
    const ownTeam = f.get('ownTeam') || '';
    const by = author + (ownTeam ? ' — ' + ownTeam : '');
    const all = { ...(this.state.feedback || {}) };
    all[this.state.event] = [{ id: 'fb' + Date.now(), team: f.get('team') || '—', text, by, ts: Date.now() }, ...(all[this.state.event] || [])];
    this.persist('wef_feedback', all); this.setState({ feedback: all }); e.target.reset();
    this.flashToast(ar ? 'تم إرسال الملاحظات' : 'Feedback submitted');
  };
  rejectWfNom = (deptId, nid) => () => {
    const nom = { ...(this.state.wfNom || {}) };
    nom[deptId] = (nom[deptId] || []).filter(x => x.id !== nid);
    this.persist('wef_wfnom', nom); this.setState({ wfNom: nom });
    this.flashToast(this.state.lang === 'ar' ? 'تم رفض الترشيح' : 'Nomination rejected');
  };
  setWfField = (field) => (e) => { const v = e.target.value; this.setState(s => ({ wfEdit: { ...s.wfEdit, [field]: v } })); };
  pickWfEditPhoto = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => this.setState(s => ({ wfEdit: { ...s.wfEdit, photo: r.result } })); r.readAsDataURL(file); };
    inp.click();
  };
  saveWfEdit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const w = this.state.wfEdit; if (!w) return;
    const name = (w.name || '').trim(); if (!name) return;
    const ar = this.state.lang === 'ar';
    const role = (w.role || '').trim() || (ar ? '\u0639\u0636\u0648 \u0627\u0644\u0641\u0631\u064a\u0642' : 'Team Member');
    const photos = { ...(this.state.photos || {}) };
    if (!this.state.admin) {
      const nom = { ...(this.state.wfNom || {}) };
      const type = (w.kind === 'member' && w.isNew) ? 'add' : 'edit';
      nom[w.deptId] = [...(nom[w.deptId] || []), { id: 'nom' + Date.now(), type, kind: w.kind, mid: w.mid || null, n: name, r: role, em: w.em || '', ph: w.ph || '', acc: !!w.acc, accP: w.acc ? (w.accP || '') : '', photo: w.photo || null }];
      this.persist('wef_wfnom', nom);
      this.setState({ wfNom: nom, wfEdit: null });
      this.flashToast(ar ? 'تم إرسال التعديل لاعتماد الإدارة' : 'Change sent for admin approval');
      return;
    }
    if (w.kind === 'member') {
      const cur = this.state.deptMembers[w.deptId] || [];
      let list, pid;
      if (w.isNew) { pid = w.photoId || ('dm' + Date.now()); list = [...cur, { id: pid, n: name, r: role, em: w.em || '', ph: w.ph || '', gd: w.gd || '', eid: w.eid || '', acc: !!w.acc, accP: w.acc ? (w.accP || '') : '' }]; }
      else { pid = w.mid; list = cur.map(m => m.id === w.mid ? { ...m, n: name, r: role, em: w.em || m.em || '', ph: w.ph || m.ph || '', gd: w.gd || m.gd || '', eid: w.eid || m.eid || '', acc: !!w.acc, accP: w.acc ? (w.accP || '') : '' } : m); }
      const deptMembers = { ...this.state.deptMembers, [w.deptId]: list };
      this.persist('wef_deptmembers', deptMembers);
      if (w.photo) photos[pid] = w.photo;
      this.persist('wef_photos', photos);
      this.setState({ deptMembers, photos, wfEdit: null });
    } else {
      const deptEdits = { ...(this.state.deptEdits || {}) };
      const cur = { ...(deptEdits[w.deptId] || {}) };
      if (w.kind === 'lead') { cur.leadN = name; cur.leadT = role; } else { cur.depN = name; cur.depT = role; }
      deptEdits[w.deptId] = cur;
      this.persist('wef_deptedits', deptEdits);
      if (w.photo) photos[w.photoId] = w.photo;
      this.persist('wef_photos', photos);
      this.setState({ deptEdits, photos, wfEdit: null });
    }
  };
  deleteWfMember = () => {
    const w = this.state.wfEdit; if (!w || w.kind !== 'member' || w.isNew) return;
    const list = (this.state.deptMembers[w.deptId] || []).filter(m => m.id !== w.mid);
    const deptMembers = { ...this.state.deptMembers, [w.deptId]: list };
    this.persist('wef_deptmembers', deptMembers);
    this.setState({ deptMembers, wfEdit: null });
  };
  removeDeptMember = (id, mid) => () => {
    const list = (this.state.deptMembers[id] || []).filter(m => m.id !== mid);
    const deptMembers = { ...this.state.deptMembers, [id]: list };
    this.persist('wef_deptmembers', deptMembers); this.setState({ deptMembers });
  };
  editDeptMemberName = (id, mid) => (e) => {
    const v = e.target.value; const list = (this.state.deptMembers[id] || []).map(m => m.id === mid ? { ...m, n: v } : m);
    const deptMembers = { ...this.state.deptMembers, [id]: list };
    this.persist('wef_deptmembers', deptMembers); this.setState({ deptMembers });
  };
  editDeptMemberRole = (id, mid) => (e) => {
    const v = e.target.value; const list = (this.state.deptMembers[id] || []).map(m => m.id === mid ? { ...m, r: v } : m);
    const deptMembers = { ...this.state.deptMembers, [id]: list };
    this.persist('wef_deptmembers', deptMembers); this.setState({ deptMembers });
  };
  exportSummary = (id) => {
    const ar = this.state.lang === 'ar'; const tx = v => Array.isArray(v) ? v[ar ? 1 : 0] : v;
    const d = [...this.DEPTS, ...this.AGM_DEPTS].find(x => x.id === id); const e2 = (this.state.deptEdits || {})[id] || {};
    const mem = (this.state.deptMembers || {})[id] || []; const L = [];
    L.push('WEF OPERATIONS — TEAM SUMMARY'); L.push('');
    L.push((e2.n || tx(d.n)).toUpperCase());
    L.push('Status: ' + this.T[this.state.lang].statuses[e2.s || d.s] + '   ·   Updated: ' + (e2.u || d.u)); L.push('');
    L.push('Team Lead:   ' + (e2.leadN || d.lead.n) + '  —  ' + (e2.leadT || tx(d.lead.t)));
    L.push('Deputy Lead: ' + (e2.depN || d.dep.n) + '  —  ' + (e2.depT || tx(d.dep.t))); L.push('');
    L.push('TEAM MEMBERS'); mem.forEach(m => L.push('  • ' + tx(m.n) + '  —  ' + tx(m.r))); L.push('');
    L.push('LATEST UPDATES'); (e2.upd != null ? String(e2.upd).split('\n') : d.upd.map(tx)).filter(x => x && x.trim()).forEach(u => L.push('  • ' + u)); L.push('');
    L.push('CHALLENGES'); (e2.chal != null ? String(e2.chal).split('\n') : d.chal.map(tx)).filter(x => x && x.trim()).forEach(c => L.push('  • ' + c)); L.push('');
    L.push('PENDING APPROVALS'); L.push('  • ' + (e2.apprItem || tx(d.appr.item)) + '  —  ' + (e2.apprDec || tx(d.appr.dec)) + '  (Owner: ' + (e2.apprOwner || d.appr.owner) + ', Due: ' + (e2.apprDue || d.appr.due) + ')'); L.push('');
    L.push('NEXT STEPS'); L.push('  • ' + (e2.nextAction || tx(d.next.action)) + '  (' + (e2.nextWho || d.next.who) + ', Due: ' + (e2.nextDue || d.next.due) + ')');
    const blob = new Blob([L.join('\n')], { type: 'text/plain' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = (e2.n || tx(d.n)).replace(/[^\w]+/g, '_') + '_summary.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  doLogin = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const em = String(f.get('email') || '').trim().toLowerCase();
    const pw = String(f.get('password') || '');
    const users = this.state.users || [];
    const uMatch = users.find(u => (u.email || '').toLowerCase() === em);
    const map = { admin: 'admin', team: 'inputter', inputter: 'inputter', lead: 'lead', hotel: 'hotel', he: 'he' };
    const role = uMatch ? uMatch.role : map[em.split('@')[0]];
    if (!em || !pw || !role) { this.setState({ loginErr: true }); return; }
    if (uMatch && uMatch.pass && uMatch.pass !== pw) { this.setState({ loginErr: true }); return; }
    try { sessionStorage.setItem('wef_auth', '1'); sessionStorage.setItem('wef_auth_email', em); } catch (e2) {}
    if (uMatch) { const users2 = users.map(u => u.id === uMatch.id ? { ...u, last: Date.now() } : u); this.persist('wef_users', users2); this.setState({ users: users2 }); }
    this.persist('wef_role', role);
    this.setState({ authed: true, loginErr: false, role, admin: role === 'admin' });
  };
  doSignOut = () => { try { sessionStorage.removeItem('wef_auth'); } catch (e) {} this.setState({ authed: false, loginErr: false }); };
  openGuide = () => this.setState({ guideModal: true, guideOpts: this.state.guideOpts || { leaders: true, members: true, updates: false } });
  closeGuide = () => this.setState({ guideModal: false });
  toggleGuideOpt = (k) => () => this.setState(s => { const cur = s.guideOpts || { leaders: true, members: true, updates: false }; return { guideOpts: { ...cur, [k]: !cur[k] } }; });
  runGuide = () => {
    const opts = this.state.guideOpts || { leaders: true, members: true, updates: false };
    const ar0 = this.state.lang === 'ar';
    const tx0 = v => Array.isArray(v) ? v[ar0 ? 1 : 0] : v;
    const eds0 = this.state.deptEdits || {}; const tasks0 = this.state.tasks || {};
    const META0 = { ...this.DEPT_META, ...this.AGM_META };
    const stL = this.T[this.state.lang].statuses; const prL0 = { h: ar0 ? 'عالية' : 'High', m: ar0 ? 'متوسطة' : 'Medium', l: ar0 ? 'منخفضة' : 'Low' };
    const DEPTS = (this.state.event === 'agm' ? this.AGM_DEPTS : this.DEPTS).map(d => {
      const e = eds0[d.id] || {};
      const upd = e.upd != null ? String(e.upd).split('\n').map(x => x.trim()).filter(Boolean) : (d.upd || []).map(tx0);
      const meta = META0[d.id] || { actions: [] };
      const acts = [ ...((meta.actions) || []), ...((tasks0[d.id]) || []) ].map(a => ({ t: tx0(a.t), o: a.o, sl: stL[a.s], pr: prL0[a.pr], d: tx0(a.d), nx: tx0(a.nx) }));
      return { id: d.id, n: d.n, lead: d.lead, dep: d.dep, upd: upd, acts: acts };
    });
    const CHIEF = { n: [this.T.en.chiefName, this.T.ar.chiefName], r: [this.T.en.chiefRole, this.T.ar.chiefRole] };
    const PM = { n: [this.T.en.pmName, this.T.ar.pmName], r: [this.T.en.pmRole, this.T.ar.pmRole] };
    const GL = ar0
      ? { upd: 'التحديثات', act: 'بنود العمل', owner: 'المسؤول', status: 'الحالة', pr: 'الأولوية', due: 'الاستحقاق', next: 'الإجراء التالي', none: 'لا يوجد' }
      : { upd: 'Updates', act: 'Action Items', owner: 'Owner', status: 'Status', pr: 'Priority', due: 'Due', next: 'Next Action', none: '—' };
    try { window.__wefGuideData = () => ({ MEM: this.state.deptMembers || {}, EDS: this.state.deptEdits || {}, PHO: this.state.photos || {} }); } catch (e) {}
    const data = JSON.stringify({ DEPTS, CHIEF, PM, lang: this.state.lang, opts: opts, GL: GL, MEM: this.state.deptMembers || {}, EDS: this.state.deptEdits || {}, PHO: this.state.photos || {} });
    const css = "*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','IBM Plex Sans Arabic',sans-serif;background:#E4E8F0;color:#1A2233}.page{max-width:1040px;margin:0 auto;padding:0 0 64px;background:#F7F9FC;min-height:100vh;box-shadow:0 0 40px rgba(15,36,64,.08)}.top{display:flex;justify-content:space-between;align-items:center;gap:16px;background:#E8ECF4;border-radius:0 0 28px 28px;padding:46px 52px;margin-bottom:44px}.gt{display:none}.gh{font-size:42px;font-weight:800;letter-spacing:-.02em;margin:0;display:flex;align-items:center;gap:24px}.gh::after{content:'';width:150px;height:3px;background:#2563C4;flex:none}.gs{font-size:13px;color:#6B7688;margin-top:10px}.tools{display:flex;gap:8px;flex:none}.tbtn{appearance:none;border:1px solid #D7DDE8;background:#fff;color:#1A2233;font:inherit;font-size:12px;font-weight:600;padding:9px 17px;border-radius:999px;cursor:pointer}.tbtn.p{background:#2563C4;color:#fff;border-color:#2563C4}.execrow{display:flex;gap:26px;flex-wrap:wrap;margin:0 52px 48px}.exc{flex:1;min-width:240px;display:flex;align-items:center;gap:16px;background:none;border:none;padding:0}.exc.chief{background:none;color:inherit}.exc.pm{background:none;border:none}.exc .cir{width:76px;height:76px;font-size:19px;margin:0}.exc.chief .cir,.exc.pm .cir{background-color:#DCE4F0;color:#2563C4;border-color:#2563C4}.exc>div{display:flex;flex-direction:column-reverse}.exc b{font-size:19px;font-weight:700;color:#1A2233;display:block}.exc span{font-size:12.5px;font-weight:700;color:#2563C4;text-transform:none;letter-spacing:0;opacity:1;margin:0 0 3px;display:block}.team{break-inside:avoid;margin:0 52px 44px}.tn{font-size:16.5px;font-weight:700;color:#1A2233;letter-spacing:-.01em;display:flex;align-items:center;gap:16px;margin-bottom:22px}.tn::after{content:'';flex:1;height:1px;background:#D9DFE9}.leads{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:22px;margin-bottom:24px}.person{display:grid;grid-template-columns:auto 1fr;column-gap:14px;align-items:center;text-align:start}.cir{grid-row:1/3;width:52px;height:52px;border-radius:50%;border:2px solid #2563C4;padding:3px;background-color:#DCE4F0;background-size:cover;background-position:center;background-origin:content-box;background-clip:content-box;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#2563C4}.cir.big{width:64px;height:64px;font-size:15px}.pn{font-size:14px;font-weight:600;align-self:end;line-height:1.35}.pr{font-size:11.5px;color:#6B7688;align-self:start;margin-top:2px;line-height:1.35}.person{break-inside:avoid}.leads .pn{font-size:15px;font-weight:700}.leads .pr{color:#2563C4;font-weight:700;font-size:11.5px}.divi{display:flex;align-items:center;gap:12px;margin:20px 0 18px}.dl{font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#6B7688}.dr{flex:1;height:1px;background:#E2E7F0}.members{display:grid;grid-template-columns:repeat(4,1fr);gap:22px 26px}@media(max-width:820px){.members{grid-template-columns:repeat(2,1fr)}}.foot{margin:34px 52px 0;font-size:11px;color:#9AA3B2}@page{size:A4;margin:0}@media print{body{background:#fff}.tools{display:none}.page{box-shadow:none;max-width:none;background:#fff;padding-bottom:40px}.top{border-radius:0;padding:38px 44px;margin-bottom:34px}.gh{font-size:32px}.gh::after{width:110px}.team{margin:0 44px 34px;break-inside:avoid;page-break-inside:avoid}.execrow{margin:0 44px 36px}.members{grid-template-columns:repeat(4,1fr)}.exc .cir{width:64px;height:64px}.exc b{font-size:17px}}";
    const js = "const D=" + data + ";let lang=D.lang||'en';\n" +
      "      const tx=v=>Array.isArray(v)?v[lang==='ar'?1:0]:v;\n" +
      "      const ini=s=>(s||'').trim().split(/\\s+/).map(x=>x[0]||'').slice(0,2).join('').toUpperCase();\n" +
      "      function read(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}\n" +
      "      function live(){try{if(window.opener&&window.opener.__wefGuideData){var L=window.opener.__wefGuideData();if(L){D.MEM=L.MEM||D.MEM;D.EDS=L.EDS||D.EDS;D.PHO=L.PHO||D.PHO;}}}catch(e){}}\n" +
      "      function cir(id,i,big){var p=((D.PHO)||read('wef_photos',{}))[id];var c=big?'cir big':'cir';return p?'<div class=\"'+c+'\" style=\"background-image:url('+p+')\"></div>':'<div class=\"'+c+'\">'+i+'</div>';}\n" +
      "      function person(id,name,role,big){return '<div class=\"person\">'+cir(id,ini(name),big)+'<div class=\"pn\">'+name+'</div><div class=\"pr\">'+role+'</div></div>';}\n" +
      "      function render(){\n" +
      "        var ar=lang==='ar';document.documentElement.dir=ar?'rtl':'ltr';\n" +
      "        var mem=(D.MEM)||read('wef_deptmembers',{});var eds=(D.EDS)||read('wef_deptedits',{});\n" +
      "        var MEM=ar?'أعضاء الفريق':'Team Members';var NONE=ar?'لم يُضَف أعضاء بعد':'No members added yet';\n" +
      "        var teams=D.DEPTS.map(function(d){var e=eds[d.id]||{};var list=(mem[d.id]||[]);\n" +
      "          var leadN=e.leadN||d.lead.n, leadT=e.leadT||tx(d.lead.t), depN=e.depN||d.dep.n, depT=e.depT||tx(d.dep.t);\n" +
      "          var leads=person('DL'+d.id,leadN,leadT,true)+person('DD'+d.id,depN,depT,true);\n" +
      "          var mm=list.length?list.map(function(m){return person(m.id,tx(m.n),tx(m.r),false);}).join(''):'<div class=\"pr\">'+NONE+'</div>';\n" +
      "          var O=D.opts||{leaders:true,members:true,updates:false};var GL=D.GL||{};var sec='';\n" +
      "          if(O.leaders)sec+='<div class=\"leads\">'+leads+'</div>';\n" +
      "          if(O.members)sec+='<div class=\"divi\"><span class=\"dl\">'+MEM+'</span><span class=\"dr\"></span></div><div class=\"members\">'+mm+'</div>';\n" +
      "          if(O.updates){var ul=(d.upd&&d.upd.length)?('<ul class=\"gul\">'+d.upd.map(function(u){return '<li>'+u+'</li>';}).join('')+'</ul>'):('<div class=\"pr\">'+GL.none+'</div>');\n" +
      "            var rows=(d.acts&&d.acts.length)?d.acts.map(function(a){return '<tr><td>'+a.t+'</td><td>'+a.o+'</td><td>'+a.sl+'</td><td>'+a.pr+'</td><td>'+a.d+'</td><td>'+a.nx+'</td></tr>';}).join(''):('<tr><td colspan=\"6\" class=\"pr\">'+GL.none+'</td></tr>');\n" +
      "            sec+='<div class=\"gsec\"><div class=\"gl2\">'+GL.upd+'</div>'+ul+'<div class=\"gl2\" style=\"margin-top:14px\">'+GL.act+'</div><table class=\"gat\"><thead><tr><th>'+GL.act+'</th><th>'+GL.owner+'</th><th>'+GL.status+'</th><th>'+GL.pr+'</th><th>'+GL.due+'</th><th>'+GL.next+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>';}\n" +
      "          return '<div class=\"team\"><div class=\"tn\">'+(e.n||tx(d.n))+'</div>'+sec+'</div>';\n" +
      "        }).join('');\n" +
      "        document.getElementById('app').innerHTML=\n" +
      "          '<div class=\"page\"><div class=\"top\"><div><div class=\"gt\">WEF Guide</div><div class=\"gh\">'+(ar?'دليل فريق عمليات المنتدى':'WEF Operations — Team Guide')+'</div><div class=\"gs\">'+(ar?'الاجتماع السنوي لمجالس المستقبل العالمية · 13 أكتوبر 2026 · دبي':'Annual Meeting of the Global Future Councils · 13 October 2026 · Dubai')+'</div></div>'\n" +
      "          +'<div class=\"tools\"><button class=\"tbtn p\" onclick=\"window.print()\">'+(ar?'طباعة / PDF':'Print / PDF')+'</button><button class=\"tbtn\" id=\"lng\">'+(ar?'EN':'العربية')+'</button></div></div>'\n" +
      "          +'<div class=\"execrow\"><div class=\"exc chief\">'+cir('chief',ini(tx(D.CHIEF.n)),false)+'<div><b>'+tx(D.CHIEF.n)+'</b><span>'+tx(D.CHIEF.r)+'</span></div></div>'\n" +
      "          +'<div class=\"exc pm\">'+cir('pm',ini(tx(D.PM.n)),false)+'<div><b>'+tx(D.PM.n)+'</b><span>'+tx(D.PM.r)+'</span></div></div></div>'\n" +
      "          +teams\n" +
      "          +'<div class=\"foot\">'+(ar?'يعكس أحدث التغييرات في اللوحة':'Reflects the latest changes made in the dashboard')+'</div></div>';\n" +
      "        var lb=document.getElementById('lng');if(lb)lb.onclick=function(){lang=lang==='ar'?'en':'ar';render();};\n" +
      "      }\n" +
      "      window.addEventListener('storage',render);window.addEventListener('focus',function(){live();render();});\n" +
      "      setInterval(function(){var b=JSON.stringify([D.MEM,D.EDS,D.PHO]);live();if(JSON.stringify([D.MEM,D.EDS,D.PHO])!==b)render();},1200);\n" +
      "      live();render();";
    const GCSS = ".gsec{margin-top:16px}.gl2{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#1B66C9;margin-bottom:8px}.gul{margin:0 0 4px;padding-inline-start:18px}.gul li{font-size:12.5px;line-height:1.6;color:#17233B}.gat{width:100%;border-collapse:collapse;margin-top:4px}.gat th{font-size:9px;text-transform:uppercase;letter-spacing:.05em;color:#6B7688;text-align:start;padding:0 8px 6px;border-bottom:1px solid #E7EAF1;font-weight:700}.gat td{font-size:10.5px;padding:7px 8px;border-bottom:1px solid #EDF1F7;color:#17233B;vertical-align:top}.gat td:first-child{font-weight:600}";
    const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>WEF Operations — Team Guide</title><style>" + css + GCSS + "</style></head><body><div id=\"app\"></div><scr" + "ipt>" + js + "</scr" + "ipt></body></html>";
    const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
    window.open(url, 'wef_guide');
    this.setState({ guideModal: false });
  };

  renderVals() {
    const st = this.state;
    const ar = st.lang === 'ar';
    const t = this.T[st.lang];
    const tx = v => Array.isArray(v) ? v[ar ? 1 : 0] : v;
    const txd = s => ar ? String(s).replace(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/g, m => this.AR_MONTHS[m]) : s;
    const EX = ar ? {
      opTracker: 'المتتبع التشغيلي', close: 'إغلاق', viewTeam: 'عرض الفريق', apprItem: 'بند الموافقة', responsible: 'المسؤول', exportSummaryL: 'تصدير ملخص الفريق', roleLabel: 'الدور / المسؤولية',
      backToTracker: 'العودة إلى المتتبع التشغيلي', nextDue: 'الاستحقاق التالي', openItems: 'بند عمل مفتوح', delayL: 'التأخير', delayFlag: 'متأخر عن الجدول',
      trkViewTable: 'جدول', trkViewCards: 'بطاقات',
      thAction: 'الإجراء / المهمة', thPriority: 'الأولوية', thDependency: 'التبعية', thNext: 'الخطوات التالية', thChal: 'التحديات', thApproval: 'الاعتماد', mtToggleL: 'تتضمن هذه المهمة اجتماعاً', mtChipL: 'اجتماع', mtRecL: 'المدعوون للاجتماع', mtPurL: 'الغرض', mtLocL: 'الموقع', mtTimeL: 'التوقيت', exportTimeline: 'تصدير الجدول', editSessionL: 'تعديل الجلسة', editDayL: 'تعديل اليوم', subtitleL: 'العنوان الفرعي', sessionTitleL: 'عنوان الجلسة', dayTitleL: 'عنوان اليوم', taglineL: 'الوصف', addToCalL: 'إضافة إلى التقويم', locationL: 'الموقع', teamOwner: 'المسؤول / الفريق', notesL: 'ملاحظات', dateL: 'التاريخ', timeL: 'الوقت',
      empDirT: 'دليل الموظفين', empDirTxt: 'ارفع ملف CSV (من إكسل) يتضمن أسماء الموظفين وبريدهم الإلكتروني وأرقام هواتفهم. عند إضافة أعضاء لفريق العمل يمكنك البحث في الدليل واختيار الموظف بدلاً من كتابة بياناته.', empDirUploadL: 'رفع الملف (CSV)', empDirClearL: 'مسح الدليل', empSearchL: 'البحث في دليل الموظفين', empSearchPh: 'اكتب اسماً أو بريداً أو رقم هاتف…', accReqL: 'هل يحتاج الموظف إلى سكن؟', nomPendingT: 'تعديلات فريق العمل قيد الاعتماد', nomPendingPill: 'قيد الاعتماد', nomApproveL: 'اعتماد', nomRejectL: 'رفض', nomInExecL: 'تتم المراجعة والاعتماد في لوحة النظرة التنفيذية.', notifT: 'إجراء مطلوب', notifEmpty: 'لا توجد إجراءات مطلوبة حالياً.',
      fbTitle: 'ملاحظات ما بعد الفعالية', fbSub: 'شارك ملاحظاتك حول فريقك أو أي فريق آخر بعد انتهاء الفعالية.', fbLockedT: 'تُفتح الملاحظات بعد انتهاء الفعالية', fbLockedTxt: 'تُفتح هذه الصفحة تلقائياً بعد اكتمال الفعالية، ليتمكن كل فريق من ترك ملاحظاته حول فريقه أو الفرق الأخرى.', fbOpenNowL: 'فتح الملاحظات الآن (الإدارة)', fbFormT: 'إرسال ملاحظات', fbNameL: 'اسمك', fbNamePh: 'الاسم الكامل…', fbOwnTeamL: 'فريقك', fbTeamL: 'عن أي فريق هذه الملاحظات؟', fbTextL: 'الملاحظات', fbTextPh: 'اكتب ملاحظاتك — ما الذي سار جيداً وما الذي يمكن تحسينه…', fbSubmitL: 'إرسال الملاحظات', fbListT: 'الملاحظات المرسلة', fbEmpty: 'لا توجد ملاحظات بعد.', fbExportL: 'استخراج التقرير (إكسل)',
      htTitle: 'الإقامة الفندقية', htSub: 'الموظفون الذين يحتاجون إلى سكن من جميع الفرق. عيّن الفندق ورقم التأكيد ومواعيد الدخول والخروج وشريك السكن ثم استخرج القائمة.', htExportL: 'استخراج القائمة (إكسل)', htTeamL: 'الفريق', htContactL: 'التواصل', htGenderL: 'الجنس', htHotelL: 'الفندق', htRoomL: 'الغرفة', htConfL: 'رقم التأكيد', htStayL: 'الدخول / الخروج', htCinL: 'تسجيل الدخول', htCoutL: 'تسجيل الخروج', htConfPh: 'مرجع الحجز…', htRoommateL: 'شريك السكن', htPrefL: 'يفضّل', htRejectMateL: 'رفض شريك السكن', htApproveMateL: 'اعتماد شريك السكن', htApprovedL: 'معتمد', htNotifyL: 'إشعار', htWaL: 'إرسال تأكيد واتساب', htEmL: 'إرسال تأكيد بالبريد', htNotifyHint: 'عيّن الفندق أولاً', htEmTag: 'أُرسل البريد', htWaTag: 'أُرسل واتساب', htMaleL: 'ذكر', htFemaleL: 'أنثى', htHotelPh: 'اسم الفندق…', htRoomPh: 'رقم', htRoommatePh: 'شريك السكن المعيّن…', htEmptyT: 'لا توجد طلبات سكن بعد', htEmptyTxt: 'سيظهر هنا تلقائياً الموظفون الذين تم تحديدهم بحاجة إلى سكن في فرق العمل.', yesL: 'نعم', noL: 'لا', accPartnerL: 'في حال كان السكن مشتركاً، اقترح شريك السكن المفضل.', accPartnerPh: 'شريك السكن المفضل…',
      setTitle: 'الإعدادات', setSub: 'اللغة والوصول الإداري وبيانات التطبيق.',
      shareL: 'مشاركة', pdfReadyTitle: 'ملف PDF جاهز', pdfReadyMsg: 'تم إنشاء ملف PDF لصفحة الفريق.', downloadPdfL: 'تحميل PDF', sharePdfL: 'مشاركة PDF', openWhatsappL: 'فتح واتساب',
      apprTitle: 'الاعتمادات', apprSub: 'جميع طلبات الاعتماد من صفحات الفرق مع إمكانية إنشاء طلب جديد.', createApprL: 'إنشاء طلب اعتماد', createApprTitle: 'طلب اعتماد جديد',
      apprPending: 'قيد الاعتماد', apprApprovedWk: 'اعتُمد هذا الأسبوع', apprRejectedN: 'طلبات مرفوضة', apprHighN: 'اعتمادات عالية الأولوية',
      apprTeamL: 'الفريق', apprByL: 'مقدَّم من', apprEventL: 'الفعالية', apprReqDateL: 'تاريخ الطلب', apprPriorityL: 'الأولوية', apprDescL: 'الوصف',
      apprAttachPh: 'ملاحظات داعمة / مرفق — عنصر نائب.', apprAttachL: 'مرفق', apprEmpty: 'لا توجد طلبات اعتماد حالياً.',
      apprRejReasonL: 'سبب الرفض', apprRejPh: 'اكتب سبب الرفض…', apprConfirmReject: 'تأكيد الرفض', apprActivityL: 'سجل النشاط',
      apprCommentL: 'تعليقك', apprCommentPh: 'اكتب تعليقاً…', apprAddComment: 'إضافة تعليق', apprApprove: 'اعتماد', apprReject: 'رفض', apprFTitle: 'عنوان الطلب', apprSubmit: 'إرسال الطلب',
      uploadL: 'رفع', uploadPh: 'انقر لرفع ملف (بحد أقصى 2 ميغابايت)', viewL: 'عرض', downloadL: 'تنزيل', viewDetailsL: 'عرض التفاصيل',
      designTitle: 'تصميم الفعالية', designSub: 'جميع مواد التصميم الخاصة بالفعالية في مكان واحد.', designReadinessL: 'جاهزية التصميم', designAssetsL: 'ملفات مرفوعة', designOwnerL: 'مسؤول التصميم', designUpdatedL: 'آخر تحديث', designPendingL: 'اعتمادات معلقة', designEmpty: 'لم يتم رفع ملفات تصميم بعد.',
      calTitle: 'تقويم الفعاليات القادمة', calCreateNew: 'إنشاء جديد',
      latestUpdL: 'آخر التحديثات', leadershipL: 'قادة الفريق', noUpdYet: 'لم يُرفع تحديث بعد',
      challengesL: 'التحديات', apprL: 'الموافقات المعلقة', nextStepsL: 'الخطوات التالية', tasksL: 'مهمة', noneYet: '—',
      wfPhotoL: 'إضافة صورة', wfNameL: 'الاسم', wfRoleL: 'الدور / المسؤولية', wfSaveL: 'حفظ', wfDeleteL: 'إزالة',
      shareCommentL: 'مشاركة تعليق', sharePreviewL: 'معاينة البطاقة', shareCommentPh: 'أضف تعليقك قبل المشاركة…', shareMsgPreviewL: 'معاينة الرسالة', copyMsgL: 'نسخ الرسالة', shareWhatsappL: 'مشاركة عبر واتساب', shareEmailL: 'مشاركة عبر البريد الإلكتروني', shareCommentTitle: 'مشاركة تعليق',
      commentL: 'تعليق', yourCommentL: 'تعليقك', yourCommentPh: 'اكتب تعليقك هنا…', teamPageLinkL: 'رابط صفحة الفريق', openTeamPageL: 'فتح صفحة الفريق', sendWhatsappL: 'إرسال عبر واتساب', eventNameL: 'الفعالية', selectToComment: 'اختر عنصرًا للتعليق', commentingOnL: 'التعليق على',
      setLang: 'اللغة', setAccess: 'صلاحية الإدارة', setAccessTxt: 'فعّل صلاحية الإدارة لإتاحة التعديل وعرض تفصيل الميزانية.',
      setTheme: 'كثافة العرض', setThemeTxt: 'بدّل بين العرض المريح والمضغوط حسب تفضيلك.',
      setData: 'البيانات المحلية', setDataTxt: 'إعادة ضبط البيانات التجريبية المحفوظة في هذا المتصفح.', setReset: 'إعادة ضبط البيانات التجريبية',
      setDensity: 'كثافة العرض', densComfort: 'مريح', densCompact: 'مضغوط',
      backToEvents: 'رجوع', eventsTracker: 'متتبع الفعاليات', landingSub: 'وزارة شؤون مجلس الوزراء · متتبع الفعاليات الحكومية',
      openTrackerL: 'فتح المتتبع', addEventT: 'إضافة فعالية جديدة', createNewL: 'إنشاء جديد', createTrackerL: 'إنشاء المتتبع',
      fEvName: 'اسم الفعالية', fEvNameAr: 'اسم الفعالية بالعربية', fEvLogo: 'شعار الفعالية', fEvLogoHint: 'تحميل الشعار (اختياري)', fEvPeriod: 'تاريخ / فترة الفعالية', fEvOwner: 'الفريق المسؤول',
      emptyUpdates: 'لا توجد تحديثات بعد', emptyOps: 'لا توجد بنود تشغيلية بعد', emptyTimelineL: 'لا توجد بنود زمنية بعد', emptySubmits: 'لا توجد تحديثات مُرسلة بعد',
      budgetTitle: 'تفصيل الميزانية', budgetLocked: 'فعّل صلاحية الإدارة لعرض تفصيل الميزانية.', blankOverviewSub: 'لم تُنشر مؤشرات الملخص التنفيذي لهذه الفعالية بعد. القوى العاملة ومتابعة الفرق متاحة في متتبع العمليات.',
      addTeamL: 'إضافة فريق', importL: 'استيراد CSV', removeL: 'إزالة', teamNameL: 'الفريق / مسار العمل', teamNameArL: 'الاسم بالعربية',
      opsUpdTitle: 'مستجدات العمليات', ovReadiness: 'الجاهزية التشغيلية العامة', ovStatusTitle: 'حالة الفرق', ovAttnTitle: 'بنود تتطلب المتابعة', ovAttnSubT: 'الفرق التي تحتاج انتباه الإدارة، مرتبة حسب الحالة', ovTeams: 'الفرق', ovTeamsSub: 'إجمالي الفرق التشغيلية', ovOnTrackSub: 'على المسار الصحيح', ovAttnSub: 'تتطلب المتابعة', ovRiskSub: 'معرّضة للخطر', ovOpenActions: 'بنود العمل المفتوحة', ovOpenActionsSub: 'عبر جميع الفرق', ovApprSub: 'بانتظار الاعتماد', ovHeroNote: 'الجاهزية محسوبة من متوسط تقدّم جميع الفرق التشغيلية.', ovAgmNote: 'تُبنى هذه اللوحة من تحديثات فريق العمليات للاجتماعات السنوية.', reviewTeams: 'عرض الفرق ←', zeroSub: 'ابنِ المتتبع التشغيلي لهذه الفعالية بإضافة فريق لكل مسار عمل، أو استوردها من ملف CSV (الأعمدة: Team, Lead, Deputy, Progress, Status, Due).', zeroLocked: 'فعّل صلاحية الإدارة لبناء المتتبع التشغيلي.'
    } : {
      opTracker: 'Operational Tracker', close: 'Close', viewTeam: 'View team', apprItem: 'Approval Item', responsible: 'Responsible', exportSummaryL: 'Export Team Summary', roleLabel: 'Role / responsibility',
      backToTracker: 'Back to Operational Tracker', nextDue: 'Next Due', openItems: 'open action items', delayL: 'Delay', delayFlag: 'Behind schedule',
      trkViewTable: 'Table', trkViewCards: 'Cards',
      thAction: 'Action / Task', thPriority: 'Priority', thDependency: 'Dependency', thNext: 'Next Steps', thChal: 'Challenges', thApproval: 'Approval', mtToggleL: 'This task includes a meeting', mtChipL: 'Meeting', mtRecL: 'Meeting Recipients', mtPurL: 'Purpose', mtLocL: 'Location', mtTimeL: 'Timing', exportTimeline: 'Export Timeline', editSessionL: 'Edit Session', editDayL: 'Edit Day', subtitleL: 'Subtitle', sessionTitleL: 'Session title', dayTitleL: 'Day title', taglineL: 'Tagline', addToCalL: 'Add to Calendar', locationL: 'Location', teamOwner: 'Owner / Team', notesL: 'Notes', dateL: 'Date', timeL: 'Time',
      empDirT: 'Employee Directory', empDirTxt: 'Upload a CSV sheet (exported from Excel) with employee names, email addresses and phone numbers. When adding workforce members you can then search the directory and pick an employee instead of typing their details.', empDirUploadL: 'Upload Sheet (CSV)', empDirClearL: 'Clear Directory', empSearchL: 'Search Employee Directory', empSearchPh: 'Type a name, email or phone…', accReqL: 'Does the employee require accommodation?', nomPendingT: 'Pending Workforce Approvals', nomPendingPill: 'Pending Approval', nomApproveL: 'Approve', nomRejectL: 'Reject', nomInExecL: 'Review and approve in the Executive Overview.', notifT: 'Action Required', notifEmpty: 'Nothing needs your action right now.',
      fbTitle: 'Post-Event Feedback', fbSub: 'Share feedback about your own team or any other team once the event has concluded.', fbLockedT: 'Feedback opens after the event', fbLockedTxt: 'This page unlocks automatically once the event is completed. Teams can then leave feedback about their own team or other teams.', fbOpenNowL: 'Open feedback now (Admin)', fbFormT: 'Submit Feedback', fbNameL: 'Your name', fbNamePh: 'Full name…', fbOwnTeamL: 'Your team', fbTeamL: 'Which team is this feedback about?', fbTextL: 'Feedback', fbTextPh: 'Write your feedback — what went well, what could improve…', fbSubmitL: 'Submit Feedback', fbListT: 'Submitted Feedback', fbEmpty: 'No feedback submitted yet.', fbExportL: 'Extract Report (Excel)',
      htTitle: 'Hotel Accommodation', htSub: 'Employees who require accommodation across all teams. Assign hotel, confirmation number, check-in/check-out and roommate, then extract the list.', htExportL: 'Extract List (Excel)', htTeamL: 'Team', htContactL: 'Contact', htGenderL: 'Gender', htHotelL: 'Hotel', htRoomL: 'Room', htConfL: 'Confirmation #', htStayL: 'Check-in / Check-out', htCinL: 'Check-in', htCoutL: 'Check-out', htConfPh: 'Booking ref…', htRoommateL: 'Roommate', htPrefL: 'Prefers', htRejectMateL: 'Reject roommate', htApproveMateL: 'Approve roommate', htApprovedL: 'Approved', htNotifyL: 'Notify', htWaL: 'Send WhatsApp confirmation', htEmL: 'Send email confirmation', htNotifyHint: 'Assign hotel first', htEmTag: 'Email sent', htWaTag: 'WhatsApp sent', htMaleL: 'Male', htFemaleL: 'Female', htHotelPh: 'Hotel name…', htRoomPh: 'No.', htRoommatePh: 'Assigned roommate…', htEmptyT: 'No accommodation requests yet', htEmptyTxt: 'Employees marked as requiring accommodation in the team workforce will appear here automatically.', yesL: 'Yes', noL: 'No', accPartnerL: 'In case accommodation is shared, recommend a preferred roommate.', accPartnerPh: 'Preferred roommate…',
      setTitle: 'Settings', setSub: 'Language, management access, and local app data.',
      shareL: 'Share', pdfReadyTitle: 'PDF Ready', pdfReadyMsg: 'Your team page PDF has been generated.', downloadPdfL: 'Download PDF', sharePdfL: 'Share PDF', openWhatsappL: 'Open WhatsApp',
      apprTitle: 'Approvals', apprSub: 'All approval requests from team pages, plus manually created requests.', createApprL: 'Create Approval Request', createApprTitle: 'New Approval Request',
      apprPending: 'Pending Approvals', apprApprovedWk: 'Approved This Week', apprRejectedN: 'Rejected Items', apprHighN: 'High-Priority Approvals',
      apprTeamL: 'Team', apprByL: 'Requested By', apprEventL: 'Event', apprReqDateL: 'Request Date', apprPriorityL: 'Priority', apprDescL: 'Description',
      apprAttachPh: 'Supporting notes / attachment — placeholder.', apprAttachL: 'Attachment', apprEmpty: 'No approval requests yet.',
      apprRejReasonL: 'Rejection Reason', apprRejPh: 'Add a short rejection reason…', apprConfirmReject: 'Confirm Rejection', apprActivityL: 'Activity History',
      apprCommentL: 'Your comment', apprCommentPh: 'Write a comment…', apprAddComment: 'Add Comment', apprApprove: 'Approve', apprReject: 'Reject', apprFTitle: 'Approval title', apprSubmit: 'Submit Request',
      uploadL: 'Upload', uploadPh: 'Click to upload a file (max 2 MB)', viewL: 'View', downloadL: 'Download', viewDetailsL: 'View Details',
      designTitle: 'Event Design', designSub: 'All event design materials for this event in one organized place.', designReadinessL: 'Design Readiness', designAssetsL: 'Uploaded Assets', designOwnerL: 'Design Owner', designUpdatedL: 'Last Updated', designPendingL: 'Pending Approvals', designEmpty: 'No design files uploaded yet.',
      calTitle: 'Upcoming Events Calendar', calCreateNew: 'Create New',
      latestUpdL: 'Latest Updates', leadershipL: 'Team Leads', noUpdYet: 'No update submitted yet',
      challengesL: 'Challenges', apprL: 'Pending Approvals', nextStepsL: 'Next Steps', tasksL: 'tasks', noneYet: '—',
      wfPhotoL: 'Add photo', wfNameL: 'Name', wfRoleL: 'Role / Responsibility', wfSaveL: 'Save', wfDeleteL: 'Remove',
      shareCommentL: 'Share Comment', sharePreviewL: 'Card preview', shareCommentPh: 'Add your comment before sharing…', shareMsgPreviewL: 'Message preview', copyMsgL: 'Copy Message', shareWhatsappL: 'Share via WhatsApp', shareEmailL: 'Share via Email', shareCommentTitle: 'Share Comment',
      commentL: 'Comment', yourCommentL: 'Your comment', yourCommentPh: 'Write your comment here…', teamPageLinkL: 'Team page link', openTeamPageL: 'Open team page', sendWhatsappL: 'Send WhatsApp', eventNameL: 'Event', selectToComment: 'Select an item to comment', commentingOnL: 'Commenting On',
      setLang: 'Language', setAccess: 'Management Access', setAccessTxt: 'Enable Management Access to unlock editing and detailed budget breakdowns.',
      setTheme: 'Display Density', setThemeTxt: 'Switch between comfortable and compact layouts to suit your preference.',
      setData: 'Local Data', setDataTxt: 'Reset demo data, members, photos and saved edits stored in this browser.', setReset: 'Reset demo data',
      setDensity: 'Display Density', densComfort: 'Comfortable', densCompact: 'Compact',
      backToEvents: 'Back', eventsTracker: 'Events Tracker', landingSub: 'Ministry of Cabinet Affairs ',
      openTrackerL: 'Open Tracker', addEventT: 'Add New Event', createNewL: 'Create New', createTrackerL: 'Create Tracker',
      fEvName: 'Event name', fEvNameAr: 'Arabic event name', fEvLogo: 'Event logo', fEvLogoHint: 'Upload logo (optional)', fEvPeriod: 'Event date / period', fEvOwner: 'Lead team / owner',
      emptyUpdates: 'No updates added yet', emptyOps: 'No operational items added yet', emptyTimelineL: 'No timeline items added yet', emptySubmits: 'No submitted updates yet',
      budgetTitle: 'Detailed Budget Breakdown', budgetLocked: 'Enable Management Access to view the detailed budget breakdown.', blankOverviewSub: 'Executive summary metrics haven’t been published for this event yet. The operational workforce and team tracking are available in the Operational Tracker.',
      addTeamL: 'Add Team', importL: 'Import CSV', removeL: 'Remove', teamNameL: 'Team / Streamline', teamNameArL: 'Arabic name',
      opsUpdTitle: 'Operations Updates', ovReadiness: 'Overall Operational Readiness', ovStatusTitle: 'Team Status', ovAttnTitle: 'Items Requiring Attention', ovAttnSubT: 'Teams needing management attention, ordered by status', ovTeams: 'Teams', ovTeamsSub: 'Total operational teams', ovOnTrackSub: 'On track', ovAttnSub: 'Need attention', ovRiskSub: 'At risk', ovOpenActions: 'Open Action Items', ovOpenActionsSub: 'Across all teams', ovApprSub: 'Awaiting sign-off', ovHeroNote: 'Readiness is the average progress across all operational teams.', ovAgmNote: 'This dashboard is built from the Annual Government Meetings operations team updates.', reviewTeams: 'View teams →', zeroSub: 'Build this event’s operational tracker by adding a team for each streamline, or import them from a CSV sheet (columns: Team, Lead, Deputy, Progress, Status, Due).', zeroLocked: 'Enable Management Access to build the operational tracker.'
    };

    const target = new Date('2026-10-13T09:00:00+04:00').getTime();
    let diff = Math.max(0, target - Date.now());
    const cdDays = Math.floor(diff / 86400000); diff -= cdDays * 86400000;
    const cdHrs = Math.floor(diff / 3600000); diff -= cdHrs * 3600000;
    const cdMin = Math.floor(diff / 60000); diff -= cdMin * 60000;
    const cdSec = Math.floor(diff / 1000);

    const STATUS = { g: { pill: 'pg-g', col: '#2C64A8' }, a: { pill: 'pg-a', col: '#B07C1F' }, r: { pill: 'pg-r', col: '#B03A32' } };
    const edits = st.edits || {};
    const initials = s => (s || '').trim().split(/\s+/).map(x => x[0] || '').slice(0, 2).join('').toUpperCase();
    const enrich = (w, i) => { const e = edits[i] || {}; const p = e.p != null ? e.p : w.p; const s = e.s || w.s; return { ...w, idx: i, n: tx(w.n), o: e.o || tx(w.o), dep: tx(w.dep), a: e.a || tx(w.a), b: e.b || tx(w.b), x: e.x || tx(w.x), resp: tx(w.resp), rk: tx(w.rk), ap: tx(w.ap), ms: txd(tx(w.ms)), u: txd(w.u), d: e.d || txd(w.d), p, s, sl: t.statuses[s], ...STATUS[s], deg: (p * 3.6) + 'deg', edit: this.openEdit(i), open: this.openDetail(i) }; };
    const all = this.WS.map(enrich);
    const em = st.editIdx != null ? all[st.editIdx] : null;
    const editStatusOpts = em ? ['g', 'a', 'r'].map(v => ({ v, t: t.statuses[v], sel: em.s === v })) : [];
    let dm = null;
    if (st.detailIdx != null) {
      const w = all[st.detailIdx];
      const msx = st.members || {};
      const roleOf = m => t.roles[m.roleKey] || t.roles.member;
      const force = (msx[st.detailIdx] || []).map(m => ({ n: tx(m.n), role: roleOf(m), ...this.photoObj(m.id, initials(tx(m.n))) }));
      const tracker = [{ t: w.a, dotCls: 'st-done' }, { t: w.x, dotCls: 'st-up' }];
      if (w.ms) tracker.push({ t: w.ms, dotCls: 'st-up' });
      if (w.ap && w.ap !== 'None' && w.ap !== 'لا يوجد') tracker.push({ t: w.ap, dotCls: 'st-crit' });
      dm = { ...w, force, tracker, depInit: initials(w.dep), leadPhoto: this.photoObj('L' + st.detailIdx, initials(w.o)), edit: this.openEdit(st.detailIdx), goUpdate: this.goUpdateFn(w.n) };
    }
    const deptEdits = st.deptEdits || {};
    const deptMembersS = st.deptMembers || {};
    const role = st.role || 'inputter';
    const canExec = role === 'admin' || role === 'he';
    const pageEff = (st.page === 'mgmt' && !st.admin) ? 'dash' : (((st.page === 'overview' || st.page === 'approvals') && !canExec) ? 'dash' : st.page);
    const ACTIVE_DEPTS = st.event === 'agm' ? this.AGM_DEPTS : (st.event === 'wef' ? this.DEPTS : []);
    const _myStream0 = role === 'inputter' ? (st.myStreams || {})[st.event] : null;
    const ALL_DEPTS = [...this.DEPTS, ...this.AGM_DEPTS];
    const META = { ...this.DEPT_META, ...this.AGM_META };
    const customTasks = st.tasks || {};
    const taskOvAll = st.taskOv || {};
    const taskDelAll = st.taskDel || {};
    const teamActionsOf = (id) => { const base = [...((META[id] || {}).actions || []), ...((customTasks[id] || []))]; const ov = taskOvAll[id] || {}; const del = taskDelAll[id] || []; return base.map((a, i) => ({ ...(ov[i] ? { ...a, ...ov[i] } : a), _i: i })).filter(a => !del.includes(a._i)); };
    const ACTIVE_EVENT = st.event === 'agm' ? this.AGM_EVENT : (st.event === 'wef' ? this.EVENT : []);
    const depEnrich = (d) => {
      const e2 = deptEdits[d.id] || {};
      const meta = META[d.id] || { p: 0, due: '', delay: false, actions: [] };
      const sx = (() => { const acts = teamActionsOf(d.id); if (!acts.length) return e2.s || d.s; if (acts.some(a => a.s === 'r')) return 'r'; if (acts.some(a => a.s === 'a')) return 'a'; return 'g'; })();
      const upd = e2.upd != null ? String(e2.upd).split('\n').map(x => x.trim()).filter(Boolean) : d.upd.map(tx);
      const chal = e2.chal != null ? String(e2.chal).split('\n').map(x => x.trim()).filter(Boolean) : d.chal.map(tx);
      const leadN = e2.leadN || d.lead.n, depN = e2.depN || d.dep.n;
      return {
        id: d.id, n: e2.n || tx(d.n), s: sx, sl: t.statuses[sx], pill: STATUS[sx].pill, tcCls: 'tc-' + sx, u: e2.u || txd(d.u),
        leadN, leadT: e2.leadT || tx(d.lead.t), depN, depT: e2.depT || tx(d.dep.t), depInit: initials(depN),
        leadPhoto: this.photoObj('DL' + d.id, initials(leadN)), depPhoto: this.photoObj('DD' + d.id, initials(depN)),
        leadNoPhoto: !this.state.photos['DL' + d.id], depNoPhoto: !this.state.photos['DD' + d.id],
        upd, chal, latestUpd: upd[0] || '', hasLatestUpd: upd.length > 0, noLatestUpd: upd.length === 0,
        chalFirst: chal[0] || '', hasChal: chal.length > 0, noChal: chal.length === 0,
        apprItem: e2.apprItem || tx(d.appr.item), apprDec: e2.apprDec || tx(d.appr.dec), apprOwner: e2.apprOwner || d.appr.owner, apprDue: e2.apprDue || txd(d.appr.due),
        nextAction: e2.nextAction || tx(d.next.action), nextWho: e2.nextWho || d.next.who, nextDue: e2.nextDue || txd(d.next.due),
        p: (() => { const acts = teamActionsOf(d.id); if (!acts.length) return (e2.p != null ? e2.p : meta.p); return Math.round(acts.filter(a => a.s === 'g' || a.s === 'd').length / acts.length * 100); })(), col: STATUS[sx].col, due: txd(meta.due), delay: !!meta.delay, openCount: teamActionsOf(d.id).length,
        open: this.openTeam(d.id), edit: this.openDeptEdit(d.id)
      };
    };
    const depts = ACTIVE_DEPTS.map(depEnrich);
    const _leadSet = role === 'lead' ? this._leadStreams() : null;
    const myDepts = _leadSet ? depts.filter(d => _leadSet.indexOf(d.id) !== -1) : (_myStream0 ? depts.filter(d => d.id === _myStream0) : []);
    const otherDepts = _leadSet ? depts.filter(d => _leadSet.indexOf(d.id) === -1) : (_myStream0 ? depts.filter(d => d.id !== _myStream0) : depts);
    const _allTasks = depts.reduce((s, d) => s + teamActionsOf(d.id).length, 0);
    const _doneTasks = depts.reduce((s, d) => s + teamActionsOf(d.id).filter(a => a.s === 'g').length, 0);
    const taskReadiness = _allTasks ? Math.round(_doneTasks / _allTasks * 100) : 0;
    const taskReadinessNote = ar ? (_doneTasks + ' من ' + _allTasks + ' مهمة مكتملة') : (_doneTasks + ' of ' + _allTasks + ' tasks completed');
    const prLbl = { h: ar ? 'عالية' : 'High', m: ar ? 'متوسطة' : 'Medium', l: ar ? 'منخفضة' : 'Low' };
    const tsLbl = { n: ar ? 'لم يبدأ' : 'Not Started', p: ar ? 'قيد التنفيذ' : 'In Progress', a: ar ? 'يتطلب متابعة' : 'Attention', g: ar ? 'مكتمل' : 'Completed' };
    const tsPill = { n: 'pg-neutral', p: 'pg-b', a: 'pg-a', g: 'pg-g' };
    const tsk = s => ({ r: 'a', d: 'g' }[s] || (tsLbl[s] ? s : 'p'));
    const apLbl = { req: ar ? 'مطلوب' : 'Required', nr: ar ? 'غير مطلوب' : 'Not Required', pend: ar ? 'قيد الاعتماد' : 'Pending' };
    const apPill = { req: 'pg-a', nr: 'pg-neutral', pend: 'pg-b' };
    const taskDrafts = st.taskDrafts || [];
    const taskDraftRows = taskDrafts.map((d, i) => ({
      task: d.task || '', owner: d.owner || '', due: d.due || '', dep: d.dep || '', nx: d.nx || '', num: String(i + 1),
      statusOpts: ['n', 'p', 'a', 'g'].map(v => ({ v, t: tsLbl[v], sel: tsk(d.s || 'n') === v })),
      prOpts: [['h', prLbl.h], ['m', prLbl.m], ['l', prLbl.l]].map(p => ({ v: p[0], t: p[1], sel: (d.pr || 'm') === p[0] })),
      onTask: this.setTaskDraft(i, 'task'), onOwner: this.setTaskDraft(i, 'owner'), onDue: this.setTaskDraft(i, 'due'),
      onDep: this.setTaskDraft(i, 'dep'), onNx: this.setTaskDraft(i, 'nx'), onStatus: this.setTaskDraft(i, 's'), onPr: this.setTaskDraft(i, 'pr'),
      remove: () => this.removeTaskDraft(i)
    }));
    let teamView = null;
    if (st.teamView != null) {
      const dd = ALL_DEPTS.find(x => x.id === st.teamView);
      if (dd) {
        const dx = depEnrich(dd);
        const meta = META[dd.id] || { actions: [] };
        const realDM = (deptMembersS[dd.id] || []).filter(m => m.n !== 'Team Member');
        const _wfEditable = !!st.admin || this.canEditTeam(dd.id);
        const nomsList = ((st.wfNom || {})[dd.id] || []).map(x => ({ n: x.n, role: tx(x.r) || '', init: initials(x.n), isAdmin: !!st.admin, approve: this.approveWfNom(dd.id, x.id), reject: this.rejectWfNom(dd.id, x.id) }));
        const wf = [
          { n: dx.leadN, role: dx.leadT || t.teamLead, ...dx.leadPhoto, noPhoto: !dx.leadPhoto.hasPhoto, isAdmin: _wfEditable, editCls: _wfEditable ? 'is-editable' : '', edit: _wfEditable ? this.openWfEdit(dd.id, 'lead', null) : null },
          { n: dx.depN, role: dx.depT || t.deputy, ...dx.depPhoto, noPhoto: !dx.depPhoto.hasPhoto, isAdmin: _wfEditable, editCls: _wfEditable ? 'is-editable' : '', edit: _wfEditable ? this.openWfEdit(dd.id, 'dep', null) : null },
          ...realDM.map(m => { const ph = this.photoObj(m.id, initials(tx(m.n))); return { n: tx(m.n), role: tx(m.r), ...ph, noPhoto: !ph.hasPhoto, isAdmin: _wfEditable, editCls: _wfEditable ? 'is-editable' : '', edit: _wfEditable ? this.openWfEdit(dd.id, 'member', m.id) : null }; })
        ];
        const actions = teamActionsOf(dd.id).map((a, i) => ({ t: tx(a.t), o: a.o, s: a.s, sl: tsLbl[tsk(a.s)], pill: tsPill[tsk(a.s)], pr: prLbl[a.pr], prCls: 'pr-' + a.pr, apL: apLbl[a.ap || 'nr'], apPill: apPill[a.ap || 'nr'], d: txd(a.d), dep: tx(a.dep), nx: tx(a.nx), chv: tx(a.ch) || '—',
          hasMt: !!a.mt, openMt: a.mt ? (e => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ mtView: { title: tx(a.t), ...a.mt } }); }) : null, open: this.openAction(dd.id, i), editTask: this.openTaskEdit(dd.id, a._i) }));
        const _mIdx = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        const parseDue = (d) => { const m = /(\d{1,2})\s+([A-Za-z]{3})/.exec(String(d || '')); if (!m) return null; const mo = _mIdx[m[2].slice(0, 3)]; if (mo == null) return null; return mo * 31 + Number(m[1]); };
        const rawA = teamActionsOf(dd.id);
        let nearIdx = -1, nearBest = Infinity;
        rawA.forEach((a, i) => { const v = parseDue(a.d); if (v != null && v < nearBest) { nearBest = v; nearIdx = i; } });
        const nearestDue = nearIdx >= 0 ? txd(rawA[nearIdx].d) : dx.due;
        const PREVIEW_N = 4;
        const moreCount = Math.max(0, actions.length - PREVIEW_N);
        const viewAllLabel = ar ? ('عرض جميع المهام (' + actions.length + ')') : ('View all ' + actions.length + ' tasks');
        const bRows = [
          [['Flights & tickets', 'الطيران والتذاكر'], 'AED 2,700,000'],
          [['Accommodation', 'الإقامة'], 'AED 1,450,000'],
          [['Giveaways (400 × AED 150)', 'الهدايا (400 × 150)'], 'AED 60,000'],
          [['Gala dinner (estimate)', 'العشاء الرسمي (تقديري)'], 'AED 480,000'],
          [['Transportation tender (estimate)', 'مناقصة النقل (تقديري)'], 'AED 320,000']
        ];
        const isBudget = dd.id === 'd5';
        const sel = st.sel || {};
        const updItems = (dx.upd || []).map(txt => ({ text: txt }));
        const chalItems = (dx.chal || []).map(txt => ({ text: txt }));
        const apprOv = (this.apprStoreFor(st.event).overrides['auto:' + dd.id]) || {};
        const apprSt = apprOv.status || 'pending';
        const apprStMeta = { pending: { l: ar ? 'قيد الاعتماد' : 'Pending Approval', pill: 'pg-a' }, approved: { l: ar ? 'معتمد' : 'Approved', pill: 'pg-g' }, rejected: { l: ar ? 'مرفوض' : 'Rejected', pill: 'pg-r' } }[apprSt];
        const logStore = this.teamLogFor(dd.id);
        const fmtLogD = ts => new Date(ts).toLocaleDateString(ar ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const mkLog = (kind, baseItems, baseOnCard) => {
          const entries = (logStore[kind] || []).slice().sort((a, b) => b.d - a.d);
          const shown = entries.filter(en => !en.hide);
          const bh = this.baseHideFor(dd.id, kind);
          const visBase = baseItems.map((x, i) => ({ x, i })).filter(b => !bh.x.includes(b.i));
          const cardBase = baseOnCard === false ? [] : visBase.filter(b => !bh.h.includes(b.i));
          const items = [
            ...shown.map(en => ({ text: en.t, dateL: fmtLogD(en.d), hasDate: true })),
            ...cardBase.map(b => ({ text: b.x, dateL: '', hasDate: false }))
          ];
          const histCount = entries.length + visBase.length;
          return {
            items, hasItems: items.length > 0,
            hasHist: histCount > 0,
            histCount,
            histLabel: (ar ? 'السجل' : 'History') + ' (' + histCount + ')',
            openHist: this.openLogHist(dd.id, kind),
            openAdd: this.openLogAdd(dd.id, kind),
            adding: !!(st.logAdd && st.logAdd.kind === kind && st.logAdd.teamId === dd.id),
            save: this.saveLogAdd
          };
        };
        teamView = { ...dx, wf, actions, actionsPreview: [...actions].reverse().slice(0, PREVIEW_N), hasMoreActions: actions.length > PREVIEW_N, actionsCount: actions.length, moreCount, viewAllLabel, openTaskFull: this.openTaskFull(dd.id), isBudget, budgetRows: isBudget ? bRows.map(r => ({ lab: tx(r[0]), val: r[1] })) : [],
          due: nearestDue, dueOpen: nearIdx >= 0 ? this.openAction(dd.id, nearIdx) : null, dueCls: nearIdx >= 0 ? 'due dueln' : 'due',
          updItems, chalItems, sharePdf: this.openTeamPdf(dd.id), goUpdate: this.goUpdateFn(dx.n), apprStatusL: apprStMeta.l, apprStatusPill: apprStMeta.pill,
          updLog: mkLog('upd', dx.upd || []), chalLog: mkLog('chal', dx.chal || []), apprLog: mkLog('appr', [dx.apprItem + ' — ' + dx.apprDec], false), nextLog: mkLog('next', [dx.nextAction], false),
          kindBase: { upd: dx.upd || [], chal: dx.chal || [], appr: [dx.apprItem + ' — ' + dx.apprDec], next: [dx.nextAction] },
          apprBaseShown: (() => { const b = this.baseHideFor(dd.id, 'appr'); return !b.x.includes(0) && !b.h.includes(0); })(),
          nextBaseShown: (() => { const b = this.baseHideFor(dd.id, 'next'); return !b.x.includes(0) && !b.h.includes(0); })(),
          openTaskAdd: this.openTaskAdd(dd.id), openApprAdd: this.openCreateApprFor(tx(dx.n)),
          isAdmin: !!st.admin, canEdit: this.canEditTeam(dd.id), openAdd: this.openWfEdit(dd.id, 'member', null), hasNoms: nomsList.length > 0,
          nomCountL: nomsList.length + ' ' + (ar ? (nomsList.length === 1 ? 'تعديل قيد الاعتماد' : 'تعديلات قيد الاعتماد') : (nomsList.length === 1 ? 'change pending approval' : 'changes pending approval')) };
      }
    }
    let actionModal = null;
    let logHistModal = null;
    if (st.logHistView && teamView) {
      const hvKind = st.logHistView.kind;
      const hvCanEdit = this.canEditTeam(st.logHistView.teamId);
      const hvKindT = { upd: t.detUpdates, chal: t.detChallenges, appr: t.detApprovals, next: t.detNext }[hvKind];
      const hvFmt = ts => new Date(ts).toLocaleDateString(ar ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const hvEntries = ((this.teamLogFor(st.logHistView.teamId)[hvKind]) || []).slice().sort((a, b) => b.d - a.d);
      const hvBase = (teamView.kindBase || {})[hvKind] || [];
      const hvBh = this.baseHideFor(st.logHistView.teamId, hvKind);
      const entryRows = hvEntries.map(en => ({
        text: en.t, dateL: hvFmt(en.d),
        hidden: !!en.hide, notHidden: !en.hide, rowCls: en.hide ? 'loghm-row loghm-hidden' : 'loghm-row',
        showTitle: en.hide ? t.logShowL : t.logHideL,
        toggleShow: this.toggleLogShow(st.logHistView.teamId, hvKind, en.d),
        confirming: st.logDelKey === en.d, notConfirming: st.logDelKey !== en.d && hvCanEdit,
        ask: this.askLogDel(en.d),
        yes: this.confirmLogDel(st.logHistView.teamId, hvKind, en.d),
        no: this.cancelLogDel
      }));
      const baseRows = hvBase.map((x, i) => ({ x, i })).filter(b => !hvBh.x.includes(b.i)).map(b => {
        const bKey = 'b:' + hvKind + ':' + b.i;
        const hid = hvBh.h.includes(b.i);
        return {
          text: b.x, dateL: '—',
          hidden: hid, notHidden: !hid, rowCls: hid ? 'loghm-row loghm-hidden' : 'loghm-row',
          showTitle: hid ? t.logShowL : t.logHideL,
          toggleShow: this.toggleBaseShow(st.logHistView.teamId, hvKind, b.i),
          confirming: st.logDelKey === bKey, notConfirming: st.logDelKey !== bKey && hvCanEdit,
          ask: this.askLogDel(bKey),
          yes: this.confirmBaseDel(st.logHistView.teamId, hvKind, b.i),
          no: this.cancelLogDel
        };
      });
      logHistModal = {
        title: t.logHistT + ' — ' + hvKindT, team: teamView.n,
        empty: entryRows.length + baseRows.length === 0,
        rows: [...entryRows, ...baseRows]
      };
    }
    let taskEditModal = null;
    if (st.taskEdit) {
      const te = st.taskEdit;
      const cur = te.idx != null ? teamActionsOf(te.teamId).find(a => a._i === te.idx) : null;
      taskEditModal = {
        title: te.idx == null ? t.taskAddT : t.taskEditT,
        canDelete: te.idx != null && !te.confirmDel, confirmDel: !!te.confirmDel,
        t: cur ? tx(cur.t) : '', o: cur ? cur.o : '', d: cur ? (Array.isArray(cur.d) ? cur.d[0] : cur.d) : '', nx: cur ? tx(cur.nx) : '',
        dIso: (() => { const s = cur ? (Array.isArray(cur.d) ? cur.d[0] : cur.d) : ''; if (!s || s === '—') return ''; const s2 = /\d{4}/.test(s) ? s : s + ' 2026'; const ts = Date.parse(s2); if (isNaN(ts)) return ''; const dt = new Date(ts); return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); })(),
        ownerOpts: (() => {
          const names = [];
          const push = (n) => { const v = (n == null ? '' : (Array.isArray(n) ? tx(n) : String(n))).trim(); if (v && v !== '—' && names.indexOf(v) === -1) names.push(v); };
          const d0 = ALL_DEPTS.find(x => x.id === te.teamId);
          const e0 = deptEdits[te.teamId] || {};
          if (d0) { push(e0.leadN || d0.lead.n); push(e0.depN || d0.dep.n); }
          const ct = Object.keys(st.eventTeams || {}).reduce((a, k) => a.concat((st.eventTeams || {})[k] || []), []).find(x => x && x.id === te.teamId);
          if (ct) { push(e0.leadN || ct.leadN); push(e0.depN || ct.depN); }
          (deptMembersS[te.teamId] || []).forEach(m => push(m.n));
          let curO = cur ? (Array.isArray(cur.o) ? tx(cur.o) : (cur.o || '')) : '';
          curO = (curO || '').trim(); if (curO === '—') curO = '';
          if (curO && names.indexOf(curO) === -1) names.unshift(curO);
          return [{ v: '', l: ar ? '— اختر المسؤول —' : '— Select owner —', sel: !curO }, ...names.map(n => ({ v: n, l: n, sel: n === curO }))];
        })(),
        statusOpts: ['n', 'p', 'a', 'g'].map(k => ({ v: k, l: tsLbl[k], sel: cur ? tsk(cur.s) === k : k === 'n' })),
        prOpts: ['h', 'm', 'l'].map(k => ({ v: k, l: prLbl[k], sel: cur ? cur.pr === k : k === 'm' })),
        apOpts: ['req', 'nr', 'pend'].map(k => ({ v: k, l: apLbl[k], sel: (cur ? (cur.ap || 'nr') : 'nr') === k })),
        ...(() => { const mtCur = (cur && cur.mt) || {}; const mtOn = te.mtOpen != null ? te.mtOpen : !!(cur && cur.mt);
          return { mtOn, toggleMt: () => this.setState(s => ({ taskEdit: { ...s.taskEdit, mtOpen: !mtOn } })),
            mtRec: mtCur.rec || '', mtPur: mtCur.pur || '', mtLoc: mtCur.loc || '', mtDate: mtCur.d || '', mtTime: mtCur.tm || '' }; })()
      };
    }
    let logAddModal = null;
    if (st.logAdd && teamView) {
      const kindT = { upd: t.detUpdates, chal: t.detChallenges, appr: t.detApprovals, next: t.detNext }[st.logAdd.kind];
      logAddModal = { title: (ar ? 'إضافة إلى: ' : 'Add to: ') + kindT, team: teamView.n };
    }
    if (st.actionKey) {
      const parts = st.actionKey.split(':'); const a = teamActionsOf(parts[0])[Number(parts[1])];
      if (a) actionModal = { t: tx(a.t), o: a.o, d: txd(a.d), s: a.s, sl: tsLbl[tsk(a.s)], pill: tsPill[tsk(a.s)], pr: prLbl[a.pr], prCls: 'pr-' + a.pr, up: tx(a.up), ch: tx(a.ch), dep: tx(a.dep), nx: tx(a.nx) };
    }
    const _tlE = (st.tlEdits || {})[st.event] || {}; const _tlB = _tlE.blocks || {}; const _tlD = _tlE.days || {};
    const _adminTl = !!st.admin && !!st.tlMode;
    const eventDays = ACTIVE_EVENT.map((d, di) => { const _do = _tlD[di] || {}; return {
      date: _do.date != null ? _do.date : tx(d.date), day: _do.day != null ? _do.day : tx(d.day),
      tagline: _do.tagline != null ? _do.tagline : (d.tagline ? tx(d.tagline) : ''), hasTag: _do.tagline != null ? !!_do.tagline : !!d.tagline,
      iconEl: this.icon(d.icon), desc: d.desc ? tx(d.desc) : '', hasBlocks: (d.blocks || []).length > 0,
      editable: _adminTl, editDay: this.openTlDay(di),
      blocks: (d.blocks || []).map((b, bi) => { const _bo = _tlB[di + ':' + bi] || {}; return { time: _bo.time != null ? _bo.time : b.time, t: _bo.t != null ? _bo.t : tx(b.t), sub: _bo.sub != null ? _bo.sub : (b.sub ? tx(b.sub) : ''), hasSub: _bo.sub != null ? !!_bo.sub : !!b.sub, iconEl: this.icon(b.icon), editCls: _adminTl ? 'agblock-edit' : '', open: _adminTl ? this.openTlBlock(di, bi) : this.openBlock(di, bi) }; })
    }; });
    let tlBlockModal = null;
    if (st.tlKey != null) { const p = st.tlKey.split(':'); const d = ACTIVE_EVENT[Number(p[0])]; const b = d && (d.blocks || [])[Number(p[1])]; if (b) { const _bo = _tlB[st.tlKey] || {}; tlBlockModal = { time: _bo.time != null ? _bo.time : b.time, t: _bo.t != null ? _bo.t : tx(b.t), sub: _bo.sub != null ? _bo.sub : (b.sub ? tx(b.sub) : ''), loc: _bo.loc != null ? _bo.loc : (b.loc ? tx(b.loc) : ''), team: _bo.team != null ? _bo.team : (b.team ? tx(b.team) : ''), notes: _bo.notes != null ? _bo.notes : (b.notes ? tx(b.notes) : '') }; } }
    let tlDayModal = null;
    if (st.tlDayKey != null) { const d = ACTIVE_EVENT[Number(st.tlDayKey)]; if (d) { const _do = _tlD[st.tlDayKey] || {}; tlDayModal = { date: _do.date != null ? _do.date : tx(d.date), day: _do.day != null ? _do.day : tx(d.day), tagline: _do.tagline != null ? _do.tagline : (d.tagline ? tx(d.tagline) : '') }; } }
    let agendaModal = null;
    if (st.agendaKey) {
      const parts = st.agendaKey.split(':'); const d = ACTIVE_EVENT[Number(parts[0])] || this.EVENT[Number(parts[0])]; const b = d && (d.blocks || [])[Number(parts[1])];
      if (b) agendaModal = { t: tx(b.t), date: tx(d.date), time: b.time, loc: tx(b.loc), team: tx(b.team), notes: tx(b.notes), addToCal: this.buildCalDownload((b.t && b.t[0]) || '', (d.date && d.date[0]) || '', b.time, (b.loc && b.loc[0]) || '', (b.notes && b.notes[0]) || '') };
    }
    const accS = st.acc || { wf: true };
    let wfEditView = null;
    if (st.wfEdit) {
      const w = st.wfEdit;
      const kindL = w.kind === 'lead' ? (ar ? 'قائد الفريق' : 'Team Lead') : w.kind === 'dep' ? (ar ? 'النائب' : 'Deputy') : (ar ? 'عضو الفريق' : 'Team Member');
      const title = w.isNew ? (ar ? 'إضافة عضو' : 'Add Member') : (ar ? 'تعديل: ' : 'Edit: ') + kindL;
      const initSrc = (w.name || '').trim();
      const avStyle = w.photo ? 'background-image:url(' + w.photo + ');color:transparent;' : '';
      const dir = st.empDir || [];
      const q = (w.q || '').trim().toLowerCase();
      const results = q ? dir.filter(x => ((x.eid || '') + ' ' + (x.n || '') + ' ' + (x.em || '') + ' ' + (x.ph || '')).toLowerCase().includes(q)).slice(0, 6)
        .map(x => ({ n: x.n, meta: [x.eid, x.em, x.ph].filter(Boolean).join(' · ') || '—', pick: () => this.setState(s => ({ wfEdit: { ...s.wfEdit, name: x.n, em: x.em || '', ph: x.ph || '', gd: x.gd || '', eid: x.eid || '', q: '' } })) })) : [];
      wfEditView = { title, name: w.name || '', role: w.role || '', avStyle, avInit: w.photo ? '' : (initials(initSrc) || '+'),
        hasPhoto: !!w.photo, noPhoto: !w.photo, photo: w.photo || '', photoEl: w.photo ? React.createElement('img', { className: 'wfedit-avimg', src: w.photo, alt: '' }) : null,
        hasDir: dir.length > 0, q: w.q || '', hasResults: results.length > 0, results,
        accOn: !!w.acc, accYesCls: w.acc ? 'on' : '', accNoCls: w.acc ? '' : 'on', accP: w.accP || '',
        ...(() => { const pq = (w.accPq ? (w.accP || '') : '').trim().toLowerCase();
          const pres = pq ? dir.filter(x => ((x.eid || '') + ' ' + (x.n || '')).toLowerCase().includes(pq) && x.n !== (w.name || '')).slice(0, 6)
            .map(x => ({ n: x.n, meta: [x.eid, x.em].filter(Boolean).join(' · ') || '—', pick: () => this.setState(s => ({ wfEdit: { ...s.wfEdit, accP: x.n, accPq: false } })) })) : [];
          return { accPResults: pres, hasAccPResults: pres.length > 0 }; })(),
        canDelete: w.kind === 'member' && !w.isNew };
    }
    const mkAcc = (key) => ({ cls: accS[key] ? 'open' : '', toggle: this.toggleAcc(key) });
    let deptModal = null;
    if (st.deptIdx != null) {
      const dd = ALL_DEPTS.find(x => x.id === st.deptIdx);
      const dx = depEnrich(dd);
      const force = (deptMembersS[dd.id] || []).filter(m => m.n !== 'Team Member').map(m => ({ id: m.id, n: tx(m.n), role: tx(m.r), ...this.photoObj(m.id, initials(tx(m.n))), remove: this.removeDeptMember(dd.id, m.id), editName: this.editDeptMemberName(dd.id, m.id), editRole: this.editDeptMemberRole(dd.id, m.id) }));
      deptModal = { ...dx, force, noForce: force.length === 0, accWf: mkAcc('wf'), accUpd: mkAcc('upd'), accChal: mkAcc('chal'), accAppr: mkAcc('appr'), accNext: mkAcc('next'), addMember: this.addDeptMember(dd.id), edit: this.openDeptEdit(dd.id), exportSummary: () => this.exportSummary(dd.id) };
    }
    let deptEditModal = null;
    if (st.deptEditIdx != null) {
      const de = ALL_DEPTS.find(x => x.id === st.deptEditIdx);
      const dxe = depEnrich(de);
      deptEditModal = { ...dxe, updText: dxe.upd.join('\n'), chalText: dxe.chal.join('\n'), statusOpts: ['g', 'a', 'r'].map(v => ({ v, t: t.statuses[v], sel: dxe.s === v })) };
    }
    const membersState = st.members || {};
    const ord = this.getOrder();
    const teams = ord.map((wsIdx, pos) => {
      const w = all[wsIdx];
      const list = (membersState[wsIdx] || []).map(m => ({ n: tx(m.n), role: t.roles[m.roleKey] || t.roles.member, remove: this.removeMemberFn(wsIdx, m.id), photo: this.photoObj(m.id, initials(tx(m.n))), moveTo: this.moveMemberFn(wsIdx, m.id), moveOpts: all.map((ww, k) => ({ v: k, t: ww.n, sel: k === wsIdx })) }));
      return { n: w.n, sl: w.sl, pill: w.pill, tcCls: 'tc-' + w.s, lead: w.o, leadPhoto: this.photoObj('L' + wsIdx, initials(w.o)), members: list, noMembers: list.length === 0, add: this.addMemberFn(wsIdx), moveUp: this.moveTeamFn(wsIdx, -1), moveDown: this.moveTeamFn(wsIdx, 1), firstDis: pos === 0, lastDis: pos === ord.length - 1, goUpdate: this.goUpdateFn(w.n), openDetail: this.openDetailGuard(wsIdx), p: w.p, barcol: w.col };
    });
    const roleOpts = ['deputy', 'member', 'advisor'].map(v => ({ v, t: t.roles[v] }));
    const chiefPhoto = this.photoObj('chief', 'FA');
    const pmPhoto = this.photoObj('pm', 'KA', 'background:var(--acc);border-color:var(--acc);');
    const wsCards = st.page === 'dash' && st.dash !== 'all' ? all.filter(w => w.s === st.dash) : all;

    const dashChips = ['all', 'g', 'a', 'r'].map((v, i) => ({ label: t.dashChips[i], cls: st.dash === v ? 'on' : '', go: () => this.setState({ dash: v }) }));
    const sevChips = ['all', 'Critical', 'High', 'Medium'].map((v, i) => ({ label: t.sevChips[i], cls: st.sev === v ? 'on' : '', go: () => this.setState({ sev: v }) }));

    const sevMap = { Critical: 'sev-c', High: 'sev-h', Medium: 'sev-m', Low: 'sev-l' };
    const sevLbl = ar ? { Critical: 'حرج', High: 'مرتفع', Medium: 'متوسط', Low: 'منخفض' } : { Critical: 'Critical', High: 'High', Medium: 'Medium', Low: 'Low' };
    const riskCards = (st.sev === 'all' ? this.RISKS : this.RISKS.filter(r => r.sev === st.sev)).map(r => ({ ...r, t: tx(r.t), w: tx(r.w), st: tx(r.st), o: tx(r.o), imp: tx(r.imp), mit: tx(r.mit), dec: tx(r.dec), d: txd(r.d), sev: sevLbl[r.sev], sevCls: sevMap[r.sev], cardCls: r.sev === 'Critical' ? 'rcard' : '' }));

    const counts = {}; this.RISKS.forEach(r => { const k = (2 - r.I) + '-' + r.L; counts[k] = (counts[k] || 0) + 1; });
    const heat = []; for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) { const n = counts[row + '-' + col] || 0; const s = (2 - row) + col; heat.push({ n: n || '', cls: n === 0 ? 'h0' : s >= 4 ? 'h3' : s >= 3 ? 'h2' : 'h1' }); }

    const milestones = this.MILESTONES.map(m => ({ ...m, t: tx(m.t), w: tx(m.w), st: tx(m.st), d: txd(m.d), dotCls: 'st-' + m.k, tagCls: 't-' + m.k }));
    const decisions = this.DECISIONS.map(d => ({ ...d, t: tx(d.t), o: tx(d.o), st: tx(d.st), bg: tx(d.bg), rec: tx(d.rec), impd: tx(d.impd), dl: txd(d.dl), opts: d.opts.map(op => ({ ...op, b: ar ? { A: 'أ', B: 'ب' }[op.b] : op.b, t: tx(op.t) })) }));
    const attention = this.ATTENTION.map((a, i) => ({ ...a, t: tx(a.t), w: tx(a.w), d: txd(a.d), cls: i === 4 ? 'last' : '' }));

    const owners = [...new Set(this.WS.map(w => tx(w.o)))].sort();
    let repRows = all;
    if (st.repW !== 'all') repRows = repRows.filter(w => tx(w.n) === st.repW || w.n === st.repW);
    if (st.repS !== 'all') repRows = repRows.filter(w => w.s === st.repS);
    if (st.repO !== 'all') repRows = repRows.filter(w => w.o === st.repO);
    if (st.repR === 'hi') repRows = repRows.filter(w => w.s !== 'g');
    repRows = repRows.map(w => ({ ...w, risk: t.riskLvl[w.s] }));

    const isWef = st.event === 'wef';
    const blankEvent = !!st.event && st.event !== 'wef';
    const hasRich = isWef || st.event === 'agm';
    let ovw = null;
    if (st.event === 'agm' && depts.length) {
      const g = depts.filter(d => d.s === 'g').length, a = depts.filter(d => d.s === 'a').length, r = depts.filter(d => d.s === 'r').length;
      const readiness = Math.round(depts.reduce((s, d) => s + (d.p || 0), 0) / depts.length);
      const openActions = depts.reduce((s, d) => s + (d.openCount || 0), 0);
      const attention = depts.filter(d => d.s !== 'g').map(d => ({ id: d.id, n: d.n, sl: d.sl, pill: d.pill, tcCls: d.tcCls, owner: d.apprOwner, item: d.apprItem, due: d.apprDue, open: d.open }));
      ovw = {
        readiness, g, a, r, total: depts.length, openActions,
        segG: g || 0.0001, segA: a || 0.0001, segR: r || 0.0001,
        kpis: [
          { lab: EX.ovTeams, val: String(depts.length), sub: EX.ovTeamsSub, col: '' },
          { lab: t.statuses.g, val: String(g), sub: EX.ovOnTrackSub, col: 'var(--g)' },
          { lab: t.statuses.a, val: String(a), sub: EX.ovAttnSub, col: 'var(--a)' },
          { lab: t.statuses.r, val: String(r), sub: EX.ovRiskSub, col: 'var(--r)' },
          { lab: EX.ovOpenActions, val: String(openActions), sub: EX.ovOpenActionsSub, col: '' },
          { lab: t.detApprovals, val: String(depts.length), sub: EX.ovApprSub, col: '' }
        ],
        attention
      };
    }
    const evObj = st.event ? this.getEvent(st.event) : null;
    const eventName = evObj ? (ar ? evObj.ar : evObj.en) : '';
    let pdfReady = null;
    if (st.pdfKey) {
      const dd = ALL_DEPTS.find(x => x.id === st.pdfKey);
      if (dd) {
        const dx = depEnrich(dd);
        const meta = META[dd.id] || { actions: [] };
        const mem = (deptMembersS[dd.id] || []).filter(m => m.n !== 'Team Member').map(m => ({ n: tx(m.n), role: tx(m.r) }));
        const wf = [{ n: dx.leadN, role: dx.leadT || t.teamLead }, { n: dx.depN, role: dx.depT || t.deputy }, ...mem];
        const pdfActions = teamActionsOf(dd.id).map(a => ({ t: tx(a.t), o: a.o, sk: tsk(a.s), sl: tsLbl[tsk(a.s)], apL: apLbl[a.ap || 'nr'], apK: a.ap || 'nr', d: txd(a.d), nx: tx(a.nx), ch: tx(a.ch) || '—' }));
        const base = (typeof location !== 'undefined') ? location.href.split('#')[0] : '';
        const link = base + '#event=' + st.event + '&section=operational-tracker&team=' + dd.id;
        const now = new Date();
        let genAt; try { genAt = now.toLocaleString(ar ? 'ar' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { genAt = now.toISOString().slice(0, 16).replace('T', ' '); }
        const evPeriod = evObj ? (Array.isArray(evObj.period) ? evObj.period[ar ? 1 : 0] : evObj.period) : '';
        const evInit = evObj ? (evObj.en || '?').trim().charAt(0).toUpperCase() : '';
        const evLogo = evObj ? evObj.logo : '';
        const L = ar
          ? { secv: 'المتتبع التشغيلي', generated: 'تم الإنشاء', leadership: 'قيادة الفريق', workforce: 'فريق العمل', updates: 'التحديثات', challenges: 'التحديات', approvals: 'الموافقات المعلقة', next: 'الخطوات التالية', progress: 'النسبة وتاريخ الاستحقاق', opTracker: 'المتتبع التشغيلي', action: 'الإجراء / المهمة', owner: 'المالك', status: 'الحالة', pr: 'الأولوية', due: 'تاريخ الاستحقاق', dependency: 'التبعية', nextAction: 'الإجراء التالي', approval: 'الاعتماد', nextSteps: 'الخطوات التالية', teamLead: 'قائد الفريق', deputy: 'النائب', team: 'الفريق', prog: 'النسبة', upd: 'آخر تحديث', delayFlag: 'متأخر عن الجدول', delayL: 'التأخير', openTracker: 'فتح صفحة المتتبع', waBody: 'تم إنشاء ملف PDF لصفحة الفريق للمراجعة.' }
          : { secv: 'Operational Tracker', generated: 'Generated', leadership: 'Team Leadership', workforce: 'Workforce', updates: 'Updates', challenges: 'Challenges', approvals: 'Pending Approvals', next: 'Next Steps', progress: 'Progress & Due Date', opTracker: 'Operational Tracker', action: 'Action / Task', owner: 'Owner', status: 'Status', pr: 'Priority', due: 'Due', dependency: 'Dependency', nextAction: 'Next Action', approval: 'Approval', nextSteps: 'Next Steps', teamLead: 'Team Lead', deputy: 'Deputy', team: 'Team', prog: 'Progress', upd: 'Last Updated', delayFlag: 'Behind schedule', delayL: 'Delay', openTracker: 'Open Tracker Page', waBody: 'The team page PDF has been generated for review.' };
        const cleanName = (evObj ? (evObj.en || 'Event') : 'Event').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const cleanTeam = (String(dd.n[0] || 'Team')).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const fname = cleanName + '_' + cleanTeam + '_Team_Page.pdf';
        const data = { ar, L, n: dx.n, s: dx.s, sl: dx.sl, p: dx.p, u: dx.u, due: dx.due, delay: dx.delay,
          leadN: dx.leadN, leadT: dx.leadT, leadInit: initials(dx.leadN), depN: dx.depN, depT: dx.depT, depInit: dx.depInit,
          wf, actions: pdfActions, upd: dx.upd, chal: dx.chal,
          apprItem: dx.apprItem, apprDec: dx.apprDec, apprOwner: dx.apprOwner, apprDue: dx.apprDue,
          nextAction: dx.nextAction, nextWho: dx.nextWho, nextDue: dx.nextDue,
          eventName, period: evPeriod, evInit, logo: evLogo, genAt, link, fname };
        const html = this.teamPdfHtml(data);
        const waMsg = eventName + '\n' + L.team + ': ' + dx.n + '\n\n' + L.waBody + '\n\n' + L.openTracker + ':\n' + link;
        pdfReady = { fname,
          download: this.downloadTeamPdf({ ar, html, fname }),
          share: this.shareTeamPdfNative({ ar, shareTitle: eventName + ' — ' + dx.n, shareText: L.waBody, link }),
          wa: 'https://wa.me/?text=' + encodeURIComponent(waMsg) };
      }
    }
    const eventPeriod = evObj ? (Array.isArray(evObj.period) ? evObj.period[ar ? 1 : 0] : evObj.period) : '';
    const eventLogo = evObj ? evObj.logo : '';
    const eventInit = evObj ? (evObj.en || '?').trim().charAt(0).toUpperCase() : '';
    const statusMeta = { active: { l: ar ? 'متتبع نشط' : 'Active Tracker', cls: 'pg-g' }, blank: { l: ar ? 'متتبع فارغ' : 'Blank Tracker', cls: 'pg-neutral' } };
    const _evSorted = this.allEvents().map(ev => ({ ev, start: this.parseEventStart(ev.period) })).sort((a, b) => { if (a.start && b.start) return (a.start.y - b.start.y) || (a.start.m - b.start.m) || (a.start.d - b.start.d); if (a.start) return -1; if (b.start) return 1; return 0; }).map(x => x.ev);
    const eventCards = _evSorted.map(ev => ({ id: ev.id, logoEl: ev.logo ? React.createElement('img', { key: 'l', src: this.resolveAsset(ev.logo), alt: '' }) : React.createElement('span', { className: 'evlogo-ph' }, (ev.en || '?').trim().charAt(0).toUpperCase()), name: ar ? ev.ar : ev.en, name2: '', date: ev.period ? (ar ? ev.period[1] : ev.period[0]) : '', statusL: statusMeta[ev.status].l, pillCls: statusMeta[ev.status].cls, open: this.openEvent(ev.id), isAdmin: !!st.admin, editEv: this.openEditEvent(ev.id), delEv: this.askDelEvent(ev.id) }));
    const editingEvent = (() => { if (!st.editEventId) return null; const ev = this.allEvents().find(x => x.id === st.editEventId); if (!ev) return null; return { en: ev.en, ar: ev.ar, period: ev.period ? ev.period[0] : '', owner: ev.owner || '' }; })();
    const confirmDelEventName = (() => { if (!st.confirmDelEvent) return null; const ev = this.allEvents().find(x => x.id === st.confirmDelEvent); return ev ? (ar ? ev.ar : ev.en) : null; })();
    const mkLogo = (url, init, key) => url ? React.createElement('img', { key, src: this.resolveAsset(url), alt: '' }) : init;
    const densityActive = st.density ? st.density : ((this.props.compact ?? false) ? 'compact' : 'comfortable');
    let customTeams = [];
    if (blankEvent) {
      customTeams = this.getEventTeams(st.event).map(tm => {
        const s = tm.s || 'a'; const stt = STATUS[s] || STATUS.a; const pk = (v) => Array.isArray(v) ? (v[ar ? 1 : 0] || v[0]) : v;
        const ln = pk(tm.leadN) || '\u2014', dn = pk(tm.depN) || '\u2014';
        return { id: tm.id, n: pk(tm.n), leadN: ln, depN: dn, leadInit: initials(ln), depInit: initials(dn), s, sl: t.statuses[s], pill: stt.pill, tcCls: 'tc-' + s, col: stt.col, p: tm.p || 0, u: txd(pk(tm.u) || '\u2014'), remove: this.removeTeamFn(st.event, tm.id) };
      });
    }

    // ===== APPROVALS DATA =====
    const apprStore = this.apprStoreFor(st.event);
    const apprPrMap = { r: 'h', a: 'm', g: 'l' };
    const apprStatusMeta = {
      pending: { l: ar ? 'قيد الاعتماد' : 'Pending Approval', pill: 'pg-a' },
      approved: { l: ar ? 'معتمد' : 'Approved', pill: 'pg-g' },
      rejected: { l: ar ? 'مرفوض' : 'Rejected', pill: 'pg-r' }
    };
    const fmtTs = (ts) => { if (!ts) return ''; try { return new Date(ts).toLocaleDateString(ar ? 'ar' : 'en-GB', { day: '2-digit', month: 'short' }); } catch (e) { return ''; } };
    const fmtTsFull = (ts) => { if (!ts) return ''; try { return new Date(ts).toLocaleString(ar ? 'ar' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
    const autoAppr = ACTIVE_DEPTS.map(d => {
      const dx = depEnrich(d); const id = 'auto:' + d.id; const ov = apprStore.overrides[id] || {};
      return { id, source: 'auto', teamId: d.id, team: dx.n, title: dx.apprItem, desc: dx.apprDec, requestedBy: dx.apprOwner,
        priority: ov.priority || apprPrMap[d.s] || 'm', due: dx.apprDue, status: ov.status || 'pending',
        decidedAt: ov.decidedAt || null, reason: ov.reason || '', comments: ov.comments || [], updated: dx.u, attach: ov.attach || null, infoReq: ov.infoReq || null };
    });
    const manualAppr = (apprStore.manual || []).map(m => ({ id: m.id, source: 'manual', teamId: null, team: m.team, title: m.title, desc: m.desc,
      requestedBy: m.requestedBy, priority: m.priority || 'm', due: m.due, status: m.status || 'pending',
      decidedAt: m.decidedAt || null, reason: m.reason || '', comments: m.comments || [], updated: fmtTs(m.createdAt), attach: m.attach || null, infoReq: m.infoReq || null }));
    const allAppr = [...manualAppr, ...autoAppr];
    const nowMs = Date.now(); const weekAgo = nowMs - 7 * 864e5;
    const apprPendingCount = allAppr.filter(a => a.status === 'pending').length;
    const apprApprovedWeek = allAppr.filter(a => a.status === 'approved' && a.decidedAt && a.decidedAt >= weekAgo).length;
    const apprRejected = allAppr.filter(a => a.status === 'rejected').length;
    const apprHigh = allAppr.filter(a => a.status === 'pending' && a.priority === 'h').length;
    const apprCards = allAppr.map(a => ({
      id: a.id, title: a.title, team: a.team, requestedBy: a.requestedBy, desc: a.desc, due: a.due,
      statusL: apprStatusMeta[a.status].l, statusPill: apprStatusMeta[a.status].pill,
      prL: this.APPR_PR[a.priority] ? this.APPR_PR[a.priority][ar ? 1 : 0] : '', prCls: 'pr-' + a.priority,
      updated: a.updated, cardCls: 'appr-card' + (a.status === 'approved' ? ' appr-approved' : a.status === 'rejected' ? ' appr-rejected' : ''),
      sourceL: a.source === 'auto' ? (ar ? 'من صفحة الفريق' : 'From team page') : (ar ? 'طلب يدوي' : 'Manual request'),
      open: this.openAppr(a.id),
      hasAttach: !!(a.attach && a.attach.data), attachName: a.attach ? a.attach.name : '', attachUrl: a.attach ? a.attach.data : '',
      hasInfoReq: !!(a.infoReq && a.infoReq.note) && a.status === 'pending', infoNote: a.infoReq ? a.infoReq.note : '',
      cardReason: a.reason || '', hasCardReason: a.status === 'rejected' && !!a.reason,
      canAct: canExec && a.status === 'pending',
      noMode: !(st.apprCardAct && st.apprCardAct.id === a.id),
      isRejectMode: !!(st.apprCardAct && st.apprCardAct.id === a.id && st.apprCardAct.mode === 'reject'),
      isInfoMode: !!(st.apprCardAct && st.apprCardAct.id === a.id && st.apprCardAct.mode === 'info'),
      approve: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.approveAppr(a.id)(); },
      startReject: this.startCardAct(a.id, 'reject'), startInfo: this.startCardAct(a.id, 'info'),
      confirmReject: this.confirmCardReject(a.id), confirmInfo: this.confirmCardInfo(a.id)
    }));
    const hasAppr = apprCards.length > 0;
    let apprModal = null;
    if (st.apprKey) {
      const a = allAppr.find(x => x.id === st.apprKey);
      if (a) apprModal = {
        id: a.id, title: a.title, team: a.team, event: eventName, requestedBy: a.requestedBy,
        requestDate: a.source === 'manual' ? a.updated : (ar ? 'من المتتبع التشغيلي' : 'From Operational Tracker'), due: a.due, desc: a.desc,
        statusL: apprStatusMeta[a.status].l, statusPill: apprStatusMeta[a.status].pill,
        prL: this.APPR_PR[a.priority][ar ? 1 : 0], prCls: 'pr-' + a.priority,
        isPending: a.status === 'pending', isApproved: a.status === 'approved', isRejected: a.status === 'rejected',
        reason: a.reason, hasReason: !!a.reason, decidedAt: fmtTsFull(a.decidedAt), hasDecided: !!a.decidedAt,
        hasAttach: !!(a.attach && a.attach.data), noAttach: !(a.attach && a.attach.data), attachName: a.attach ? a.attach.name : '', attachUrl: a.attach ? a.attach.data : '',
        showActions: a.status === 'pending' && st.apprAction !== 'reject' && st.apprAction !== 'comment',
        showDecided: a.status !== 'pending' && st.apprAction !== 'reject' && st.apprAction !== 'comment',
        decidedBadge: a.status === 'approved' ? ((ar ? 'تم الاعتماد' : 'Approved') + (a.decidedAt ? ' · ' + fmtTsFull(a.decidedAt) : '')) : (a.status === 'rejected' ? ((ar ? 'تم الرفض' : 'Rejected') + (a.decidedAt ? ' · ' + fmtTsFull(a.decidedAt) : '')) : ''),
        comments: (a.comments || []).map(c => ({ by: c.by, text: c.text, at: fmtTsFull(c.at) })), hasComments: (a.comments || []).length > 0,
        approve: this.approveAppr(a.id), startReject: this.startApprAction('reject'), startComment: this.startApprAction('comment'),
        confirmReject: this.confirmReject(a.id), confirmComment: this.confirmComment(a.id),
        isRejectMode: st.apprAction === 'reject', isCommentMode: st.apprAction === 'comment', actInput: st.apprInput || ''
      };
    }

    // ===== EVENT DESIGN DATA =====
    const designStore = this.designStoreFor(st.event);
    const designSeed = this.DESIGN_SEED[st.event] || {};
    const dStatusMeta = { done: { l: ar ? 'مكتمل' : 'Complete', pill: 'pg-g' }, review: { l: ar ? 'قيد المراجعة' : 'In Review', pill: 'pg-a' }, inprogress: { l: ar ? 'قيد الإعداد' : 'In Progress', pill: 'pg-purple' }, empty: { l: ar ? 'لم يبدأ' : 'Not Started', pill: 'pg-neutral' } };
    const fStatusMeta = { approved: { l: ar ? 'معتمد' : 'Approved', pill: 'pg-g' }, review: { l: ar ? 'مراجعة' : 'Review', pill: 'pg-a' }, draft: { l: ar ? 'مسودة' : 'Draft', pill: 'pg-neutral' }, uploaded: { l: ar ? 'مرفوع' : 'Uploaded', pill: 'pg-purple' } };
    const designSections = this.DESIGN_SECTIONS.map(sec => {
      const base = designSeed[sec.key] || {}; const saved = designStore[sec.key] || {};
      const files = saved.files || base.files || [];
      let status = saved.status || base.status || 'empty'; if (files.length === 0 && !(saved.status || base.status)) status = 'empty';
      const owner = saved.owner || base.owner || ['—', '—'];
      const updated = saved.updated || base.updated || '—';
      const sm = dStatusMeta[status] || dStatusMeta.empty;
      const gallery = files.map((f, fi) => ({ name: tx(f.name), type: f.type, date: txd(f.date), by: tx(f.by), statusL: (fStatusMeta[f.status] || fStatusMeta.draft).l, statusPill: (fStatusMeta[f.status] || fStatusMeta.draft).pill, ext: f.type, remove: this.deleteDesignFile(sec.key, fi), download: this.downloadDesignFile(f), view: this.viewDesignFile(f) }));
      return { key: sec.key, title: ar ? sec.ar : sec.en, icon: this.designIcon(sec.icon), status, statusL: sm.l, statusPill: sm.pill,
        owner: tx(owner), updated: txd(updated), count: files.length, countL: files.length + ' ' + (ar ? 'ملف' : (files.length === 1 ? 'file' : 'files')), hasFiles: files.length > 0, noFiles: files.length === 0,
        gallery, previewFiles: gallery.slice(0, 3), pct: this.DESIGN_PCT[status] || 0,
        open: this.openDesignSec(sec.key), upload: this.uploadDesign(sec.key), showStatus: status !== 'inprogress' };
    });
    const _designTeams = (st.event === 'agm') ? ['agm-2'] : ['d2', 'd3'];
    const canUploadDesign = role === 'admin' || (role === 'inputter' && _designTeams.indexOf(_myStream0) !== -1) || (role === 'lead' && this._leadStreams().some(x => _designTeams.indexOf(x) !== -1));
    const designOwner = tx(designSeed.owner || ['—', '—']);
    const designReadiness = designSections.length ? Math.round(designSections.reduce((s, x) => s + x.pct, 0) / designSections.length) : 0;
    const designAssets = designSections.reduce((s, x) => s + x.count, 0);
    const designPendingAppr = designSections.filter(x => x.status === 'review').length;
    const designUpdated = designSections.map(x => x.updated).filter(u => u && u !== '—').sort().slice(-1)[0] || '—';
    let designModal = null;
    if (st.designKey) { const s = designSections.find(x => x.key === st.designKey); if (s) designModal = { ...s }; }

    // ===== CALENDAR DATA (landing) =====
    const calStatusMeta = { active: { l: ar ? 'متتبع نشط' : 'Active Tracker', pill: 'pg-g', dot: 'var(--g)' }, blank: { l: ar ? 'متتبع فارغ' : 'Blank Tracker', pill: 'pg-neutral', dot: 'var(--acc)' } };
    const calEvents = this.allEvents().map(ev => {
      const start = this.parseEventStart(ev.period); const sm = calStatusMeta[ev.status] || calStatusMeta.blank;
      return { id: ev.id, name: ar ? ev.ar : ev.en, period: ev.period ? (ar ? ev.period[1] : ev.period[0]) : (ar ? 'يُحدد لاحقاً' : 'To be confirmed'),
        start, status: ev.status, statusL: sm.l, statusPill: sm.pill, dot: sm.dot, logo: ev.logo,
        logoEl: ev.logo ? React.createElement('img', { key: ev.id, src: this.resolveAsset(ev.logo), alt: '' }) : React.createElement('span', { className: 'evlogo-ph' }, (ev.en || '?').trim().charAt(0).toUpperCase()),
        open: this.openEvent(ev.id) };
    });
    const calMonth = st.calMonth == null ? 9 : st.calMonth; const calYear = st.calYear == null ? 2026 : st.calYear;
    const MN_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const MN_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const calMonthLabel = (ar ? MN_AR[calMonth] : MN_EN[calMonth]) + ' ' + calYear;
    const firstDow = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const calCells = [];
    for (let i = 0; i < firstDow; i++) calCells.push({ blank: true, key: 'b' + i, cellCls: 'calcell calcell-blank', day: '', dot: 'transparent', evName: '', open: () => {} });
    for (let day = 1; day <= daysInMonth; day++) {
      const evs = calEvents.filter(e => e.start && e.start.y === calYear && e.start.m === calMonth && e.start.d === day);
      calCells.push({ blank: false, key: 'd' + day, day: String(day), hasEv: evs.length > 0, dot: evs[0] ? evs[0].dot : 'transparent', evName: evs[0] ? evs[0].name : '', open: evs[0] ? evs[0].open : (() => {}), cellCls: 'calcell' + (evs.length ? ' calcell-ev' : '') });
    }
    const calDows = (ar ? ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((d, i) => ({ d, key: 'w' + i }));
    const upcomingEvents = calEvents.filter(e => e.start).sort((a, b) => (a.start.y - b.start.y) || (a.start.m - b.start.m) || (a.start.d - b.start.d)).concat(calEvents.filter(e => !e.start));

    return {
      dir: ar ? 'rtl' : 'ltr', dirCls: ar ? 'rtl' : '',
      enCls: ar ? '' : 'on', arCls: ar ? 'on' : '',
      setEn: () => { this.persist('wef_lang', 'en'); this.setState({ lang: 'en' }); }, setAr: () => { this.persist('wef_lang', 'ar'); this.setState({ lang: 'ar' }); },
      t: { ...t, brAsOf: t.brAsOf(cdDays), ...EX },
      isLanding: st.event == null, inTracker: st.event != null,
      isWef, blankEvent, hasRich, genOverview: st.event === 'agm' && !!ovw, ovw, hasTeams: hasRich, emptyTracker: blankEvent && !hasRich, hasTimeline: hasRich, emptyTimeline: blankEvent && !hasRich,
      eventName, eventPeriod, eventLogo, eventInit, eventHasLogo: !!eventLogo, eventNoLogo: !eventLogo, railLogoEl: mkLogo(eventLogo, eventInit, 'rl'), topLogoEl: mkLogo(eventLogo, eventInit, 'tl'),
      eventCards, backToEvents: this.backToEvents,
      customTeams, hasCustomTeams: blankEvent && !hasRich && customTeams.length > 0, showZero: blankEvent && !hasRich && customTeams.length === 0, blankAdmin: blankEvent && !hasRich && st.admin,
      showAddTeam: st.showAddTeam, openAddTeam: this.openAddTeam, closeAddTeam: this.closeAddTeam, createTeam: this.createTeam, importTeams: this.importTeams,
      streamlineOpts: (st.event === 'agm' ? this.AGM_DEPTS : this.DEPTS).map(d => ({ t: tx(d.n) })), statusFormOpts: ['g', 'a', 'r'].map(v => ({ v, t: t.statuses[v] })),
      showAddEvent: st.showAddEvent, openAddEvent: this.openAddEvent, closeAddEvent: this.closeAddEvent, createEvent: this.createEvent, pickNewLogo: this.pickNewLogo, newLogoName: st.newLogoName,
      editingEvent, closeEditEvent: this.closeEditEvent, saveEventEdit: this.saveEventEdit, pickEditLogo: this.pickEditLogo, editLogoName: st.editLogoName,
      confirmDelEventName, cancelDelEvent: this.cancelDelEvent, doDelEvent: this.doDelEvent,
      pickApprFile: this.pickApprFile, apprFileName: st.apprFileName,
      cancelCardAct: this.cancelCardAct, setCardInput: this.setCardInput, apprCardInput: st.apprCardInput || '',
      apprInfoBtnL: ar ? 'طلب معلومات' : 'Request Info', apprInfoPh: ar ? 'ما المعلومات المطلوبة؟' : 'What information is needed?', apprInfoSendL: ar ? 'إرسال الطلب' : 'Send Request', apprInfoReqL: ar ? 'معلومات مطلوبة' : 'Info requested',
      evEditT: ar ? 'تعديل الفعالية' : 'Edit Event', evDelT: ar ? 'حذف الفعالية' : 'Delete Event', evDelMsg: ar ? 'سيتم حذف هذه الفعالية ومتتبعها نهائياً. هل أنت متأكد؟' : 'This event and its tracker will be permanently removed. Are you sure?', evDelBtn: ar ? 'حذف' : 'Delete',
      densityComfort: densityActive === 'comfortable', densityCompact: densityActive === 'compact', toggleDensity: this.toggleDensity, densComfortCls: densityActive === 'comfortable' ? 'on' : '', densCompactCls: densityActive === 'compact' ? 'on' : '',
      accCls: { 'Federal Blue': '', 'Teal': 'acc-teal', 'Royal': 'acc-royal' }[this.props.accent] || '',
      densityCls: densityActive === 'compact' ? 'compact' : '',
      cdDays, cdHrs: String(cdHrs).padStart(2, '0'), cdMin: String(cdMin).padStart(2, '0'), cdSec: String(cdSec).padStart(2, '0'),
      navOverview: { label: ar ? 'النظرة التنفيذية' : 'Executive Overview', cls: st.page === 'overview' ? 'on' : '', go: this.go('overview') },
      navDash: { label: ar ? 'المتتبع التشغيلي' : 'Operational Tracker', cls: pageEff === 'dash' ? 'on' : '', go: this.go('dash') },
      navApprovals: { label: ar ? 'الاعتمادات' : 'Approvals', cls: st.page === 'approvals' ? 'on' : '', go: this.go('approvals'), badge: apprPendingCount > 0 ? String(apprPendingCount) : '' },
      navDesign: { label: ar ? 'تصميم الفعالية' : 'Event Design', cls: st.page === 'design' ? 'on' : '', go: this.go('design') },
      navOrg: { label: ar ? 'فريق العمل' : 'Workforce', cls: st.page === 'org' ? 'on' : '', go: this.go('org') },
      navTimeline: { label: ar ? 'الجدول الزمني' : 'Timeline', cls: st.page === 'timeline' ? 'on' : '', go: this.go('timeline') },
      navFeedback: (() => { const _s = evObj ? this.parseEventStart(evObj.period) : null;
        const _done = _s ? (Date.now() > new Date(_s.y, _s.m, _s.d + 1).getTime()) : false;
        this._fbUnlocked = _done || !!((st.fbOpen || {})[st.event]);
        return { label: ar ? 'التقييم والملاحظات' : 'Feedback', cls: st.page === 'feedback' ? 'on' : '', go: this.go('feedback'), locked: !this._fbUnlocked }; })(),
      isFeedback: st.page === 'feedback',
      isHotel: pageEff === 'hotel',
      navHotelShow: role === 'hotel' || !!st.admin,
      navHotel: { label: ar ? 'الإقامة الفندقية' : 'Accommodation', cls: pageEff === 'hotel' ? 'on' : '', go: this.go('hotel') },
      ...(() => { const ha = st.hotelAssign || {}; const rows = [];
        ACTIVE_DEPTS.forEach(d => (deptMembersS[d.id] || []).forEach(m => { if (!m.acc) return; const asg = ha[m.id] || {};
          rows.push({ n: tx(m.n), team: tx(d.n), em: m.em || '', ph: m.ph || '', contactLine: [m.em, m.ph].filter(Boolean).join('\n') || '—',
            pref: m.accP || '', gender: asg.gender || m.gd || '', hotel: asg.hotel || '', conf: asg.conf || '', cin: asg.cin || '', cout: asg.cout || '',
            setConf: this.setHotelField(m.id, 'conf'), setCin: this.setHotelField(m.id, 'cin'), setCout: this.setHotelField(m.id, 'cout'),
            ...(() => { const mateV = (asg.mate != null && asg.mate !== '') ? asg.mate : (asg.mateRejected ? '' : (m.accP || ''));
              return { mate: mateV, hasMate: mateV !== '', showMateActions: mateV !== '' && !asg.mateApproved, mateApproved: mateV !== '' && !!asg.mateApproved,
                approveMate: () => { const ha = { ...(this.state.hotelAssign || {}) }; ha[m.id] = { ...(ha[m.id] || {}), mate: mateV, mateApproved: true }; this.persist('wef_hotel', ha); this.setState({ hotelAssign: ha }); },
                ...(() => { const ready = !!asg.hotel;
                  const fmtDT = v => { if (!v) return ''; const dte = new Date(v); return dte.toLocaleString(ar ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
                  const msg = (ar
                    ? 'عزيزي/عزيزتي ' + tx(m.n) + '،\n\nنؤكد حجز إقامتك لفعالية WEF:\n\nالفندق: ' + (asg.hotel || '—') + (asg.conf ? '\nرقم التأكيد: ' + asg.conf : '') + (asg.cin ? '\nتسجيل الدخول: ' + fmtDT(asg.cin) : '') + (asg.cout ? '\nتسجيل الخروج: ' + fmtDT(asg.cout) : '') + (mateV ? '\nشريك السكن: ' + mateV : '') + '\n\nمع تحيات فريق التنظيم — وزارة شؤون مجلس الوزراء'
                    : 'Dear ' + tx(m.n) + ',\n\nYour accommodation booking for the WEF event has been confirmed:\n\nHotel: ' + (asg.hotel || '—') + (asg.conf ? '\nConfirmation No.: ' + asg.conf : '') + (asg.cin ? '\nCheck-in: ' + fmtDT(asg.cin) : '') + (asg.cout ? '\nCheck-out: ' + fmtDT(asg.cout) : '') + (mateV ? '\nRoommate: ' + mateV : '') + '\n\nBest regards,\nEvent Organising Team — Ministry of Cabinet Affairs');
                  const fmtAt = ts => ts ? new Date(ts).toLocaleString(ar ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
                  return { canNotify: ready, notNotify: !ready,
                    sentWa: !!asg.sentWa, sentWaAt: (ar ? 'أُرسل ' : 'Sent ') + fmtAt(asg.sentWa),
                    sentEm: !!asg.sentEm, sentEmAt: (ar ? 'أُرسل ' : 'Sent ') + fmtAt(asg.sentEm),
                    previewWa: () => this.setState({ msgPrev: { mid: m.id, kind: 'wa', toN: tx(m.n), toC: m.ph || '—', msg } }),
                    previewEm: () => this.setState({ msgPrev: { mid: m.id, kind: 'em', toN: tx(m.n), toC: m.em || '—', msg } }) }; })() }; })(),
            mateTitle: m.accP ? ((ar ? 'المفضل: ' : 'Preferred: ') + m.accP) : '',
            rejectMate: () => { const ha = { ...(this.state.hotelAssign || {}) }; ha[m.id] = { ...(ha[m.id] || {}), mate: '', mateRejected: true }; this.persist('wef_hotel', ha); this.setState({ hotelAssign: ha }); },
            setGender: this.setHotelField(m.id, 'gender'), setHotel: this.setHotelField(m.id, 'hotel'), setRoom: this.setHotelField(m.id, 'room'), setMate: this.setHotelField(m.id, 'mate') }); }));
        this._htRows = rows;
        return { htRows: rows, htHas: rows.length > 0, htEmpty: rows.length === 0, htExport: this.htExport }; })(),
      ...(() => { const nom = st.wfNom || {}; const out = [];
        ACTIVE_DEPTS.forEach(d => (nom[d.id] || []).forEach(x => { const typeL = x.type === 'edit' ? (x.kind === 'lead' ? (ar ? 'تعديل قائد الفريق' : 'Lead edit') : x.kind === 'dep' ? (ar ? 'تعديل نائب القائد' : 'Deputy edit') : (ar ? 'تعديل عضو' : 'Member edit')) : (ar ? 'عضو جديد' : 'New member');
          out.push({ n: x.n, role: (tx(x.r) || '—') + ' · ' + typeL, init: initials(x.n), teamN: tx(d.n), isAdmin: !!st.admin, approve: this.approveWfNom(d.id, x.id), reject: this.rejectWfNom(d.id, x.id) }); }));
        return { execNoms: out, hasExecNoms: out.length > 0, execNomCountL: out.length + (ar ? ' قيد الاعتماد' : ' pending') }; })(),
      ...(() => { const items = [];
        if (st.admin || role === 'he') { allAppr.filter(a => a.status === 'pending').forEach(a => items.push({ title: (ar ? 'اعتماد مطلوب: ' : 'Approval needed: ') + (a.title || ''), sub: a.team || '', go: () => this.setState({ page: 'approvals', notifOpen: false }) })); }
        if (st.admin) { ACTIVE_DEPTS.forEach(d => ((st.wfNom || {})[d.id] || []).forEach(x => items.push({ title: (ar ? 'تعديل فريق عمل: ' : 'Workforce change: ') + x.n, sub: tx(d.n), go: () => this.setState({ page: 'overview', notifOpen: false }) }))); }
        if (!st.admin && role === 'inputter') { [(st.myStreams || {})[st.event]].filter(Boolean).forEach(id => { const d = ACTIVE_DEPTS.find(x => x.id === id); if (!d) return; ((st.wfNom || {})[id] || []).forEach(x => items.push({ title: (ar ? 'بانتظار اعتماد الإدارة: ' : 'Awaiting admin approval: ') + x.n, sub: tx(d.n), go: () => this.setState({ notifOpen: false }) })); }); }
        return { notifItems: items, notifCount: items.length > 9 ? '9+' : String(items.length), notifHas: items.length > 0, notifEmpty: items.length === 0,
          notifOpen: !!st.notifOpen, notifToggle: () => this.setState(s => ({ notifOpen: !s.notifOpen })) }; })(),
      trkTable: (st.trkView || 'table') === 'table', trkCards: st.trkView === 'cards',
      trkTableCls: (st.trkView || 'table') === 'table' ? 'on' : '', trkCardsCls: st.trkView === 'cards' ? 'on' : '',
      trkSetTable: () => this.setState({ trkView: 'table' }), trkSetCards: () => this.setState({ trkView: 'cards' }),
      fbLocked: !this._fbUnlocked, fbUnlocked: !!this._fbUnlocked, fbOpenNow: this.fbOpenNow, fbSubmit: this.fbSubmit,
      fbTeamOpts: ACTIVE_DEPTS.map(d => ({ t: tx(d.n) })),
      fbItems: ((st.feedback || {})[st.event] || []).map(f => ({ team: f.team, text: f.text, by: f.by, dateL: new Date(f.ts).toLocaleDateString(ar ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) })),
      fbHas: (((st.feedback || {})[st.event]) || []).length > 0, fbEmpty: (((st.feedback || {})[st.event]) || []).length === 0, fbExport: this.fbExport,
      navSubmit: { label: ar ? 'رفع التحديثات' : 'Submit Update', cls: st.page === 'submit' ? 'on' : '', go: this.go('submit') },
      navMgmt: { label: ar ? 'إدارة الصلاحيات' : 'Management Access', cls: pageEff === 'mgmt' ? 'on' : '', go: this.go('mgmt') },
      navSettings: { label: ar ? 'الإعدادات' : 'Settings', cls: st.page === 'settings' ? 'on' : '', go: this.go('settings') },
      railClass: st.railOpen ? 'railopen' : '', toggleRail: () => this.setState({ railOpen: !st.railOpen }),
      adminBtnCls: st.admin ? 'ghost' : '', resetData: this.resetData,
      kpis3: [
        { lab: t.kpis[2][0], num: t.kpis[2][1], sub: t.kpis[2][2], c: 'var(--acc)', icbg: 'rgba(27,102,201,.1)', ic: '↻' },
        { lab: t.kpis[3][0], num: t.kpis[3][1], sub: t.kpis[3][2], c: 'var(--a)', icbg: 'rgba(176,124,31,.13)', ic: '!' },
        { lab: t.kpis[4][0], num: t.kpis[4][1], sub: t.kpis[4][2], c: 'var(--r)', icbg: 'rgba(176,58,50,.1)', ic: '▲' }
      ],
      isOverview: pageEff === 'overview', isDash: pageEff === 'dash', isTeams: pageEff === 'teams', isOrg: pageEff === 'org', isTimeline: pageEff === 'timeline', isRisks: pageEff === 'risks', isDecisions: pageEff === 'decisions', isSubmit: pageEff === 'submit', isReports: pageEff === 'reports', isBrief: pageEff === 'brief', isSettings: pageEff === 'settings', isMgmt: pageEff === 'mgmt',
      admin: st.admin, notAdmin: !st.admin, adminLive: st.admin ? 'live' : '', adminIconCls: st.admin ? 'adot2' : '', adminBtnLabel: st.admin ? t.signOut : t.adminBtn, adminClick: this.adminClick,
      role, isHE: role === 'he', isInputter: role === 'inputter', canExec,
      roleTabs: [
        { l: ar ? 'المشرف' : 'Admin', cls: role === 'admin' ? 'on' : '', go: this.setRole('admin') },
        { l: ar ? 'فريق الإدخال' : 'Team', cls: role === 'inputter' ? 'on' : '', go: this.setRole('inputter') },
        { l: ar ? 'قائد مسارات' : 'Stream Lead', cls: role === 'lead' ? 'on' : '', go: this.setRole('lead') },
        { l: ar ? 'الفنادق' : 'Hotel', cls: role === 'hotel' ? 'on' : '', go: this.setRole('hotel') },
        { l: ar ? 'معاليها' : 'H.E.', cls: role === 'he' ? 'on' : '', go: this.setRole('he') }
      ],
      showStreamPick: role === 'inputter' && !!st.event,
      myStreamLabel: ar ? 'مساري' : 'My stream',
      myStreamOpts: (() => { if (role !== 'inputter' || !st.event) return []; const src = ACTIVE_DEPTS.length ? ACTIVE_DEPTS : this.getEventTeams(st.event); const cur = (st.myStreams || {})[st.event] || ''; return [{ v: '', t: ar ? '— اختر المسار —' : '— Select stream —', sel: cur === '' }, ...src.map(d => ({ v: d.id, t: tx(d.n), sel: cur === d.id }))]; })(),
      setMyStream: this.setMyStream,
      showLeadPick: role === 'lead' && !!st.event,
      leadOpts: this.STREAM_LEADS.map(l => ({ v: l.id, t: l.n, sel: l.id === (st.leadId || 'ali') })),
      setLead: this.setLead,
      showLogin: st.showLogin, loginErr: st.loginErr, closeLogin: () => this.setState({ showLogin: false, loginErr: null }), doLogin: this.doLogin, stop: e => e.stopPropagation(),
      editModal: em, editStatusOpts, closeEdit: this.closeEdit, saveEdit: this.saveEditFn, teams, roleOpts, chiefPhoto, pmPhoto, submitWs: st.submitWs,
      ...(() => {
        const users = st.users || [];
        const meEmail = (() => { try { return (sessionStorage.getItem('wef_auth_email') || '').toLowerCase(); } catch (e) { return ''; } })();
        const roleL = { admin: ar ? 'مشرف' : 'Admin', inputter: ar ? 'فريق' : 'Team', lead: ar ? 'قائد مسار' : 'Stream Lead', hotel: ar ? 'فندق' : 'Hotel', he: ar ? 'معالي' : 'H.E.' };
        const roleKeys = ['admin', 'inputter', 'lead', 'hotel', 'he'];
        const streamNames = ACTIVE_DEPTS.map(d => tx(d.n));
        const fmtLast = (ts) => ts ? new Date(ts).toLocaleString(ar ? 'ar-AE' : 'en-GB') : (ar ? 'لم يسجل الدخول بعد' : 'Never signed in');
        const mgmtRows = users.map(u => { const isMe = !!meEmail && (u.email || '').toLowerCase() === meEmail; const canStream = !isMe && (u.role === 'lead' || u.role === 'inputter'); return {
          init: initials(u.n), name: u.n, email: u.email, isMe, notMe: !isMe,
          last: fmtLast(u.last), roleL: roleL[u.role] || u.role, roleCls: 'r-' + u.role,
          roleOpts: roleKeys.map(k => ({ v: k, l: roleL[k], sel: k === u.role })),
          canStream, noStream: !canStream,
          streamOpts: [{ v: '', l: ar ? 'بدون مسار' : 'No streams assigned', sel: !u.stream }, ...streamNames.map(nm => ({ v: nm, l: nm, sel: nm === u.stream }))],
          pass: u.pass || '', genPass: this.mgmtGenPass(u.id), typePass: this.mgmtTypePass(u.id), setRole: this.mgmtSetRole(u.id), setStream: this.mgmtSetStream(u.id)
        }; });
        return { mgmtRows, mgmtCount: String(users.length), mgmtT: {
          title: ar ? 'إدارة الصلاحيات' : 'Management Access', sub: ar ? 'إدارة المستخدمين والأدوار والمسارات' : 'User, role & stream management',
          users: ar ? 'المستخدمون' : 'Users', user: ar ? 'المستخدم' : 'User', last: ar ? 'آخر تسجيل دخول' : 'Last signed in',
          role: ar ? 'الدور' : 'Role', change: ar ? 'تغيير الدور' : 'Change role', streams: ar ? 'المسارات' : 'Streams',
          pass: ar ? 'كلمة المرور' : 'Password', passPh: ar ? 'كلمة مرور جديدة' : 'New password', gen: ar ? 'توليد' : 'Generate',
          you: ar ? 'أنت' : 'You', noSelf: ar ? 'لا يمكنك تغيير دورك' : "You can't change your own role"
        } };
      })(),
      needLogin: !st.authed, doLogin: this.doLogin, doSignOut: this.doSignOut,
      loginErr: !!st.loginErr,
      loginErrMsg: ar ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password',
      loginDir: ar ? 'rtl' : 'ltr',
      loginTitle: ar ? 'مركز قيادة فعاليات وزارة شؤون مجلس الوزراء' : 'MOCA Events Command Center',
      loginTitle2: ar ? 'MOCA Events Command Center' : 'مركز قيادة فعاليات وزارة شؤون مجلس الوزراء',
      loginDesc: ar ? 'سجّل الدخول بالبريد الإلكتروني وكلمة المرور. مستويات الوصول (مشرف، فريق، قائد مسار، فندق، معالي) يحددها مسؤول النظام.' : 'Sign in with your email and password. Access levels (Admin, Team, Stream Lead, Hotel, H.E.) are assigned by your administrator.',
      loginEmailPh: ar ? 'البريد الإلكتروني' : 'Email',
      loginPassPh: ar ? 'كلمة المرور' : 'Password',
      loginBtnL: ar ? 'تسجيل الدخول' : 'Sign in',
      loginFootL: ar ? 'وزارة شؤون مجلس الوزراء · الإمارات العربية المتحدة' : 'Ministry of Cabinet Affairs · United Arab Emirates',
      loginHintL: ar ? 'حسابات تجريبية: admin@moca.gov.ae · team@ · lead@ · hotel@ · he@ (أي كلمة مرور)' : 'Demo accounts: admin@moca.gov.ae · team@ · lead@ · hotel@ · he@ (any password)',
      signOutL: ar ? 'تسجيل الخروج' : 'Sign out',
      detailModal: dm, closeDetail: this.closeDetail, openGuide: this.openGuide,
      wfEditView, closeWfEdit: this.closeWfEdit, saveWfEdit: this.saveWfEdit, deleteWfMember: this.deleteWfMember, pickWfEditPhoto: this.pickWfEditPhoto, setWfName: e => { const v = e.target.value; this.setState(s => ({ wfEdit: { ...s.wfEdit, name: v, q: v } })); }, setWfRole: this.setWfField('role'),
      guideModal: st.guideModal, closeGuide: this.closeGuide, runGuide: this.runGuide,
      guideLeadersCls: (st.guideOpts || { leaders: true }).leaders ? 'on' : '', guideMembersCls: (st.guideOpts || { members: true }).members ? 'on' : '', guideUpdatesCls: (st.guideOpts || {}).updates ? 'on' : '',
      toggleGuideLeaders: this.toggleGuideOpt('leaders'), toggleGuideMembers: this.toggleGuideOpt('members'), toggleGuideUpdates: this.toggleGuideOpt('updates'),
      teamView, noTeamView: st.teamView == null, closeTeam: this.closeTeam,
      taskFull: !!(st.teamView != null && st.taskFull), notTaskFull: !st.taskFull, closeTaskFull: this.closeTaskFull, closeLogAdd: this.closeLogAdd,
      actionModal, closeAction: this.closeAction, agendaModal, closeAgenda: this.closeAgenda, eventDays: hasRich ? eventDays : [], tlBlockModal, tlDayModal, closeTl: this.closeTl, saveTlBlock: this.saveTlBlock, saveTlDay: this.saveTlDay, tlMode: st.tlMode, tlAdmin: !!st.admin, toggleTlMode: this.toggleTlMode, tlModeLabel: st.tlMode ? (ar ? 'تم' : 'Done') : (ar ? 'تعديل الجدول' : 'Edit Timeline'),
      logAddModal, saveLogAdd: this.saveLogAdd, logHistModal, closeLogHist: this.closeLogHist,
      mtModal: (() => { const m = st.mtView; if (!m) return null; const iso = String(m.d || '').split('-'); const dEn = iso.length === 3 ? (+iso[2]) + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+iso[1] - 1] : (m.d || '');
        return { title: m.title, rec: m.rec || '—', pur: m.pur || '—', loc: m.loc || '—', timing: dEn ? dEn + ' 2026' + (m.tm ? ' · ' + m.tm : '') : (m.tm || '—'),
          addCal: this.buildCalDownload(m.title, dEn, m.tm, m.loc, (m.pur || '') + (m.rec ? '\n' + (ar ? 'المدعوون: ' : 'Recipients: ') + m.rec : '')) }; })(),
      hasMtView: !!st.mtView, closeMtView: () => this.setState({ mtView: null }),
      hasMsgPrev: !!st.msgPrev, closeMsgPrev: () => this.setState({ msgPrev: null }),
      msgPrev: (() => { const p = st.msgPrev; if (!p) return null;
        const dm = (deptMembersS ? Object.values(deptMembersS).flat() : []).find(x => x.id === p.mid) || {};
        return { kindL: p.kind === 'wa' ? (ar ? 'معاينة رسالة واتساب' : 'WhatsApp Message Preview') : (ar ? 'معاينة البريد الإلكتروني' : 'Email Preview'),
          toN: p.toN, toC: p.toC, msg: p.msg, sendL: p.kind === 'wa' ? (ar ? 'إرسال عبر واتساب' : 'Send via WhatsApp') : (ar ? 'إرسال البريد' : 'Send Email'),
          send: () => { const ha = { ...(this.state.hotelAssign || {}) }; ha[p.mid] = { ...(ha[p.mid] || {}), [p.kind === 'wa' ? 'sentWa' : 'sentEm']: Date.now() }; this.persist('wef_hotel', ha);
            if (p.kind === 'wa') { const num = String(dm.ph || p.toC || '').replace(/[^0-9]/g, ''); window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(p.msg), '_blank'); }
            else { const subj = ar ? 'تأكيد حجز الإقامة — فعالية WEF' : 'Accommodation Booking Confirmed — WEF Event'; window.open('mailto:' + (dm.em || p.toC || '') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(p.msg), '_self'); }
            this.setState({ hotelAssign: ha, msgPrev: null }); } }; })(),
      taskEditModal, closeTaskEdit: this.closeTaskEdit, saveTaskEdit: this.saveTaskEdit, askDeleteTask: this.askDeleteTask, cancelDeleteTask: this.cancelDeleteTask, confirmDeleteTask: this.confirmDeleteTask,
      pdfReady, closePdf: this.closePdf,
      toggleWfAdd: this.toggleWfAdd, toggleWfRemove: this.toggleWfRemove,
      pickEmpDir: this.pickEmpDir, clearEmpDir: this.clearEmpDir,
      empDirLoaded: (st.empDir || []).length > 0, empDirCountL: (st.empDir || []).length + (ar ? ' موظف' : ' employees'),
      setWfSearch: e => { const v = e.target.value; this.setState(s => ({ wfEdit: { ...s.wfEdit, q: v } })); },
      setWfAccYes: () => this.setState(s => ({ wfEdit: { ...s.wfEdit, acc: true } })),
      setWfAccNo: () => this.setState(s => ({ wfEdit: { ...s.wfEdit, acc: false } })),
      setWfAccP: e => { const v = e.target.value; this.setState(s => ({ wfEdit: { ...s.wfEdit, accP: v, accPq: true } })); },
      isApprovals: pageEff === 'approvals', isDesign: pageEff === 'design',
      taskReadiness, taskReadinessNote,
      opsUpdates: this.OPS_UPDATES.map(u => ({ ic: this.icon(u.ic), n: tx(u.n), items: u.items.map(x => ({ txt: tx(x) })) })),
      apprCards, hasAppr, apprTotalPending: apprPendingCount, apprApprovedWeek, apprRejected, apprHigh, noAppr: !hasAppr,
      openCreateAppr: this.openCreateAppr, closeCreateAppr: this.closeCreateAppr, showCreateAppr: st.showCreateAppr, createApproval: this.createApproval, apprPrefillTeam: st.apprPrefillTeam || '',
      apprPriorityOpts: [{ v: 'h', t: ar ? 'عالية' : 'High' }, { v: 'm', t: ar ? 'متوسطة' : 'Medium' }, { v: 'l', t: ar ? 'منخفضة' : 'Low' }],
      apprTeamOpts: ACTIVE_DEPTS.map(d => ({ t: tx(d.n) })),
      apprModal, closeAppr: this.closeAppr, setApprInput: this.setApprInput,
      designSections, designOwner, designReadiness, designAssets, designPendingAppr, designUpdated, canUploadDesign,
      designModal, closeDesignSec: this.closeDesignSec, designHasPending: designPendingAppr > 0,
      calMonthLabel, calDows, calCells, upcomingEvents, calPrev: this.calShift(-1), calNext: this.calShift(1),
      depts: hasRich ? depts : [], myDepts: hasRich ? myDepts : [], otherDepts: hasRich ? otherDepts : [], hasMyDepts: hasRich && myDepts.length > 0, noMyDepts: !(hasRich && myDepts.length > 0), deptModal, deptEditModal, closeDept: this.closeDept, closeDeptEdit: this.closeDeptEdit, saveDeptEdit: this.saveDeptEdit,
      goRisks: e => { e.preventDefault(); this.go('dash')(); },
      toast: st.toast,
      wsCards, dashChips, sevChips, riskCards, heat, milestones, decisions, attention,
      kpis: t.kpis.map(k => ({ lab: k[0], num: k[1], sub: k[2], c: k[3] || 'var(--ink)' })),
      rhy: t.rhy.map(r => ({ lab: r[0], txt: r[1] })),
      deadlines: t.deadlines.map(d => ({ d: d[0], t: d[1], w: d[2] })),
      regRows: t.regRows.map(r => ({ lab: r[0], val: r[1], c: r[2] })),
      brOn: t.brOn.map(b => ({ s: b[0], r: b[1] })), brAttn: t.brAttn.map(b => ({ s: b[0], r: b[1] })), brRed: t.brRed.map(b => ({ s: b[0], r: b[1] })), brDec: t.brDec.map(b => ({ t: b[0], d: b[1] })),
      wsOptions: depts.map(w => ({ v: w.n, t: w.n, sel: w.n === st.submitWs })),
      statusOpts: t.statusOpts.map(s => ({ t: s })),
      repWOptions: [{ v: 'all', t: t.allWs }, ...this.WS.map(w => ({ v: tx(w.n), t: tx(w.n) }))],
      repSOptions: [{ v: 'all', t: t.allSt }, { v: 'g', t: t.stG }, { v: 'a', t: t.stA }, { v: 'r', t: t.stR }],
      repOOptions: [{ v: 'all', t: t.allOw }, ...owners.map(o => ({ v: o, t: o }))],
      repROptions: [{ v: 'all', t: t.allLv }, { v: 'hi', t: t.hiOnly }],
      setRepW: e => this.setState({ repW: e.target.value }),
      setRepS: e => this.setState({ repS: e.target.value }),
      setRepO: e => this.setState({ repO: e.target.value }),
      setRepR: e => this.setState({ repR: e.target.value }),
      repRows, repShown: repRows.length + ' ' + t.shown,
      taskDraftRows, hasTaskDrafts: taskDraftRows.length > 0, addTaskDraft: this.addTaskDraft,
      doPrint: () => window.print(),
      submitUpdate: e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const gg = k => (f.get(k) || '').trim();
        const wsName = gg('ws');
        const target = depts.find(d => d.n === wsName);
        if (!target) {
          e.target.reset(); window.scrollTo(0, 0);
          this.setState({ toast: this.T[this.state.lang].toastMsg(wsName) });
          clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: null }), 6000);
          return;
        }
        const id = target.id;
        const base = target;
        const prevEdits = { ...(this.state.deptEdits || {}) };
        const ov = { ...(prevEdits[id] || {}) };
        ov.n = ov.n || base.n;
        ov.leadN = ov.leadN || base.leadN; ov.leadT = ov.leadT || base.leadT;
        ov.depN = ov.depN || base.depN; ov.depT = ov.depT || base.depT;
        const lead = gg('lead'); if (lead) ov.leadN = lead;
        const prog = gg('progress'); if (prog !== '') ov.p = Math.max(0, Math.min(100, Math.round(Number(prog) || 0)));
        const si = this.T[this.state.lang].statusOpts.indexOf(gg('status')); if (si >= 0) ov.s = ['g', 'a', 'r'][si];
        const achLines = [gg('ach'), gg('blockers')].join('\n').split('\n').map(x => x.trim()).filter(Boolean);
        ov.upd = (achLines.length ? [...achLines, ...base.upd] : base.upd).join('\n');
        const chalLines = gg('risks').split('\n').map(x => x.trim()).filter(Boolean);
        ov.chal = (chalLines.length ? [...chalLines, ...base.chal] : base.chal).join('\n');
        const appr = gg('budget'); ov.apprItem = appr ? appr : (ov.apprItem || base.apprItem); ov.apprDec = ov.apprDec || base.apprDec; ov.apprOwner = ov.apprOwner || base.apprOwner; ov.apprDue = ov.apprDue || base.apprDue;
        const nxt = gg('approvals'); ov.nextAction = nxt ? nxt : (ov.nextAction || base.nextAction); ov.nextWho = ov.nextWho || base.nextWho; ov.nextDue = ov.nextDue || base.nextDue;
        const dv = gg('date');
        if (dv) { const dp = dv.split('-'); if (dp.length === 3) { const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; ov.u = String(+dp[2]).padStart(2, '0') + ' ' + (MO[(+dp[1]) - 1] || ''); } }
        else { ov.u = ov.u || base.u; }
        const deptEdits = { ...prevEdits, [id]: ov };
        this.persist('wef_deptedits', deptEdits);
        const nextTasks = { ...(this.state.tasks || {}) };
        const drafts = (this.state.taskDrafts || []).filter(d => (d.task || '').trim());
        if (drafts.length) {
          const list = [...(nextTasks[id] || [])];
          drafts.forEach(d => { const tt = d.task.trim(); const own = (d.owner || '').trim() || base.leadN; const dp = (d.dep || '').trim() || '—'; const nx = (d.nx || '').trim() || '—';
            list.push({ t: [tt, tt], o: own, s: d.s || 'g', pr: d.pr || 'm', d: (d.due || '').trim() || '—', dep: [dp, dp], nx: [nx, nx] }); });
          nextTasks[id] = list; this.persist('wef_tasks', nextTasks);
        }
        e.target.reset(); window.scrollTo(0, 0);
        this.setState({ deptEdits, tasks: nextTasks, taskDrafts: [], page: 'dash', teamView: id, submitWs: null, toast: this.T[this.state.lang].toastMsg(wsName) });
        clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: null }), 6000);
      }
    };
  }
}