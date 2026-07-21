'use client';
/* eslint-disable */
// @ts-nocheck
//
// MOCA Events Command Center — Dashboard client component.
//
// This is a faithful React port of the approved Claude Design prototype
// ("WEF Command Center.dc.html"). The logic class (state, data, handlers and
// renderVals) is preserved verbatim from the prototype so behaviour is
// identical; only render() is authored as JSX and the CSS-string style helper
// `sty()` is added (the prototype's inline styles are CSS strings, which React
// requires as objects). Design tokens & CSS live in globals.css, unchanged.
//
// Data source: in the demo build the seed arrays below drive the UI (fake
// data). In the IT build these are replaced by the API/DB data provider and
// the seed arrays are emptied — see src/lib/data-provider.ts.
//
import React from 'react';

// Convert a CSS declaration string (e.g. "width:56px;background:var(--acc)")
// into a React style object. Respects url(...) so uploaded data-URI photo
// backgrounds (which contain ';' and ':') are not split incorrectly.
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

class DashboardApp extends React.Component {

  state = { lang: 'en', page: 'overview', railOpen: false, dash: 'all', sev: 'all', repW: 'all', repS: 'all', repO: 'all', repR: 'all', toast: null, admin: false, showLogin: false, loginErr: null, editIdx: null, detailIdx: null, edits: {}, members: null, photos: {}, order: null, submitWs: null, deptIdx: null, deptEditIdx: null, deptMembers: null, deptEdits: {}, acc: { wf: true }, teamView: null, actionKey: null, agendaKey: null, event: null, customEvents: [], showAddEvent: false, density: null, newLogoName: null, eventTeams: {}, showAddTeam: false };

  componentDidMount() {
    this._t = setInterval(() => this.forceUpdate(), 1000);
    let edits = {}, members = null, photos = {}, order = null;
    try { edits = JSON.parse(localStorage.getItem('wef_edits') || '{}'); } catch (e) {}
    try { members = JSON.parse(localStorage.getItem('wef_members') || 'null'); } catch (e) {}
    try { photos = JSON.parse(localStorage.getItem('wef_photos') || '{}'); } catch (e) {}
    try { order = JSON.parse(localStorage.getItem('wef_order') || 'null'); } catch (e) {}
    let deptEdits = {}, deptMembers = null, customEvents = [];
    try { deptEdits = JSON.parse(localStorage.getItem('wef_deptedits') || '{}'); } catch (e) {}
    try { deptMembers = JSON.parse(localStorage.getItem('wef_deptmembers') || 'null'); } catch (e) {}
    try { customEvents = JSON.parse(localStorage.getItem('wef_custom_events') || '[]'); } catch (e) {}
    let eventTeams = {};
    try { eventTeams = JSON.parse(localStorage.getItem('wef_event_teams') || '{}'); } catch (e) {}
    if (!localStorage.getItem('wef_seed_agm_v2')) { eventTeams = { ...eventTeams, agm: this.SEED_TEAMS.agm }; try { localStorage.setItem('wef_event_teams', JSON.stringify(eventTeams)); localStorage.setItem('wef_seed_agm_v2', '1'); } catch (e) {} }
    const seededDM = this.seedDeptMembers();
    deptMembers = deptMembers ? { ...seededDM, ...deptMembers } : seededDM;
    this.setState({ edits, members: members || this.seedMembers(), photos, order, deptEdits, deptMembers, customEvents, eventTeams });
    this.applyHash();
    this._hashFn = () => this.applyHash();
    window.addEventListener('hashchange', this._hashFn);
    // Demo-only: role switcher (src/app/AppClient.tsx) maps roles to Management Access.
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      this._roleFn = (e) => { try { this.setState({ admin: !!(e.detail && e.detail.admin) }); } catch (err) {} };
      window.addEventListener('moca-demo-role', this._roleFn);
    }
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
  componentWillUnmount() { clearInterval(this._t); clearTimeout(this._tt); }

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
      viewDetails: 'View details', detUpdates: 'Updates', detChallenges: 'Challenges', detApprovals: 'Pending Approvals', detNext: 'Next Steps', genGuide: 'Generate Guide', moveTo: 'Move to team', progStatus: 'Programme Status', wsCount: '18 workstreams',
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
      dashTitle: 'Operational Tracker', dashSub: 'Select a team to open its full operational view.',
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
      fWs: 'Workstream', fLead: 'Team Lead Name', fProg: 'Progress %', fStatus: 'Status', fAch: 'Achievements Since Last Update', fBlk: 'Current Blockers', fRisks: 'Risks', fBudget: 'Budget Updates', fAppr: 'Pending Approvals', fNext: 'Next Steps', fSupport: 'Required Management Support', fNotes: 'Attachments / Notes', fDate: 'Update Date',
      phLead: 'e.g. Shaima Khammas', phAch: 'Completed items, signed contracts, confirmed approvals…', phNotes: 'Link or reference to supporting documents',
      submitNote: 'Submissions are reviewed by Khawla Alsuwaidi before publication to leadership.', submitBtn: 'Submit Update',
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
      viewDetails: 'عرض التفاصيل', detUpdates: 'التحديثات', detChallenges: 'التحديات', detApprovals: 'الموافقات المعلّقة', detNext: 'الخطوات التالية', genGuide: 'إنشاء الدليل', moveTo: 'نقل إلى فريق', progStatus: 'حالة البرنامج', wsCount: '18 مسار عمل',
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
      dashTitle: 'متتبع العمليات', dashSub: 'ملكية الفرق ومتابعة إجراءاتها الحية عبر جميع الفرق التشغيلية. اختر فريقاً لفتح صفحته التشغيلية الكاملة.',
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
      fWs: 'مسار العمل', fLead: 'اسم قائد الفريق', fProg: 'نسبة الإنجاز ٪', fStatus: 'الحالة', fAch: 'الإنجازات منذ آخر تحديث', fBlk: 'المعوقات الحالية', fRisks: 'المخاطر', fBudget: 'مستجدات الميزانية', fAppr: 'الموافقات المعلّقة', fNext: 'الخطوات التالية', fSupport: 'الدعم المطلوب من الإدارة', fNotes: 'المرفقات / الملاحظات', fDate: 'تاريخ التحديث',
      phLead: 'مثال: شيماء خماس', phAch: 'البنود المنجزة والعقود الموقعة والموافقات المؤكدة…', phNotes: 'رابط أو مرجع للوثائق الداعمة',
      submitNote: 'تُراجع خولة السويدي التحديثات قبل نشرها للقيادة.', submitBtn: 'رفع التحديث',
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
    return { style, init: p ? '' : initText, cls: this.state.admin ? 'av-edit' : '', pick: this.pickPhoto(id) };
  }

  EVENTS = [
    { id: 'wef', en: 'Annual Meeting of Global Future Leaders 2026', ar: 'المنتدى الاقتصادي العالمي', logo: '/assets/logo-wef.png', status: 'active', period: ['13–15 Oct 2026 · Dubai', '13–15 أكتوبر 2026 · دبي'] },
    { id: 'agm', en: 'Annual Government Meetings of UAE', ar: 'الاجتماعات السنوية لحكومة دولة الإمارات', logo: '/assets/logo-agm-black.png', status: 'active', period: ['9–10 Nov 2026 · Abu Dhabi', '9–10 نوفمبر 2026 · أبوظبي'] },
    { id: 'mbr', en: 'MBR Government Excellence Award', ar: 'جائزة محمد بن راشد للأداء الحكومي المتميز', logo: '/assets/logo-mbrgea-nobg.png', status: 'blank', period: ['5 Dec 2026 · Dubai', '5 ديسمبر 2026 · دبي'] }
  ];
  allEvents() { return [...this.EVENTS, ...(this.state.customEvents || [])]; }
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
  openEvent = (id) => () => { this.setState({ event: id, page: 'overview', teamView: null, actionKey: null, agendaKey: null, showAddEvent: false }); window.scrollTo(0, 0); };
  backToEvents = () => { this.setState({ event: null, page: 'overview', teamView: null, actionKey: null, agendaKey: null, showAddEvent: false }); window.scrollTo(0, 0); };
  openAddEvent = () => this.setState({ showAddEvent: true, newLogoName: null });
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

  adminClick = () => { if (this.state.admin) this.setState({ admin: false }); else this.setState({ showLogin: true, loginErr: null }); };
  doLogin = (e) => { e.preventDefault(); const pwd = new FormData(e.target).get('pwd'); if (pwd === '1234') this.setState({ admin: true, showLogin: false, loginErr: null }); else this.setState({ loginErr: this.T[this.state.lang].wrongPwd }); };
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
  seedDeptMembers = () => { const out = {}; [...this.DEPTS, ...this.AGM_DEPTS].forEach(d => { out[d.id] = d.mem.map(m => ({ id: m.id, n: m.n, r: m.r })); }); return out; };
  openTeam = (id) => (e) => { if (e && e.target && e.target.closest && e.target.closest('button,select,input,textarea,form,.leadav')) return; this.setState({ teamView: id, page: 'dash', sel: {} }); window.scrollTo(0, 0); };
  closeTeam = () => { this.setState({ teamView: null, sel: {} }); window.scrollTo(0, 0); };
  toggleSel = (key) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); const sel = { ...(this.state.sel || {}) }; if (sel[key]) delete sel[key]; else sel[key] = true; this.setState({ sel }); };
  openAction = (id, i) => () => this.setState({ actionKey: id + ':' + i });
  closeAction = () => this.setState({ actionKey: null });
  openBlock = (di, bi) => () => this.setState({ agendaKey: di + ':' + bi });
  closeAgenda = () => this.setState({ agendaKey: null });
  openShareTeam = (id) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ shareKey: 'team:' + id, shareComment: '' }); };
  openShareAction = (id, i) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ shareKey: 'action:' + id + ':' + i, shareComment: '' }); };
  closeShare = () => this.setState({ shareKey: null });
  openComment = (id) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ commentKey: id, commentText: '' }); };
  closeComment = () => this.setState({ commentKey: null });
  setCommentText = (e) => this.setState({ commentText: e.target.value });
  setShareComment = (e) => this.setState({ shareComment: e.target.value });
  copyShareMsg = (msg) => () => {
    const done = () => this.flashToast(this.state.lang === 'ar' ? 'تم نسخ الرسالة' : 'Message copied');
    try { navigator.clipboard.writeText(msg).then(done, done); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = msg; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e2) {} ta.remove(); done(); }
  };
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
      dot: ['M12 12h.01']
    };
    const paths = P[type] || P.dot;
    return React.createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }, paths.map((d, i) => React.createElement('path', { key: i, d })));
  };

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

  openGuide = () => {
    const DEPTS = (this.state.event === 'agm' ? this.AGM_DEPTS : this.DEPTS).map(d => ({ id: d.id, n: d.n, lead: d.lead, dep: d.dep }));
    const CHIEF = { n: [this.T.en.chiefName, this.T.ar.chiefName], r: [this.T.en.chiefRole, this.T.ar.chiefRole] };
    const PM = { n: [this.T.en.pmName, this.T.ar.pmName], r: [this.T.en.pmRole, this.T.ar.pmRole] };
    const data = JSON.stringify({ DEPTS, CHIEF, PM, lang: this.state.lang });
    const css = "\n      *{box-sizing:border-box}\n      body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','IBM Plex Sans Arabic',sans-serif;background:#EEF1F6;color:#17233B}\n      .page{max-width:1000px;margin:0 auto;padding:38px 44px 60px;background:#fff;min-height:100vh;box-shadow:0 0 40px rgba(15,36,64,.06)}\n      .top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:2px solid #1B66C9;padding-bottom:18px;margin-bottom:28px}\n      .gt{font-size:12px;font-weight:800;letter-spacing:.24em;color:#1B66C9;text-transform:uppercase}\n      .gh{font-size:26px;font-weight:800;letter-spacing:-.02em;margin:7px 0 3px}\n      .gs{font-size:12.5px;color:#6B7688}\n      .tools{display:flex;gap:8px;flex:none}\n      .tbtn{appearance:none;border:1px solid #E7EAF1;background:#fff;color:#17233B;font:inherit;font-size:12px;font-weight:600;padding:9px 17px;border-radius:999px;cursor:pointer}\n      .tbtn.p{background:#1B66C9;color:#fff;border-color:#1B66C9}\n      .execrow{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}\n      .exc{flex:1;min-width:270px;display:flex;align-items:center;gap:14px;border-radius:16px;padding:16px 22px}\n      .exc.chief{background:linear-gradient(135deg,#0F2440,#1B3A63);color:#fff}\n      .exc.pm{background:#fff;border:1.5px solid #1B66C9}\n      .exc .cir{width:54px;height:54px;font-size:16px;margin:0}\n      .exc.chief .cir{background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.3)}\n      .exc.pm .cir{background:#1B66C9;color:#fff;border-color:#1B66C9}\n      .exc b{font-size:16px;display:block}\n      .exc span{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;opacity:.72;margin-top:2px;display:block}\n      .team{break-inside:avoid;margin-bottom:34px}\n      .tn{font-size:16.5px;font-weight:800;color:#1B66C9;letter-spacing:-.01em;margin-bottom:18px}\n      .leads{display:flex;gap:44px;flex-wrap:wrap;margin-bottom:20px}\n      .person{text-align:center;width:118px}\n      .cir{width:70px;height:70px;border-radius:50%;background:#EDEFF4;border:1px solid #DFE3EB;color:#7A8494;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;margin:0 auto 10px;background-size:cover;background-position:center;overflow:hidden}\n      .cir.big{width:90px;height:90px;font-size:23px}\n      .pn{font-size:12.5px;font-weight:700;color:#17233B;line-height:1.3}\n      .pr{font-size:11px;color:#6B7688;margin-top:3px}\n      .divi{display:flex;align-items:center;gap:14px;margin:8px 0 18px}\n      .divi .dl{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8A93A2;white-space:nowrap}\n      .divi .dr{flex:1;height:1px;background:#DDE2EB}\n      .members{display:flex;flex-wrap:wrap;gap:30px}\n      .foot{text-align:center;color:#9AA3B2;font-size:11px;margin-top:20px;border-top:1px solid #EDEFF4;padding-top:16px}\n      @media print{.tools{display:none}body{background:#fff}.page{box-shadow:none;padding:0;max-width:none}.team{page-break-inside:avoid}}\n      @page{size:A4;margin:14mm}\n    ";
    const js = "const D=" + data + ";let lang=D.lang||'en';\n" +
      "      const tx=v=>Array.isArray(v)?v[lang==='ar'?1:0]:v;\n" +
      "      const ini=s=>(s||'').trim().split(/\\s+/).map(x=>x[0]||'').slice(0,2).join('').toUpperCase();\n" +
      "      function read(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}\n" +
      "      function cir(id,i,big){var p=(read('wef_photos',{}))[id];var c=big?'cir big':'cir';return p?'<div class=\"'+c+'\" style=\"background-image:url('+p+')\"></div>':'<div class=\"'+c+'\">'+i+'</div>';}\n" +
      "      function person(id,name,role,big){return '<div class=\"person\">'+cir(id,ini(name),big)+'<div class=\"pn\">'+name+'</div><div class=\"pr\">'+role+'</div></div>';}\n" +
      "      function render(){\n" +
      "        var ar=lang==='ar';document.documentElement.dir=ar?'rtl':'ltr';\n" +
      "        var mem=read('wef_deptmembers',{});var eds=read('wef_deptedits',{});\n" +
      "        var MEM=ar?'أعضاء الفريق':'Team Members';var NONE=ar?'لم يُضَف أعضاء بعد':'No members added yet';\n" +
      "        var teams=D.DEPTS.map(function(d){var e=eds[d.id]||{};var list=(mem[d.id]||[]);\n" +
      "          var leadN=e.leadN||d.lead.n, leadT=e.leadT||tx(d.lead.t), depN=e.depN||d.dep.n, depT=e.depT||tx(d.dep.t);\n" +
      "          var leads=person('DL'+d.id,leadN,leadT,true)+person('DD'+d.id,depN,depT,true);\n" +
      "          var mm=list.length?list.map(function(m){return person(m.id,tx(m.n),tx(m.r),false);}).join(''):'<div class=\"pr\">'+NONE+'</div>';\n" +
      "          return '<div class=\"team\"><div class=\"tn\">'+(e.n||tx(d.n))+'</div><div class=\"leads\">'+leads+'</div><div class=\"divi\"><span class=\"dl\">'+MEM+'</span><span class=\"dr\"></span></div><div class=\"members\">'+mm+'</div></div>';\n" +
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
      "      window.addEventListener('storage',render);window.addEventListener('focus',render);render();";
    const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>WEF Operations — Team Guide</title><style>" + css + "</style></head><body><div id=\"app\"></div><scr" + "ipt>" + js + "</scr" + "ipt></body></html>";
    const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
    window.open(url, 'wef_guide');
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
      thAction: 'الإجراء / المهمة', thPriority: 'الأولوية', thDependency: 'التبعية', thNext: 'الإجراء التالي', exportTimeline: 'تصدير الجدول', addToCalL: 'إضافة إلى التقويم', locationL: 'الموقع', teamOwner: 'المسؤول / الفريق', notesL: 'ملاحظات', dateL: 'التاريخ', timeL: 'الوقت',
      setTitle: 'الإعدادات', setSub: 'اللغة والوصول الإداري وبيانات التطبيق.',
      shareCommentL: 'مشاركة تعليق', sharePreviewL: 'معاينة البطاقة', shareCommentPh: 'أضف تعليقك قبل المشاركة…', shareMsgPreviewL: 'معاينة الرسالة', copyMsgL: 'نسخ الرسالة', shareWhatsappL: 'مشاركة عبر واتساب', shareEmailL: 'مشاركة عبر البريد الإلكتروني', shareCommentTitle: 'مشاركة تعليق',
      commentL: 'تعليق', yourCommentL: 'تعليقك', yourCommentPh: 'اكتب تعليقك هنا…', teamPageLinkL: 'رابط صفحة الفريق', openTeamPageL: 'فتح صفحة الفريق', sendWhatsappL: 'إرسال عبر واتساب', eventNameL: 'الفعالية', selectToComment: 'اختر عنصرًا للتعليق', commentingOnL: 'التعليق على',
      setLang: 'اللغة', setAccess: 'صلاحية الإدارة', setAccessTxt: 'فعّل صلاحية الإدارة لإتاحة التعديل وعرض تفصيل الميزانية.',
      setTheme: 'كثافة العرض', setThemeTxt: 'بدّل بين العرض المريح والمضغوط حسب تفضيلك.',
      setData: 'البيانات المحلية', setDataTxt: 'إعادة ضبط البيانات التجريبية المحفوظة في هذا المتصفح.', setReset: 'إعادة ضبط البيانات التجريبية',
      setDensity: 'كثافة العرض', densComfort: 'مريح', densCompact: 'مضغوط',
      backToEvents: 'العودة إلى الفعاليات', eventsTracker: 'متتبع الفعاليات', landingSub: 'وزارة شؤون مجلس الوزراء · متتبع الفعاليات الحكومية',
      openTrackerL: 'فتح المتتبع', addEventT: 'إضافة فعالية جديدة', createNewL: 'إنشاء جديد', createTrackerL: 'إنشاء المتتبع',
      fEvName: 'اسم الفعالية', fEvNameAr: 'اسم الفعالية بالعربية', fEvLogo: 'شعار الفعالية', fEvLogoHint: 'تحميل الشعار (اختياري)', fEvPeriod: 'تاريخ / فترة الفعالية', fEvOwner: 'الفريق المسؤول',
      emptyUpdates: 'لا توجد تحديثات بعد', emptyOps: 'لا توجد بنود تشغيلية بعد', emptyTimelineL: 'لا توجد بنود زمنية بعد', emptySubmits: 'لا توجد تحديثات مُرسلة بعد',
      budgetTitle: 'تفصيل الميزانية', budgetLocked: 'فعّل صلاحية الإدارة لعرض تفصيل الميزانية.', blankOverviewSub: 'لم تُنشر مؤشرات الملخص التنفيذي لهذه الفعالية بعد. القوى العاملة ومتابعة الفرق متاحة في متتبع العمليات.',
      addTeamL: 'إضافة فريق', importL: 'استيراد CSV', removeL: 'إزالة', teamNameL: 'الفريق / مسار العمل', teamNameArL: 'الاسم بالعربية',
      ovReadiness: 'الجاهزية التشغيلية العامة', ovStatusTitle: 'حالة الفرق', ovAttnTitle: 'بنود تتطلب المتابعة', ovAttnSubT: 'الفرق التي تحتاج انتباه الإدارة، مرتبة حسب الحالة', ovTeams: 'الفرق', ovTeamsSub: 'إجمالي الفرق التشغيلية', ovOnTrackSub: 'على المسار الصحيح', ovAttnSub: 'تتطلب المتابعة', ovRiskSub: 'معرّضة للخطر', ovOpenActions: 'بنود العمل المفتوحة', ovOpenActionsSub: 'عبر جميع الفرق', ovApprSub: 'بانتظار الاعتماد', ovHeroNote: 'الجاهزية محسوبة من متوسط تقدّم جميع الفرق التشغيلية.', ovAgmNote: 'تُبنى هذه اللوحة من تحديثات فريق العمليات للاجتماعات السنوية.', reviewTeams: 'عرض الفرق ←', zeroSub: 'ابنِ المتتبع التشغيلي لهذه الفعالية بإضافة فريق لكل مسار عمل، أو استوردها من ملف CSV (الأعمدة: Team, Lead, Deputy, Progress, Status, Due).', zeroLocked: 'فعّل صلاحية الإدارة لبناء المتتبع التشغيلي.'
    } : {
      opTracker: 'Operational Tracker', close: 'Close', viewTeam: 'View team', apprItem: 'Approval Item', responsible: 'Responsible', exportSummaryL: 'Export Team Summary', roleLabel: 'Role / responsibility',
      backToTracker: 'Back to Operational Tracker', nextDue: 'Next Due', openItems: 'open action items', delayL: 'Delay', delayFlag: 'Behind schedule',
      thAction: 'Action / Task', thPriority: 'Priority', thDependency: 'Dependency', thNext: 'Next Action', exportTimeline: 'Export Timeline', addToCalL: 'Add to Calendar', locationL: 'Location', teamOwner: 'Owner / Team', notesL: 'Notes', dateL: 'Date', timeL: 'Time',
      setTitle: 'Settings', setSub: 'Language, management access, and local app data.',
      shareCommentL: 'Share Comment', sharePreviewL: 'Card preview', shareCommentPh: 'Add your comment before sharing…', shareMsgPreviewL: 'Message preview', copyMsgL: 'Copy Message', shareWhatsappL: 'Share via WhatsApp', shareEmailL: 'Share via Email', shareCommentTitle: 'Share Comment',
      commentL: 'Comment', yourCommentL: 'Your comment', yourCommentPh: 'Write your comment here…', teamPageLinkL: 'Team page link', openTeamPageL: 'Open team page', sendWhatsappL: 'Send WhatsApp', eventNameL: 'Event', selectToComment: 'Select an item to comment', commentingOnL: 'Commenting On',
      setLang: 'Language', setAccess: 'Management Access', setAccessTxt: 'Enable Management Access to unlock editing and detailed budget breakdowns.',
      setTheme: 'Display Density', setThemeTxt: 'Switch between comfortable and compact layouts to suit your preference.',
      setData: 'Local Data', setDataTxt: 'Reset demo data, members, photos and saved edits stored in this browser.', setReset: 'Reset demo data',
      setDensity: 'Display Density', densComfort: 'Comfortable', densCompact: 'Compact',
      backToEvents: 'Back to Events', eventsTracker: 'Events Tracker', landingSub: 'Ministry of Cabinet Affairs ',
      openTrackerL: 'Open Tracker', addEventT: 'Add New Event', createNewL: 'Create New', createTrackerL: 'Create Tracker',
      fEvName: 'Event name', fEvNameAr: 'Arabic event name', fEvLogo: 'Event logo', fEvLogoHint: 'Upload logo (optional)', fEvPeriod: 'Event date / period', fEvOwner: 'Lead team / owner',
      emptyUpdates: 'No updates added yet', emptyOps: 'No operational items added yet', emptyTimelineL: 'No timeline items added yet', emptySubmits: 'No submitted updates yet',
      budgetTitle: 'Detailed Budget Breakdown', budgetLocked: 'Enable Management Access to view the detailed budget breakdown.', blankOverviewSub: 'Executive summary metrics haven’t been published for this event yet. The operational workforce and team tracking are available in the Operational Tracker.',
      addTeamL: 'Add Team', importL: 'Import CSV', removeL: 'Remove', teamNameL: 'Team / Streamline', teamNameArL: 'Arabic name',
      ovReadiness: 'Overall Operational Readiness', ovStatusTitle: 'Team Status', ovAttnTitle: 'Items Requiring Attention', ovAttnSubT: 'Teams needing management attention, ordered by status', ovTeams: 'Teams', ovTeamsSub: 'Total operational teams', ovOnTrackSub: 'On track', ovAttnSub: 'Need attention', ovRiskSub: 'At risk', ovOpenActions: 'Open Action Items', ovOpenActionsSub: 'Across all teams', ovApprSub: 'Awaiting sign-off', ovHeroNote: 'Readiness is the average progress across all operational teams.', ovAgmNote: 'This dashboard is built from the Annual Government Meetings operations team updates.', reviewTeams: 'View teams →', zeroSub: 'Build this event’s operational tracker by adding a team for each streamline, or import them from a CSV sheet (columns: Team, Lead, Deputy, Progress, Status, Due).', zeroLocked: 'Enable Management Access to build the operational tracker.'
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
    const ACTIVE_DEPTS = st.event === 'agm' ? this.AGM_DEPTS : (st.event === 'wef' ? this.DEPTS : []);
    const ALL_DEPTS = [...this.DEPTS, ...this.AGM_DEPTS];
    const META = { ...this.DEPT_META, ...this.AGM_META };
    const ACTIVE_EVENT = st.event === 'agm' ? this.AGM_EVENT : (st.event === 'wef' ? this.EVENT : []);
    const depEnrich = (d) => {
      const e2 = deptEdits[d.id] || {};
      const meta = META[d.id] || { p: 0, due: '', delay: false, actions: [] };
      const sx = e2.s || d.s;
      const upd = e2.upd != null ? String(e2.upd).split('\n').map(x => x.trim()).filter(Boolean) : d.upd.map(tx);
      const chal = e2.chal != null ? String(e2.chal).split('\n').map(x => x.trim()).filter(Boolean) : d.chal.map(tx);
      const leadN = e2.leadN || d.lead.n, depN = e2.depN || d.dep.n;
      return {
        id: d.id, n: e2.n || tx(d.n), s: sx, sl: t.statuses[sx], pill: STATUS[sx].pill, tcCls: 'tc-' + sx, u: e2.u || txd(d.u),
        leadN, leadT: e2.leadT || tx(d.lead.t), depN, depT: e2.depT || tx(d.dep.t), depInit: initials(depN),
        leadPhoto: this.photoObj('DL' + d.id, initials(leadN)), depPhoto: this.photoObj('DD' + d.id, initials(depN)),
        upd, chal,
        apprItem: e2.apprItem || tx(d.appr.item), apprDec: e2.apprDec || tx(d.appr.dec), apprOwner: e2.apprOwner || d.appr.owner, apprDue: e2.apprDue || txd(d.appr.due),
        nextAction: e2.nextAction || tx(d.next.action), nextWho: e2.nextWho || d.next.who, nextDue: e2.nextDue || txd(d.next.due),
        p: meta.p, col: STATUS[sx].col, due: txd(meta.due), delay: !!meta.delay, openCount: (meta.actions || []).length,
        open: this.openTeam(d.id), edit: this.openDeptEdit(d.id), share: this.openShareTeam(d.id)
      };
    };
    const depts = ACTIVE_DEPTS.map(depEnrich);
    const prLbl = { h: ar ? 'عالية' : 'High', m: ar ? 'متوسطة' : 'Medium', l: ar ? 'منخفضة' : 'Low' };
    let teamView = null;
    if (st.teamView != null) {
      const dd = ALL_DEPTS.find(x => x.id === st.teamView);
      if (dd) {
        const dx = depEnrich(dd);
        const meta = META[dd.id] || { actions: [] };
        const mem = (deptMembersS[dd.id] || []).map(m => ({ n: tx(m.n), role: tx(m.r), ...this.photoObj(m.id, initials(tx(m.n))) }));
        const wf = [
          { n: dx.leadN, role: t.teamLead, ...dx.leadPhoto },
          { n: dx.depN, role: t.deputy, ...dx.depPhoto },
          ...mem
        ];
        const actions = (meta.actions || []).map((a, i) => ({ t: tx(a.t), o: a.o, s: a.s, sl: t.statuses[a.s], pill: STATUS[a.s].pill, pr: prLbl[a.pr], prCls: 'pr-' + a.pr, d: txd(a.d), dep: tx(a.dep), share: this.openShareAction(dd.id, i), nx: tx(a.nx), open: this.openAction(dd.id, i) }));
        const bRows = [
          [['Flights & tickets', 'الطيران والتذاكر'], 'AED 2,700,000'],
          [['Accommodation', 'الإقامة'], 'AED 1,450,000'],
          [['Giveaways (400 × AED 150)', 'الهدايا (400 × 150)'], 'AED 60,000'],
          [['Gala dinner (estimate)', 'العشاء الرسمي (تقديري)'], 'AED 480,000'],
          [['Transportation tender (estimate)', 'مناقصة النقل (تقديري)'], 'AED 320,000']
        ];
        const isBudget = dd.id === 'd5';
        const sel = st.sel || {};
        const updItems = (dx.upd || []).map((txt, i) => ({ text: txt, sel: !!sel['upd:' + i], toggle: this.toggleSel('upd:' + i), rowCls: sel['upd:' + i] ? 'opbul selrow selrow-on' : 'opbul selrow', circleCls: sel['upd:' + i] ? 'selcircle on' : 'selcircle' }));
        const chalItems = (dx.chal || []).map((txt, i) => ({ text: txt, sel: !!sel['chal:' + i], toggle: this.toggleSel('chal:' + i), rowCls: sel['chal:' + i] ? 'opbul selrow selrow-on' : 'opbul selrow', circleCls: sel['chal:' + i] ? 'selcircle on' : 'selcircle' }));
        const wfSel = !!sel.wf;
        const selCount = Object.keys(sel).length;
        teamView = { ...dx, wf, actions, isBudget, budgetRows: isBudget ? bRows.map(r => ({ lab: tx(r[0]), val: r[1] })) : [],
          updItems, chalItems, wfSel, wfToggle: this.toggleSel('wf'),
          wfCircleCls: wfSel ? 'selcircle on' : 'selcircle', wfCardCls: wfSel ? 'card mt14 selcard-on' : 'card mt14',
          commentEnabled: selCount > 0, commentBtnCls: selCount > 0 ? 'sharebtn' : 'sharebtn is-disabled',
          comment: selCount > 0 ? this.openComment(dd.id) : (e) => { if (e && e.stopPropagation) e.stopPropagation(); },
          commentTip: selCount > 0 ? '' : EX.selectToComment };
      }
    }
    let actionModal = null;
    if (st.actionKey) {
      const parts = st.actionKey.split(':'); const meta = META[parts[0]] || { actions: [] }; const a = (meta.actions || [])[Number(parts[1])];
      if (a) actionModal = { t: tx(a.t), o: a.o, d: txd(a.d), s: a.s, sl: t.statuses[a.s], pill: STATUS[a.s].pill, pr: prLbl[a.pr], prCls: 'pr-' + a.pr, up: tx(a.up), ch: tx(a.ch), dep: tx(a.dep), nx: tx(a.nx) };
    }
    const eventDays = ACTIVE_EVENT.map((d, di) => ({
      date: tx(d.date), day: tx(d.day), tagline: d.tagline ? tx(d.tagline) : '', hasTag: !!d.tagline,
      iconEl: this.icon(d.icon), desc: d.desc ? tx(d.desc) : '', hasBlocks: (d.blocks || []).length > 0,
      blocks: (d.blocks || []).map((b, bi) => ({ time: b.time, t: tx(b.t), sub: b.sub ? tx(b.sub) : '', hasSub: !!b.sub, iconEl: this.icon(b.icon), open: this.openBlock(di, bi) }))
    }));
    let agendaModal = null;
    if (st.agendaKey) {
      const parts = st.agendaKey.split(':'); const d = ACTIVE_EVENT[Number(parts[0])] || this.EVENT[Number(parts[0])]; const b = d && (d.blocks || [])[Number(parts[1])];
      if (b) agendaModal = { t: tx(b.t), date: tx(d.date), time: b.time, loc: tx(b.loc), team: tx(b.team), notes: tx(b.notes), addToCal: this.buildCalDownload((b.t && b.t[0]) || '', (d.date && d.date[0]) || '', b.time, (b.loc && b.loc[0]) || '', (b.notes && b.notes[0]) || '') };
    }
    const accS = st.acc || { wf: true };
    const mkAcc = (key) => ({ cls: accS[key] ? 'open' : '', toggle: this.toggleAcc(key) });
    let deptModal = null;
    if (st.deptIdx != null) {
      const dd = ALL_DEPTS.find(x => x.id === st.deptIdx);
      const dx = depEnrich(dd);
      const force = (deptMembersS[dd.id] || []).map(m => ({ id: m.id, n: tx(m.n), role: tx(m.r), ...this.photoObj(m.id, initials(tx(m.n))), remove: this.removeDeptMember(dd.id, m.id), editName: this.editDeptMemberName(dd.id, m.id), editRole: this.editDeptMemberRole(dd.id, m.id) }));
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
    let shareModal = null;
    if (st.shareKey) {
      const sp = st.shareKey.split(':');
      const dd = ALL_DEPTS.find(x => x.id === sp[1]);
      if (dd) {
        const dx = depEnrich(dd); const meta = META[dd.id] || { actions: [] };
        const comment = st.shareComment || '';
        const L = ar
          ? { sec: '\u0627\u0644\u0642\u0633\u0645: \u0627\u0644\u0645\u062a\u062a\u0628\u0639 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u064a', ev: '\u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0629', secv: '\u0627\u0644\u0645\u062a\u062a\u0628\u0639 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u064a', team: '\u0627\u0644\u0641\u0631\u064a\u0642', status: '\u0627\u0644\u062d\u0627\u0644\u0629', prog: '\u0627\u0644\u0646\u0633\u0628\u0629', upd: '\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b', items: '\u0627\u0644\u0628\u0646\u0648\u062f \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629', action: '\u0627\u0644\u0625\u062c\u0631\u0627\u0621', owner: '\u0627\u0644\u0645\u0627\u0644\u0643', pr: '\u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0629', due: '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0633\u062a\u062d\u0642\u0627\u0642', cmt: '\u0627\u0644\u062a\u0639\u0644\u064a\u0642', ref: '\u0645\u0631\u062c\u0639 \u0627\u0644\u0645\u062a\u062a\u0628\u0639' }
          : { sec: 'Section: Operational Tracker', ev: 'Event', secv: 'Operational Tracker', team: 'Team', status: 'Status', prog: 'Progress', upd: 'Last Updated', items: 'Open Items', action: 'Action', owner: 'Owner', pr: 'Priority', due: 'Due', cmt: 'Comment', ref: 'Tracker Reference' };
        const ref = '#event=' + st.event + '&section=operational-tracker&team=' + dd.id;
        const cmtLine = comment.trim() ? comment.trim() : '—';
        let lines, rows, subject;
        if (sp[0] === 'action') {
          const a = (meta.actions || [])[Number(sp[2])];
          const at = a ? tx(a.t) : '', owner = a ? a.o : '', sl = a ? t.statuses[a.s] : '', prv = a ? prLbl[a.pr] : '', due = a ? txd(a.d) : '';
          lines = [eventName, L.sec, L.team + ': ' + dx.n, L.action + ': ' + at, '', L.status + ': ' + sl, L.owner + ': ' + owner, L.pr + ': ' + prv, L.due + ': ' + due, '', L.cmt + ':', cmtLine, '', L.ref + ':', ref];
          rows = [{ k: L.ev, v: eventName }, { k: L.team, v: dx.n }, { k: L.action, v: at }, { k: L.status, v: sl }, { k: L.due, v: due }];
          subject = (ar ? 'تعليق المتتبع: ' : 'Tracker Comment: ') + dx.n;
        } else {
          lines = [eventName, L.sec, L.team + ': ' + dx.n, '', L.status + ': ' + dx.sl, L.prog + ': ' + dx.p + '%', L.upd + ': ' + dx.u, L.items + ': ' + dx.openCount, '', L.cmt + ':', cmtLine, '', L.ref + ':', ref];
          rows = [{ k: L.ev, v: eventName }, { k: (ar ? 'القسم' : 'Section'), v: L.secv }, { k: L.team, v: dx.n }, { k: L.status, v: dx.sl }, { k: L.prog, v: dx.p + '%' }, { k: L.upd, v: dx.u }, { k: L.items, v: String(dx.openCount) }];
          subject = (ar ? 'تعليق المتتبع: ' : 'Tracker Comment: ') + dx.n;
        }
        const msg = lines.join('\n');
        shareModal = { teamName: dx.n, pill: dx.pill, sl: dx.sl, rows, msg, comment,
          wa: 'https://wa.me/?text=' + encodeURIComponent(msg),
          mail: 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg),
          copy: this.copyShareMsg(msg) };
      }
    }
    let commentModal = null;
    if (st.commentKey) {
      const dd = ALL_DEPTS.find(x => x.id === st.commentKey);
      if (dd) {
        const dx = depEnrich(dd); const c = st.commentText || '';
        const base = (typeof location !== 'undefined') ? location.href.split('#')[0] : '';
        const link = base + '#event=' + st.event + '&team=' + dd.id;
        const cmtLbl = ar ? 'التعليق' : 'Comment';
        const pageLbl = ar ? 'صفحة الفريق' : 'Team page';
        const teamLbl = ar ? 'الفريق' : 'Team';
        const onLbl = ar ? 'التعليق على' : 'Commenting On';
        const sel = st.sel || {};
        const items = [];
        if (sel.wf) items.push(ar ? 'فريق العمل' : 'Workforce section');
        (dx.upd || []).forEach((u, i) => { if (sel['upd:' + i]) items.push(u); });
        (dx.chal || []).forEach((ch, i) => { if (sel['chal:' + i]) items.push(ch); });
        const onLines = items.length ? [onLbl + ':', ...items.map(x => '• ' + x), ''] : [];
        const lines = [eventName, teamLbl + ': ' + dx.n, '', ...onLines, cmtLbl + ':', (c.trim() || '—'), '', pageLbl + ':', link];
        const msg = lines.join('\n');
        commentModal = { teamName: dx.n, eventName, comment: c, link, items, hasItems: items.length > 0, wa: 'https://wa.me/?text=' + encodeURIComponent(msg) };
      }
    }
    const eventPeriod = evObj ? (Array.isArray(evObj.period) ? evObj.period[ar ? 1 : 0] : evObj.period) : '';
    const eventLogo = evObj ? evObj.logo : '';
    const eventInit = evObj ? (evObj.en || '?').trim().charAt(0).toUpperCase() : '';
    const statusMeta = { active: { l: ar ? 'متتبع نشط' : 'Active Tracker', cls: 'pg-g' }, blank: { l: ar ? 'متتبع فارغ' : 'Blank Tracker', cls: 'pg-neutral' } };
    const eventCards = this.allEvents().map(ev => ({ id: ev.id, logoEl: ev.logo ? React.createElement('img', { key: 'l', src: ev.logo, alt: '' }) : React.createElement('span', { className: 'evlogo-ph' }, (ev.en || '?').trim().charAt(0).toUpperCase()), name: ar ? ev.ar : ev.en, name2: '', date: ev.period ? (ar ? ev.period[1] : ev.period[0]) : '', statusL: statusMeta[ev.status].l, pillCls: statusMeta[ev.status].cls, open: this.openEvent(ev.id) }));
    const mkLogo = (url, init, key) => url ? React.createElement('img', { key, src: url, alt: '' }) : init;
    const densityActive = st.density ? st.density : ((this.props.compact ?? false) ? 'compact' : 'comfortable');
    let customTeams = [];
    if (blankEvent) {
      customTeams = this.getEventTeams(st.event).map(tm => {
        const s = tm.s || 'a'; const stt = STATUS[s] || STATUS.a; const pk = (v) => Array.isArray(v) ? (v[ar ? 1 : 0] || v[0]) : v;
        const ln = pk(tm.leadN) || '\u2014', dn = pk(tm.depN) || '\u2014';
        return { id: tm.id, n: pk(tm.n), leadN: ln, depN: dn, leadInit: initials(ln), depInit: initials(dn), s, sl: t.statuses[s], pill: stt.pill, tcCls: 'tc-' + s, col: stt.col, p: tm.p || 0, u: txd(pk(tm.u) || '\u2014'), remove: this.removeTeamFn(st.event, tm.id) };
      });
    }

    return {
      dir: ar ? 'rtl' : 'ltr', dirCls: ar ? 'rtl' : '',
      enCls: ar ? '' : 'on', arCls: ar ? 'on' : '',
      setEn: () => this.setState({ lang: 'en' }), setAr: () => this.setState({ lang: 'ar' }),
      t: { ...t, brAsOf: t.brAsOf(cdDays), ...EX },
      isLanding: st.event == null, inTracker: st.event != null,
      isWef, blankEvent, hasRich, genOverview: st.event === 'agm' && !!ovw, ovw, hasTeams: hasRich, emptyTracker: blankEvent && !hasRich, hasTimeline: hasRich, emptyTimeline: blankEvent && !hasRich,
      eventName, eventPeriod, eventLogo, eventInit, eventHasLogo: !!eventLogo, eventNoLogo: !eventLogo, railLogoEl: mkLogo(eventLogo, eventInit, 'rl'), topLogoEl: mkLogo(eventLogo, eventInit, 'tl'),
      eventCards, backToEvents: this.backToEvents,
      customTeams, hasCustomTeams: blankEvent && !hasRich && customTeams.length > 0, showZero: blankEvent && !hasRich && customTeams.length === 0, blankAdmin: blankEvent && !hasRich && st.admin,
      showAddTeam: st.showAddTeam, openAddTeam: this.openAddTeam, closeAddTeam: this.closeAddTeam, createTeam: this.createTeam, importTeams: this.importTeams,
      streamlineOpts: (st.event === 'agm' ? this.AGM_DEPTS : this.DEPTS).map(d => ({ t: tx(d.n) })), statusFormOpts: ['g', 'a', 'r'].map(v => ({ v, t: t.statuses[v] })),
      showAddEvent: st.showAddEvent, openAddEvent: this.openAddEvent, closeAddEvent: this.closeAddEvent, createEvent: this.createEvent, pickNewLogo: this.pickNewLogo, newLogoName: st.newLogoName,
      densityComfort: densityActive === 'comfortable', densityCompact: densityActive === 'compact', toggleDensity: this.toggleDensity, densComfortCls: densityActive === 'comfortable' ? 'on' : '', densCompactCls: densityActive === 'compact' ? 'on' : '',
      accCls: { 'Federal Blue': '', 'Teal': 'acc-teal', 'Royal': 'acc-royal' }[this.props.accent] || '',
      densityCls: densityActive === 'compact' ? 'compact' : '',
      cdDays, cdHrs: String(cdHrs).padStart(2, '0'), cdMin: String(cdMin).padStart(2, '0'), cdSec: String(cdSec).padStart(2, '0'),
      navOverview: { label: ar ? 'النظرة التنفيذية' : 'Executive Overview', cls: st.page === 'overview' ? 'on' : '', go: this.go('overview') },
      navDash: { label: ar ? 'المتتبع التشغيلي' : 'Operational Tracker', cls: st.page === 'dash' ? 'on' : '', go: this.go('dash') },
      navOrg: { label: ar ? 'فريق العمل' : 'Workforce', cls: st.page === 'org' ? 'on' : '', go: this.go('org') },
      navTimeline: { label: ar ? 'الجدول الزمني' : 'Timeline', cls: st.page === 'timeline' ? 'on' : '', go: this.go('timeline') },
      navSubmit: { label: ar ? 'رفع التحديثات' : 'Submit Update', cls: st.page === 'submit' ? 'on' : '', go: this.go('submit') },
      navSettings: { label: ar ? 'الإعدادات' : 'Settings', cls: st.page === 'settings' ? 'on' : '', go: this.go('settings') },
      railClass: st.railOpen ? 'railopen' : '', toggleRail: () => this.setState({ railOpen: !st.railOpen }),
      adminBtnCls: st.admin ? 'ghost' : '', resetData: this.resetData,
      kpis3: [
        { lab: t.kpis[2][0], num: t.kpis[2][1], sub: t.kpis[2][2], c: 'var(--acc)', icbg: 'rgba(27,102,201,.1)', ic: '↻' },
        { lab: t.kpis[3][0], num: t.kpis[3][1], sub: t.kpis[3][2], c: 'var(--a)', icbg: 'rgba(176,124,31,.13)', ic: '!' },
        { lab: t.kpis[4][0], num: t.kpis[4][1], sub: t.kpis[4][2], c: 'var(--r)', icbg: 'rgba(176,58,50,.1)', ic: '▲' }
      ],
      isOverview: st.page === 'overview', isDash: st.page === 'dash', isTeams: st.page === 'teams', isOrg: st.page === 'org', isTimeline: st.page === 'timeline', isRisks: st.page === 'risks', isDecisions: st.page === 'decisions', isSubmit: st.page === 'submit', isReports: st.page === 'reports', isBrief: st.page === 'brief', isSettings: st.page === 'settings',
      admin: st.admin, notAdmin: !st.admin, adminLive: st.admin ? 'live' : '', adminIconCls: st.admin ? 'adot2' : '', adminBtnLabel: st.admin ? t.signOut : t.adminBtn, adminClick: this.adminClick,
      showLogin: st.showLogin, loginErr: st.loginErr, closeLogin: () => this.setState({ showLogin: false, loginErr: null }), doLogin: this.doLogin, stop: e => e.stopPropagation(),
      editModal: em, editStatusOpts, closeEdit: this.closeEdit, saveEdit: this.saveEditFn, teams, roleOpts, chiefPhoto, pmPhoto, submitWs: st.submitWs,
      detailModal: dm, closeDetail: this.closeDetail, openGuide: this.openGuide,
      teamView, noTeamView: st.teamView == null, closeTeam: this.closeTeam,
      actionModal, closeAction: this.closeAction, agendaModal, closeAgenda: this.closeAgenda, eventDays: hasRich ? eventDays : [],
      shareModal, closeShare: this.closeShare, setShareComment: this.setShareComment,
      commentModal, closeComment: this.closeComment, setCommentText: this.setCommentText,
      depts: hasRich ? depts : [], deptModal, deptEditModal, closeDept: this.closeDept, closeDeptEdit: this.closeDeptEdit, saveDeptEdit: this.saveDeptEdit,
      goRisks: e => { e.preventDefault(); this.go('dash')(); },
      toast: st.toast,
      wsCards, dashChips, sevChips, riskCards, heat, milestones, decisions, attention,
      kpis: t.kpis.map(k => ({ lab: k[0], num: k[1], sub: k[2], c: k[3] || 'var(--ink)' })),
      rhy: t.rhy.map(r => ({ lab: r[0], txt: r[1] })),
      deadlines: t.deadlines.map(d => ({ d: d[0], t: d[1], w: d[2] })),
      regRows: t.regRows.map(r => ({ lab: r[0], val: r[1], c: r[2] })),
      brOn: t.brOn.map(b => ({ s: b[0], r: b[1] })), brAttn: t.brAttn.map(b => ({ s: b[0], r: b[1] })), brRed: t.brRed.map(b => ({ s: b[0], r: b[1] })), brDec: t.brDec.map(b => ({ t: b[0], d: b[1] })),
      wsOptions: (isWef ? this.WS : (st.event === 'agm' ? this.AGM_DEPTS : this.DEPTS)).map(w => ({ v: tx(w.n), t: tx(w.n), sel: tx(w.n) === st.submitWs })),
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
      doPrint: () => window.print(),
      submitUpdate: e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const ws = f.get('ws') || (ar ? 'مسار العمل' : 'Workstream');
        e.target.reset();
        window.scrollTo(0, 0);
        this.setState({ toast: this.T[this.state.lang].toastMsg(ws) });
        clearTimeout(this._tt);
        this._tt = setTimeout(() => this.setState({ toast: null }), 6000);
      }
    };
  }

  render() {
    const v = this.renderVals();
    const t = v.t;
    const S = sty;
    return (
      <>
        {/* ===================== LANDING ===================== */}
        {v.isLanding && (
          <div className={'landing ' + v.dirCls} dir={v.dir}>
            <div className="landing-top">
              <div className="lang">
                <button className={'lbtn ' + v.enCls} onClick={v.setEn}>EN</button>
                <button className={'lbtn ' + v.arCls} onClick={v.setAr}>العربية</button>
              </div>
            </div>
            <div className="landing-inner">
              <header className="landing-head">
                <img className="moca-logo" src="/assets/logo-moca.png" alt="Ministry of Cabinet Affairs" />
                <h1 className="landing-title" style={S('font-size:40px')}>{t.eventsTracker}</h1>
                <p className="landing-sub" style={S('font-size:16px')}>{t.landingSub}</p>
              </header>
              <div className="evgrid">
                {v.eventCards.map((ev) => (
                  <div key={ev.id} className="evcard" onClick={ev.open} style={S('width:270px;height:310px')}>
                    <div className="evlogo">{ev.logoEl}</div>
                    <div className="evname">{ev.name}</div>
                    <div className="evdate">{ev.date}</div>
                    <button className="btn evbtn" onClick={ev.open}>{t.openTrackerL}</button>
                  </div>
                ))}
                <div className="evcard evadd" onClick={v.openAddEvent}>
                  <div className="evadd-plus">+</div>
                  <div className="evname">{t.addEventT}</div>
                  <button className="btn ghost evbtn" onClick={v.openAddEvent}>{t.createTrackerL}</button>
                </div>
              </div>
            </div>
            {v.showAddEvent && (
              <div className="ovl" onClick={v.closeAddEvent}><div className="modal" onClick={v.stop}>
                <div className="fx jb" style={S('align-items:flex-start;gap:14px')}><h2 className="mtitle">{t.addEventTitle || t.addEventT}</h2><button className="mclose" onClick={v.closeAddEvent}>×</button></div>
                <form onSubmit={v.createEvent}>
                  <div className="fgrid mt16"><div className="field"><label className="flab">{t.fEvName}</label><input className="inp" name="en" autoFocus /></div><div className="field"><label className="flab">{t.fEvNameAr}</label><input className="inp" name="ar" dir="rtl" /></div></div>
                  <div className="field mt16"><label className="flab">{t.fEvLogo}</label><button type="button" className="logo-upload" onClick={v.pickNewLogo}><span className="logo-upload-ic">⬆</span><span>{t.fEvLogoHint}</span></button>{v.newLogoName && (<div className="mut fs12" style={S('margin-top:6px')}>{v.newLogoName}</div>)}</div>
                  <div className="fgrid mt16"><div className="field"><label className="flab">{t.fEvPeriod}</label><input className="inp" name="period" /></div><div className="field"><label className="flab">{t.fEvOwner}</label><input className="inp" name="owner" /></div></div>
                  <div className="fx gap8 mt24" style={S('justify-content:flex-end')}><button className="btn ghost" type="button" onClick={v.closeAddEvent}>{t.cancel}</button><button className="btn" type="submit">{t.createTrackerL}</button></div>
                </form>
              </div></div>
            )}
          </div>
        )}

        {/* ===================== TRACKER ===================== */}
        {v.inTracker && (
          <div className={'app ' + v.accCls + ' ' + v.densityCls + ' ' + v.dirCls + ' ' + v.railClass} dir={v.dir}>
            <aside className="rail">
              <button className="railtoggle" onClick={v.toggleRail} aria-label="Toggle menu"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"></path></svg></button>
              <div className="raillogo"><span className="railmark">{v.railLogoEl}</span><span className="rlt">{v.eventName}</span></div>
              <nav className="railnav">
                <button className={'navitem ' + v.navOverview.cls} onClick={v.navOverview.go}><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1.5"></rect><rect x="14" y="3" width="7" height="5" rx="1.5"></rect><rect x="14" y="12" width="7" height="9" rx="1.5"></rect><rect x="3" y="16" width="7" height="5" rx="1.5"></rect></svg><span className="nvl">{v.navOverview.label}</span></button>
                <button className={'navitem ' + v.navDash.cls} onClick={v.navDash.go}><svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round"></path><path d="M4.5 6l.01 0M4.5 12l.01 0M4.5 18l.01 0" strokeLinecap="round" strokeWidth="2.6"></path></svg><span className="nvl">{v.navDash.label}</span></button>
                <button className={'navitem ' + v.navTimeline.cls} onClick={v.navTimeline.go}><svg viewBox="0 0 24 24"><path d="M12 4v16"></path><circle cx="12" cy="7" r="2.4"></circle><circle cx="12" cy="17" r="2.4"></circle><path d="M14.4 7H20M4 17h5.6" strokeLinecap="round"></path></svg><span className="nvl">{v.navTimeline.label}</span></button>
                <button className={'navitem ' + v.navSubmit.cls} onClick={v.navSubmit.go}><svg viewBox="0 0 24 24"><path d="M12 16V5m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"></path><path d="M5 19h14" strokeLinecap="round"></path></svg><span className="nvl">{v.navSubmit.label}</span></button>
              </nav>
              <div className="railbottom">
                <button className={'navitem ' + v.navSettings.cls} onClick={v.navSettings.go}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l1.7-1.3-1.9-3.3-2 .8a7.7 7.7 0 0 0-2.6-1.5l-.3-2.1H10.7l-.3 2.1A7.7 7.7 0 0 0 7.8 5.7l-2-.8L3.9 8.2l1.7 1.3a7.7 7.7 0 0 0 0 3l-1.7 1.3 1.9 3.3 2-.8a7.7 7.7 0 0 0 2.6 1.5l.3 2.1h3.8l.3-2.1a7.7 7.7 0 0 0 2.6-1.5l2 .8 1.9-3.3z"></path></svg><span className="nvl">{v.navSettings.label}</span></button>
              </div>
            </aside>
            <div className="maincol" style={{ background: "url('/assets/tracker-bg.png') center / cover no-repeat" }}>
              <header className="topbar" style={S('background-color:#FFFFFFD1')}>
                <div className="fx ac gap12" style={S('min-width:0')}>
                  <button className="backev" onClick={v.backToEvents}>{t.backToEvents}</button>
                  <span className="tbev-logo">{v.topLogoEl}</span>
                  <div style={S('min-width:0')}><div className="tbrand">{v.eventName}</div><div className="tbperiod">{v.eventPeriod}</div></div>
                </div>
                <div className="fx ac gap12">
                  {v.isWef && (<div className="cdmini"><span className="cdmn">{v.cdDays}</span><span className="cdml">{t.daysToWef}</span></div>)}
                  <div className="lang"><button className={'lbtn ' + v.enCls} onClick={v.setEn}>EN</button><button className={'lbtn ' + v.arCls} onClick={v.setAr}>العربية</button></div>
                  <button className={'adminbtn ' + v.adminLive} onClick={v.adminClick}><span className={v.adminIconCls}></span>{v.adminBtnLabel}</button>
                </div>
              </header>

              {v.toast && (<div className="toast"><span className="pulse"></span>{v.toast}</div>)}

              {v.showLogin && (
                <div className="ovl" onClick={v.closeLogin}><div className="modal" onClick={v.stop}>
                  <div className="fx jb" style={S('align-items:flex-start')}><div className="lockcircle">🔒</div><button className="mclose" onClick={v.closeLogin}>×</button></div>
                  <h2 className="mtitle">{t.adminTitle}</h2><p className="psub" style={S('margin-top:6px')}>{t.adminSub}</p>
                  <form onSubmit={v.doLogin}><div className="field mt16"><label className="flab">{t.password}</label><input className="inp" name="pwd" type="password" placeholder="••••" autoFocus /></div>
                    {v.loginErr && (<div className="err">{v.loginErr}</div>)}
                    <div className="fx gap8 mt16"><button className="btn" type="submit" style={S('flex:1')}>{t.signIn}</button><button className="btn ghost" type="button" onClick={v.closeLogin}>{t.cancel}</button></div></form>
                </div></div>
              )}

              {v.editModal && (
                <div className="ovl" onClick={v.closeEdit}><div className="modal wide" onClick={v.stop}>
                  <div className="fx jb" style={S('align-items:flex-start')}><h2 className="mtitle">{t.editTitle}: {v.editModal.n}</h2><button className="mclose" onClick={v.closeEdit}>×</button></div>
                  <form onSubmit={v.saveEdit}><div className="fgrid mt16">
                    <div className="field"><label className="flab">{t.lead}</label><input className="inp" name="o" defaultValue={v.editModal.o} /></div>
                    <div className="field"><label className="flab">{t.fProg}</label><input className="inp" name="p" type="number" min="0" max="100" defaultValue={v.editModal.p} /></div>
                    <div className="field"><label className="flab">{t.fStatus}</label><select className="sel inp" name="s" defaultValue={v.editModal.s}>{v.editStatusOpts.map((o) => (<option key={o.v} value={o.v}>{o.t}</option>))}</select></div>
                    <div className="field"><label className="flab">{t.due}</label><input className="inp" name="d" defaultValue={v.editModal.d} /></div>
                  </div>
                  <div className="field mt16"><label className="flab">{t.ach}</label><textarea className="inp ta" name="a" defaultValue={v.editModal.a}></textarea></div>
                  <div className="fgrid mt16"><div className="field"><label className="flab">{t.blk}</label><textarea className="inp ta" name="b" defaultValue={v.editModal.b}></textarea></div>
                  <div className="field"><label className="flab">{t.nxt}</label><textarea className="inp ta" name="x" defaultValue={v.editModal.x}></textarea></div></div>
                  <div className="fx gap8 mt24" style={S('justify-content:flex-end')}><button className="btn ghost" type="button" onClick={v.closeEdit}>{t.cancel}</button><button className="btn" type="submit">{t.saveChanges}</button></div>
                  </form></div></div>
              )}

              {v.detailModal && (
                <div className="ovl" onClick={v.closeDetail}><div className="modal det2" onClick={v.stop}>
                  <button className="mclose det2x" onClick={v.closeDetail}>×</button>
                  <div className="det2head">
                    <div><div className="detname">{v.detailModal.n}</div><div className="fx ac gap10 mt8"><span className={'pill ' + v.detailModal.pill}><span className="dot"></span>{v.detailModal.sl}</span><span className="mut fs12">{t.updated} {v.detailModal.u}</span></div></div>
                    <div className="det2leads">
                      <div className="det2lead"><div className={'det2av ' + v.detailModal.leadPhoto.cls} style={S(v.detailModal.leadPhoto.style)} onClick={v.detailModal.leadPhoto.pick}>{v.detailModal.leadPhoto.init}</div><div><div className="det2ln">{v.detailModal.o}</div><div className="det2lr">{t.teamLead}</div></div></div>
                      <div className="det2lead"><div className="det2av">{v.detailModal.depInit}</div><div><div className="det2ln">{v.detailModal.dep}</div><div className="det2lr">{t.deputy}</div></div></div>
                    </div>
                  </div>
                  <div className="det2sec"><div className="det2lab">{t.orgTitle}</div>
                    <div className="det2force">{v.detailModal.force.map((p, i) => (<div key={i} className="det2person"><div className={'det2pav ' + p.cls} style={S(p.style)} onClick={p.pick}>{p.init}</div><div className="det2pn">{p.n}</div><div className="det2pr">{p.role}</div></div>))}</div>
                  </div>
                  <div className="detgrid">
                    <div className="detsec"><div className="detlab">{t.detUpdates}</div><div className="detval">{v.detailModal.a}</div></div>
                    <div className="detsec"><div className="detlab">{t.detChallenges}</div><div className="detval">{v.detailModal.b}</div></div>
                    <div className="detsec"><div className="detlab">{t.detApprovals}</div><div className="detval">{v.detailModal.ap}</div></div>
                    <div className="detsec"><div className="detlab">{t.detNext}</div><div className="detval">{v.detailModal.x}</div></div>
                  </div>
                  <div className="det2prog"><span className="eyebrow">{t.fProg}</span><div className="detbar"><span style={S('width:' + v.detailModal.p + '%')}></span></div><span className="fw7">{v.detailModal.p}%</span><span className="due" style={S('margin-inline-start:auto')}>{t.due} {v.detailModal.d}</span></div>
                  <div className="det2sec"><div className="det2lab">{t.opTracker}</div>
                    <div className="tl"><div className="tlline"></div>{v.detailModal.tracker.map((tk, i) => (<div key={i} className="tlitem tkitem"><span className={'tldot ' + tk.dotCls}></span><div className="tltitle">{tk.t}</div></div>))}</div>
                  </div>
                  <div className="det2foot"><button className="btn ghost" onClick={v.closeDetail}>{t.close}</button>{v.admin && (<button className="btn ghost" onClick={v.detailModal.edit}>{t.edit}</button>)}<button className="btn" onClick={v.detailModal.goUpdate}>{t.submitBtn}</button></div>
                </div></div>
              )}

              {v.actionModal && (
                <div className="ovl" onClick={v.closeAction}><div className="modal" onClick={v.stop}>
                  <div className="fx jb" style={S('align-items:flex-start;gap:14px')}><h2 className="mtitle" style={S('flex:1')}>{v.actionModal.t}</h2><button className="mclose" onClick={v.closeAction}>×</button></div>
                  <div className="fx ac gap10 mt8"><span className={'pill ' + v.actionModal.pill}><span className="dot"></span>{v.actionModal.sl}</span><span className={'prtag ' + v.actionModal.prCls}>{v.actionModal.pr}</span></div>
                  <div className="amgrid">
                    <div><div className="rlab">{t.owner}</div><div className="rtxt">{v.actionModal.o}</div></div>
                    <div><div className="rlab">{t.dueDate}</div><div className="due" style={S('margin-top:6px')}>{v.actionModal.d}</div></div>
                    <div className="amspan"><div className="rlab">{t.detUpdates}</div><div className="rtxt">{v.actionModal.up}</div></div>
                    <div className="amspan"><div className="rlab">{t.detChallenges}</div><div className="rtxt">{v.actionModal.ch}</div></div>
                    <div><div className="rlab">{t.thDependency}</div><div className="rtxt">{v.actionModal.dep}</div></div>
                    <div><div className="rlab">{t.thNext}</div><div className="rtxt">{v.actionModal.nx}</div></div>
                  </div>
                  <div className="det2foot"><button className="btn" onClick={v.closeAction}>{t.close}</button></div>
                </div></div>
              )}

              {v.agendaModal && (
                <div className="ovl" onClick={v.closeAgenda}><div className="modal" onClick={v.stop}>
                  <div className="fx jb" style={S('align-items:flex-start;gap:14px')}><h2 className="mtitle" style={S('flex:1')}>{v.agendaModal.t}</h2><button className="mclose" onClick={v.closeAgenda}>×</button></div>
                  <div className="amgrid">
                    <div><div className="rlab">{t.dateL}</div><div className="rtxt">{v.agendaModal.date}</div></div>
                    <div><div className="rlab">{t.timeL}</div><div className="due" style={S('margin-top:6px')}>{v.agendaModal.time}</div></div>
                    <div><div className="rlab">{t.locationL}</div><div className="rtxt">{v.agendaModal.loc}</div></div>
                    <div><div className="rlab">{t.teamOwner}</div><div className="rtxt">{v.agendaModal.team}</div></div>
                    <div className="amspan"><div className="rlab">{t.notesL}</div><div className="rtxt">{v.agendaModal.notes}</div></div>
                  </div>
                  <div className="det2foot" style={S('justify-content:space-between')}><button className="btn ghost" onClick={v.agendaModal.addToCal}>{t.addToCalL}</button><button className="btn" onClick={v.closeAgenda}>{t.close}</button></div>
                </div></div>
              )}

              {v.shareModal && (
                <div className="ovl" onClick={v.closeShare}><div className="modal sharemodal" onClick={v.stop}>
                  <div className="fx jb" style={S('align-items:flex-start;gap:14px')}><h2 className="mtitle">{t.shareCommentTitle}</h2><button className="mclose" onClick={v.closeShare}>×</button></div>
                  <div className="sharecard">
                    <div className="fx jb ac gap8" style={S('margin-bottom:10px')}><span className="eyebrow">{t.sharePreviewL}</span><span className={'pill ' + v.shareModal.pill}><span className="dot"></span>{v.shareModal.sl}</span></div>
                    <div className="sharerows">{v.shareModal.rows.map((r, i) => (<div key={i} className="sharerow"><span className="sharek">{r.k}</span><span className="sharev">{r.v}</span></div>))}</div>
                  </div>
                  <label className="flab mt16">{t.shareCommentL}</label>
                  <textarea className="inp sharetext" rows={3} placeholder={t.shareCommentPh} value={v.shareModal.comment} onChange={v.setShareComment}></textarea>
                  <label className="flab mt16">{t.shareMsgPreviewL}</label>
                  <pre className="sharepreview">{v.shareModal.msg}</pre>
                  <div className="shareactions">
                    <button className="btn" onClick={v.shareModal.copy}>{t.copyMsgL}</button>
                    <a className="btn ghost" href={v.shareModal.wa} target="_blank" rel="noopener">{t.shareWhatsappL}</a>
                    <a className="btn ghost" href={v.shareModal.mail}>{t.shareEmailL}</a>
                    <button className="btn ghost" onClick={v.closeShare}>{t.cancel}</button>
                  </div>
                </div></div>
              )}

              {v.commentModal && (
                <div className="ovl" onClick={v.closeComment}><div className="modal commentmodal" onClick={v.stop}>
                  <div className="fx jb" style={S('align-items:flex-start;gap:14px')}><h2 className="mtitle" style={S('flex:1')}>{t.shareCommentTitle}</h2><button className="mclose" onClick={v.closeComment}>×</button></div>
                  <div className="cmt-ev">{v.commentModal.eventName}</div>
                  <div className="cmt-team">{v.commentModal.teamName}</div>
                  {v.commentModal.hasItems && (<>
                    <label className="flab mt16">{t.commentingOnL}</label>
                    <div className="cmt-on">{v.commentModal.items.map((it, i) => (<div key={i} className="cmt-on-row"><span className="cmt-on-dot"></span><span>{it}</span></div>))}</div>
                  </>)}
                  <label className="flab mt16">{t.yourCommentL}</label>
                  <textarea className="inp sharetext" rows={3} placeholder={t.yourCommentPh} value={v.commentModal.comment} onChange={v.setCommentText}></textarea>
                  <div className="shareactions">
                    <button className="btn ghost" onClick={v.closeComment}>{t.cancel}</button>
                    <a className="btn btn-wa" href={v.commentModal.wa} target="_blank" rel="noopener">{t.sendWhatsappL}</a>
                  </div>
                </div></div>
              )}

              {v.deptEditModal && (
                <div className="ovl" onClick={v.closeDeptEdit}><div className="modal wide" onClick={v.stop}>
                  <div className="fx jb" style={S('align-items:flex-start')}><h2 className="mtitle">{t.edit}: {v.deptEditModal.n}</h2><button className="mclose" onClick={v.closeDeptEdit}>×</button></div>
                  <form onSubmit={v.saveDeptEdit}>
                    <div className="fgrid mt16">
                      <div className="field"><label className="flab">{t.orgTitle}</label><input className="inp" name="n" defaultValue={v.deptEditModal.n} /></div>
                      <div className="field"><label className="flab">{t.fStatus}</label><select className="sel inp" name="s" defaultValue={v.deptEditModal.s}>{v.deptEditModal.statusOpts.map((o) => (<option key={o.v} value={o.v}>{o.t}</option>))}</select></div>
                      <div className="field"><label className="flab">{t.lead}</label><input className="inp" name="leadN" defaultValue={v.deptEditModal.leadN} /></div>
                      <div className="field"><label className="flab">{t.lead} — {t.roleLabel}</label><input className="inp" name="leadT" defaultValue={v.deptEditModal.leadT} /></div>
                      <div className="field"><label className="flab">{t.deputy}</label><input className="inp" name="depN" defaultValue={v.deptEditModal.depN} /></div>
                      <div className="field"><label className="flab">{t.deputy} — {t.roleLabel}</label><input className="inp" name="depT" defaultValue={v.deptEditModal.depT} /></div>
                      <div className="field"><label className="flab">{t.updated}</label><input className="inp" name="u" defaultValue={v.deptEditModal.u} /></div>
                    </div>
                    <div className="field mt16"><label className="flab">{t.detUpdates}</label><textarea className="inp ta" name="upd" defaultValue={v.deptEditModal.updText}></textarea></div>
                    <div className="field mt16"><label className="flab">{t.detChallenges}</label><textarea className="inp ta" name="chal" defaultValue={v.deptEditModal.chalText}></textarea></div>
                    <div className="fgrid mt16">
                      <div className="field"><label className="flab">{t.apprItem}</label><input className="inp" name="apprItem" defaultValue={v.deptEditModal.apprItem} /></div>
                      <div className="field"><label className="flab">{t.reqDec}</label><input className="inp" name="apprDec" defaultValue={v.deptEditModal.apprDec} /></div>
                      <div className="field"><label className="flab">{t.owner}</label><input className="inp" name="apprOwner" defaultValue={v.deptEditModal.apprOwner} /></div>
                      <div className="field"><label className="flab">{t.dueDate}</label><input className="inp" name="apprDue" defaultValue={v.deptEditModal.apprDue} /></div>
                      <div className="field"><label className="flab">{t.recAction}</label><input className="inp" name="nextAction" defaultValue={v.deptEditModal.nextAction} /></div>
                      <div className="field"><label className="flab">{t.responsible}</label><input className="inp" name="nextWho" defaultValue={v.deptEditModal.nextWho} /></div>
                    </div>
                    <div className="field mt16" style={S('max-width:220px')}><label className="flab">{t.detNext} — {t.dueDate}</label><input className="inp" name="nextDue" defaultValue={v.deptEditModal.nextDue} /></div>
                    <div className="fx gap8 mt24" style={S('justify-content:flex-end')}><button className="btn ghost" type="button" onClick={v.closeDeptEdit}>{t.cancel}</button><button className="btn" type="submit">{t.saveChanges}</button></div>
                  </form></div></div>
              )}

              {v.admin && (<div className="editflag"><span className="adot2"></span>{t.adminMode}</div>)}

              {v.showAddTeam && (
                <div className="ovl" onClick={v.closeAddTeam}><div className="modal" onClick={v.stop}>
                  <div className="fx jb" style={S('align-items:flex-start;gap:14px')}><h2 className="mtitle">{t.addTeamL}</h2><button className="mclose" onClick={v.closeAddTeam}>×</button></div>
                  <form onSubmit={v.createTeam}>
                    <div className="fgrid mt16"><div className="field"><label className="flab">{t.teamNameL}</label><input className="inp" name="en" list="streamlines" autoFocus /></div><div className="field"><label className="flab">{t.teamNameArL}</label><input className="inp" name="ar" dir="rtl" /></div></div>
                    <datalist id="streamlines">{v.streamlineOpts.map((o, i) => (<option key={i} value={o.t}></option>))}</datalist>
                    <div className="fgrid mt16"><div className="field"><label className="flab">{t.lead}</label><input className="inp" name="lead" /></div><div className="field"><label className="flab">{t.deputy}</label><input className="inp" name="dep" /></div></div>
                    <div className="fgrid mt16"><div className="field"><label className="flab">{t.fStatus}</label><select className="sel inp" name="status">{v.statusFormOpts.map((o) => (<option key={o.v} value={o.v}>{o.t}</option>))}</select></div><div className="field"><label className="flab">{t.fProg}</label><input className="inp" name="p" type="number" min="0" max="100" placeholder="0–100" /></div></div>
                    <div className="fgrid mt16"><div className="field"><label className="flab">{t.nextDue}</label><input className="inp" name="due" /></div><div className="field"><label className="flab">{t.updated}</label><input className="inp" name="u" /></div></div>
                    <div className="fx gap8 mt24" style={S('justify-content:flex-end')}><button className="btn ghost" type="button" onClick={v.closeAddTeam}>{t.cancel}</button><button className="btn" type="submit">{t.addTeamL}</button></div>
                  </form></div></div>
              )}

              {/* ===== OPERATIONAL TRACKER (dash) ===== */}
              {v.isDash && (<>
                {v.noTeamView && (
                  <main className="pg wrap" data-screen-label="Operational Tracker">
                    <div className="phead"><div><h1 className="ptitle">{t.dashTitle}</h1><p className="psub">{t.dashSub}</p></div>
                      <div className="fx ac gap10 wrap">{v.admin && (<span className="pill pg-g"><span className="dot"></span>{t.editEnabled}</span>)}{v.blankAdmin && (<><button className="btn ghost" onClick={v.importTeams}>{t.importL}</button><button className="btn" onClick={v.openAddTeam}>{t.addTeamL}</button></>)}</div><button className="btn" onClick={v.openGuide}>{t.genGuide}</button></div>
                    {v.hasCustomTeams && (<div className="deptgrid">{v.customTeams.map((tm) => (
                      <div key={tm.id} className={'deptcard ' + tm.tcCls}>
                        <div className="fx jb ac gap8"><div className="deptname">{tm.n}</div><div className="fx ac gap8">{v.admin && (<button className="editbtn" onClick={tm.remove}>{t.removeL}</button>)}<span className={'pill ' + tm.pill}><span className="dot"></span>{tm.sl}</span></div></div>
                        <div className="deptleads"><div className="deptp"><div className="leadav">{tm.leadInit}</div><div className="deptpinfo"><div className="leadname">{tm.leadN}</div><div className="deptrole">{t.teamLead}</div></div></div><div className="deptp"><div className="leadav dep">{tm.depInit}</div><div className="deptpinfo"><div className="leadname">{tm.depN}</div><div className="deptrole">{t.deputy}</div></div></div></div>
                        <div className="tcfoot2"><div className="tcprog"><div className="tcbar"><span style={S('width:' + tm.p + '%;background:' + tm.col)}></span></div><span className="tcpct">{tm.p}%</span></div></div>
                        <div className="opcardfoot"><span className="mut fs12">{t.updated} {tm.u}</span></div>
                      </div>
                    ))}</div>)}
                    <div className="deptgrid">{v.depts.map((tm) => (
                      <div key={tm.id} className={'deptcard ' + tm.tcCls} onClick={tm.open}>
                        <div className="fx jb ac gap8"><div className="deptname">{tm.n}</div><span className={'pill ' + tm.pill}><span className="dot"></span>{tm.sl}</span></div>
                        <div className="deptleads">
                          <div className="deptp"><div className={'leadav ' + tm.leadPhoto.cls} style={S(tm.leadPhoto.style)}>{tm.leadPhoto.init}</div><div className="deptpinfo"><div className="leadname">{tm.leadN}</div><div className="deptrole">{t.teamLead}</div></div></div>
                          <div className="deptp"><div className={'leadav dep ' + tm.depPhoto.cls} style={S(tm.depPhoto.style)}>{tm.depPhoto.init}</div><div className="deptpinfo"><div className="leadname">{tm.depN}</div><div className="deptrole">{t.deputy}</div></div></div>
                        </div>
                        <div className="tcfoot2"><div className="tcprog"><div className="tcbar"><span style={S('width:' + tm.p + '%;background:' + tm.col)}></span></div><span className="tcpct">{tm.p}%</span></div></div>
                        <div className="opcardfoot"><span className="opitems">{tm.openCount} {t.openItems}</span><span className="mut fs12">{t.updated} {tm.u}</span></div>
                      </div>
                    ))}</div>
                    {v.showZero && (<div className="zero"><div className="zero-ic">▤</div><div className="zero-t">{t.emptyOps}</div><div className="zero-s">{t.zeroSub}</div>{v.admin && (<div className="zero-actions"><button className="btn" onClick={v.openAddTeam}>{t.addTeamL}</button><button className="btn ghost" onClick={v.importTeams}>{t.importL}</button></div>)}{v.notAdmin && (<div className="zero-locked">{t.zeroLocked}</div>)}</div>)}
                  </main>
                )}
                {v.teamView && (
                  <main className="pg wrap" data-screen-label="Team Detail">
                    <button className="backbtn" onClick={v.closeTeam}>{t.backToTracker}</button>
                    <div className={'card tvhead ' + v.teamView.tcCls}>
                      <div className="tvhead-l">
                        <div className="detname">{v.teamView.n}</div>
                        <div className="fx ac gap10 mt8"><span className={'pill ' + v.teamView.pill}><span className="dot"></span>{v.teamView.sl}</span><span className="mut fs12">{t.updated} {v.teamView.u}</span><button className={v.teamView.commentBtnCls} title={v.teamView.commentTip} onClick={v.teamView.comment}><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.6"></circle><circle cx="6" cy="12" r="2.6"></circle><circle cx="18" cy="19" r="2.6"></circle><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3"></path></svg>{t.commentL}</button></div>
                      </div>
                      <div className="det2leads">
                        <div className="det2lead"><div className={'det2av ' + v.teamView.leadPhoto.cls} style={S(v.teamView.leadPhoto.style)} onClick={v.teamView.leadPhoto.pick}>{v.teamView.leadPhoto.init}</div><div><div className="det2ln">{v.teamView.leadN}</div><div className="det2lr">{t.teamLead}</div></div></div>
                        <div className="det2lead"><div className={'det2av ' + v.teamView.depPhoto.cls} style={S(v.teamView.depPhoto.style)} onClick={v.teamView.depPhoto.pick}>{v.teamView.depPhoto.init}</div><div><div className="det2ln">{v.teamView.depN}</div><div className="det2lr">{t.deputy}</div></div></div>
                      </div>
                    </div>
                    <div className={v.teamView.wfCardCls}><div className="det2lab selhead"><button className={v.teamView.wfCircleCls} onClick={v.teamView.wfToggle}></button><span>{t.orgTitle}</span></div>
                      <div className="det2force">{v.teamView.wf.map((p, i) => (<div key={i} className="det2person"><div className={'det2pav ' + p.cls} style={S(p.style)} onClick={p.pick}>{p.init}</div><div className="det2pn">{p.n}</div><div className="det2pr">{p.role}</div></div>))}</div>
                    </div>
                    <div className="opblocks mt14">
                      <div className="card opblock"><div className="detlab">{t.detUpdates}</div>{v.teamView.updItems.map((u, i) => (<div key={i} className={u.rowCls}><button className={u.circleCls} onClick={u.toggle}></button><span>{u.text}</span></div>))}</div>
                      <div className="card opblock"><div className="detlab detlab-a">{t.detChallenges}</div>{v.teamView.chalItems.map((c, i) => (<div key={i} className={c.rowCls}><button className={c.circleCls + ' circle-a'} onClick={c.toggle}></button><span>{c.text}</span></div>))}</div>
                      <div className="card opblock"><div className="detlab">{t.detApprovals}</div><div className="opbul"><span className="bd"></span><span><strong>{v.teamView.apprItem}</strong> — {v.teamView.apprDec}</span></div><div className="opmeta2">{t.owner}: {v.teamView.apprOwner} · {t.due} {v.teamView.apprDue}</div></div>
                      <div className="card opblock"><div className="detlab">{t.detNext}</div><div className="opbul"><span className="bd"></span><span>{v.teamView.nextAction}</span></div><div className="opmeta2">{v.teamView.nextWho} · {t.due} {v.teamView.nextDue}</div></div>
                    </div>
                    <div className="card mt14 tvprog">
                      <div className="tvprog-l"><div className="eyebrow">{t.fProg}</div><div className="det2prog2"><div className="detbar"><span style={S('width:' + v.teamView.p + '%')}></span></div><span className="fw7">{v.teamView.p}%</span></div></div>
                      <div className="tvprog-r">
                        <div className="tvchip"><div className="eyebrow">{t.fStatus}</div><span className={'pill ' + v.teamView.pill}><span className="dot"></span>{v.teamView.sl}</span></div>
                        <div className="tvchip"><div className="eyebrow">{t.nextDue}</div><div className="due">{v.teamView.due}</div></div>
                        {v.teamView.delay && (<div className="tvchip"><div className="eyebrow">{t.delayL}</div><span className="pill pg-r"><span className="dot"></span>{t.delayFlag}</span></div>)}
                      </div>
                    </div>
                    {v.teamView.isBudget && (
                      <div className="card mt14"><div className="det2lab">{t.budgetTitle}</div>
                        {v.admin && (<div className="budgrid">{v.teamView.budgetRows.map((b, i) => (<div key={i} className="budrow"><span>{b.lab}</span><span className="due">{b.val}</span></div>))}</div>)}
                        {v.notAdmin && (<div className="lockedbudget"><span className="lockedbudget-ic">🔒</span>{t.budgetLocked}</div>)}
                      </div>
                    )}
                    <div className="card mt14"><div className="det2lab">{t.opTracker}</div>
                      <div className="optable">
                        <div className="opthead"><span>{t.thAction}</span><span>{t.owner}</span><span>{t.fStatus}</span><span>{t.thPriority}</span><span>{t.due}</span><span>{t.thNext}</span></div>
                        {v.teamView.actions.map((a, i) => (<div key={i} className="optrow" onClick={a.open}><span className="fw6">{a.t}</span><span>{a.o}</span><span className={'pill ' + a.pill}><span className="dot"></span>{a.sl}</span><span className={'prtag ' + a.prCls}>{a.pr}</span><span className="due">{a.d}</span><span>{a.nx}</span></div>))}
                      </div>
                    </div>
                  </main>
                )}
              </>)}

              {/* ===== TIMELINE ===== */}
              {v.isTimeline && (
                <main className="pg wrap" data-screen-label="Event Timeline">
                  <div className="phead"><div><h1 className="ptitle">{t.tlTitle}</h1><p className="psub">{t.tlSub}</p></div><div className="fx ac gap10 wrap">{v.isWef && (<div className="cdbox" style={S('border-color:var(--line);background:#fff')}><span className="cdn" style={S('color:var(--ink)')}>{v.cdDays}</span><span className="cdl" style={S('color:var(--mut)')}>{t.daysToWef}</span></div>)}{v.hasTimeline && (<button className="btn" onClick={v.doPrint}>{t.exportTimeline}</button>)}</div></div>
                  <div className="agenda">{v.eventDays.map((d, di) => (
                    <div key={di} className="agrow">
                      <div className="agdate"><div className="agdatebig">{d.date}</div><div className="agday">{d.day}</div></div>
                      <div className="agcard">
                        <div className="agcardhead"><span className="aghicon">{d.iconEl}</span><span className="agtitle">{d.day}</span>{d.hasTag && (<span className="agtagline">{d.tagline}</span>)}</div>
                        {d.hasBlocks && (<div className="agblocks">{d.blocks.map((b, bi) => (<div key={bi} className="agblock" onClick={b.open}><div className="agtime">{b.time}</div><div className="agbrow"><span className="agbicon">{b.iconEl}</span><div><div className="agbt">{b.t}</div>{b.hasSub && (<div className="agbsub">{b.sub}</div>)}</div></div></div>))}</div>)}
                        {d.desc && (<div className="agdesc">{d.desc}</div>)}
                      </div>
                    </div>
                  ))}</div>
                  {v.emptyTimeline && (<div className="blankstate"><div className="blankstate-ic">◷</div><div className="blankstate-t">{t.emptyTimelineL}</div></div>)}
                </main>
              )}

              {/* ===== SUBMIT UPDATE ===== */}
              {v.isSubmit && (
                <main className="pg wrap" data-screen-label="Updates Submission" style={S('max-width:960px')}>
                  <div className="phead"><div><h1 className="ptitle">{t.sTitle}</h1><p className="psub">{t.sSub}</p></div></div>
                  {v.submitWs && (<div className="prefill"><span className="pdot"></span><span>{t.prefillFor} <strong>{v.submitWs}</strong></span></div>)}
                  <form className="card" style={S('padding:28px 32px')} onSubmit={v.submitUpdate}>
                    <div className="fgrid">
                      <div className="field"><label className="flab">{t.fWs}</label><select className="sel inp" name="ws" defaultValue={v.submitWs || ''}>{v.wsOptions.map((o, i) => (<option key={i} value={o.v}>{o.t}</option>))}</select></div>
                      <div className="field"><label className="flab">{t.fLead}</label><input className="inp" name="lead" placeholder={t.phLead} /></div>
                      <div className="field"><label className="flab">{t.fProg}</label><input className="inp" name="progress" type="number" min="0" max="100" placeholder="0–100" /></div>
                      <div className="field"><label className="flab">{t.fStatus}</label><select className="sel inp" name="status">{v.statusOpts.map((o, i) => (<option key={i}>{o.t}</option>))}</select></div>
                    </div>
                    <div className="field mt16"><label className="flab">{t.fAch}</label><textarea className="inp ta" name="ach" placeholder={t.phAch}></textarea></div>
                    <div className="fgrid mt16">
                      <div className="field"><label className="flab">{t.fBlk}</label><textarea className="inp ta" name="blockers"></textarea></div>
                      <div className="field"><label className="flab">{t.fRisks}</label><textarea className="inp ta" name="risks"></textarea></div>
                      <div className="field"><label className="flab">{t.fBudget}</label><textarea className="inp ta" name="budget"></textarea></div>
                      <div className="field"><label className="flab">{t.fAppr}</label><textarea className="inp ta" name="approvals"></textarea></div>
                      <div className="field"><label className="flab">{t.fNext}</label><textarea className="inp ta" name="next"></textarea></div>
                      <div className="field"><label className="flab">{t.fSupport}</label><textarea className="inp ta" name="support"></textarea></div>
                    </div>
                    <div className="fgrid mt16">
                      <div className="field"><label className="flab">{t.fNotes}</label><input className="inp" name="notes" placeholder={t.phNotes} /></div>
                      <div className="field"><label className="flab">{t.fDate}</label><input className="inp" name="date" type="date" defaultValue="2026-07-02" /></div>
                    </div>
                    <div className="fx jb ac mt24"><span className="mut" style={S('font-size:12px')}>{t.submitNote}</span><button className="btn" type="submit">{t.submitBtn}</button></div>
                  </form>
                </main>
              )}

              {/* ===== SETTINGS ===== */}
              {v.isSettings && (
                <main className="pg wrap" data-screen-label="Settings">
                  <div className="phead"><div><h1 className="ptitle">{t.setTitle}</h1><p className="psub">{t.setSub}</p></div></div>
                  <div className="setgrid">
                    <div className="card"><div className="eyebrow">{t.setLang}</div><div className="lang lang-lg mt14"><button className={'lbtn ' + v.enCls} onClick={v.setEn}>English</button><button className={'lbtn ' + v.arCls} onClick={v.setAr}>العربية</button></div></div>
                    <div className="card"><div className="eyebrow">{t.setAccess}</div><p className="setp">{t.setAccessTxt}</p><button className={'btn ' + v.adminBtnCls} onClick={v.adminClick}><span className={v.adminIconCls}></span>{v.adminBtnLabel}</button></div>
                    <div className="card"><div className="eyebrow">{t.setDensity}</div><p className="setp">{t.setThemeTxt}</p><div className="lang lang-lg mt14"><button className={'lbtn ' + v.densComfortCls} onClick={v.toggleDensity}>{t.densComfort}</button><button className={'lbtn ' + v.densCompactCls} onClick={v.toggleDensity}>{t.densCompact}</button></div></div>
                    <div className="card"><div className="eyebrow">{t.setData}</div><p className="setp">{t.setDataTxt}</p><button className="btn ghost" onClick={v.resetData}>{t.setReset}</button></div>
                  </div>
                </main>
              )}

              {/* ===== EXECUTIVE OVERVIEW ===== */}
              {v.isOverview && (
                <main className="pg wrap" data-screen-label="Executive Overview" style={S('position:relative')}>
                  <div className="phead"><div><h1 className="ptitle">{v.eventName}</h1></div></div>
                  {v.isWef && (<>
                    <div className="card hero hero2" style={{ background: 'linear-gradient(135deg, #3165AB, #00142E)' }}>
                      <div><div className="eyebrow">{t.readiness}</div><div className="heronum">56%</div><div className="herobar"><div className="herofill" style={S('width:56%')}></div></div></div>
                      <div className="herocd"><div className="eyebrow">{t.cdTitle}</div><div className="cdbox cdbox-hero"><span className="cdn">{v.cdDays}</span><span className="cdl">{t.days}</span><span className="cdsep">·</span><span className="cdn">{v.cdHrs}</span><span className="cdl">{t.hrs}</span><span className="cdsep">·</span><span className="cdn">{v.cdMin}</span><span className="cdl">{t.min}</span><span className="cdsep">·</span><span className="cdn">{v.cdSec}</span><span className="cdl">{t.sec}</span></div><p className="heroP" style={S('font-size:12px')}>{t.cdEvt2}</p></div>
                    </div>
                    <div className="snap mt16">
                      <div className="snaphead"><div className="eyebrow">{t.progStatus}</div><span className="snapct">{t.wsCount}</span></div>
                      <div className="statusbar"><div className="seg seg-g" style={S('flex:7')}></div><div className="seg seg-a" style={S('flex:9')}></div><div className="seg seg-r" style={S('flex:2')}></div></div>
                      <div className="statuslegend"><span className="lgi"><span className="lgd" style={S('background:var(--g)')}></span>{t.statuses.g}<b>7</b></span><span className="lgi"><span className="lgd" style={S('background:var(--a)')}></span>{t.statuses.a}<b>9</b></span><span className="lgi"><span className="lgd" style={S('background:var(--r)')}></span>{t.statuses.r}<b>2</b></span></div>
                    </div>
                    <div className="kgrid3 mt14">{v.kpis3.map((k, i) => (<div key={i} className="mcard"><div className="mhead"><div className="mlab">{k.lab}</div><div className="micon" style={S('background:' + k.icbg + ';color:' + k.c)}>{k.ic}</div></div><div className="mnum" style={S('color:' + k.c)}>{k.num}</div><div className="msub">{k.sub}</div></div>))}</div>
                  </>)}
                  {v.genOverview && (<>
                    <div className="card hero hero2">
                      <div><div className="eyebrow">{t.ovReadiness}</div><div className="heronum">{v.ovw.readiness}%</div><div className="herobar"><div className="herofill" style={S('width:' + v.ovw.readiness + '%')}></div></div><p className="heroP" style={S('font-size:12px;margin-top:12px')}>{t.ovHeroNote}</p></div>
                      <div className="herocd"><div className="eyebrow">{t.progStatus}</div>
                        <div className="statusbar" style={S('margin-top:12px')}><div className="seg seg-g" style={S('flex:' + v.ovw.segG)}></div><div className="seg seg-a" style={S('flex:' + v.ovw.segA)}></div><div className="seg seg-r" style={S('flex:' + v.ovw.segR)}></div></div>
                        <div className="statuslegend"><span className="lgi"><span className="lgd" style={S('background:var(--g)')}></span>{t.statuses.g}<b>{v.ovw.g}</b></span><span className="lgi"><span className="lgd" style={S('background:var(--a)')}></span>{t.statuses.a}<b>{v.ovw.a}</b></span><span className="lgi"><span className="lgd" style={S('background:var(--r)')}></span>{t.statuses.r}<b>{v.ovw.r}</b></span></div>
                        <p className="heroP" style={S('font-size:11.5px;margin-top:12px')}>{t.ovAgmNote}</p></div>
                    </div>
                    <div className="kgrid3 mt16">{v.ovw.kpis.map((k, i) => (<div key={i} className="mcard"><div className="mhead"><div className="mlab">{k.lab}</div></div><div className="mnum" style={S('color:' + k.col)}>{k.val}</div><div className="msub">{k.sub}</div></div>))}</div>
                    <div className="card mt16"><div className="fx jb ac gap8"><div><div className="eyebrow">{t.ovAttnTitle}</div><p className="psub" style={S('margin:4px 0 0')}>{t.ovAttnSubT}</p></div></div>
                      <div className="ovattn mt14">{v.ovw.attention.map((it, i) => (<div key={i} className={'ovattn-row ' + it.tcCls} onClick={it.open}><div className="ovattn-main"><div className="ovattn-n">{it.n}</div><div className="ovattn-item">{it.item}</div></div><div className="ovattn-meta"><span className={'pill ' + it.pill}><span className="dot"></span>{it.sl}</span><span className="mut fs12">{t.owner}: {it.owner}</span></div></div>))}</div>
                    </div>
                  </>)}
                  {v.emptyTracker && (<div className="blankstate"><div className="blankstate-ic">◔</div><div className="blankstate-t">{t.emptyUpdates}</div><div className="blankstate-s">{t.blankOverviewSub}</div>{v.blankAdmin && (<div style={S('margin-top:18px')}><button className="btn" onClick={v.openAddTeam}>{t.addTeamL}</button></div>)}</div>)}
                </main>
              )}

              <footer className="foot"><span style={S('letter-spacing:.06em;font-weight:600;text-align:center')}>{t.foot3}</span></footer>
            </div>
          </div>
        )}
      </>
    );
  }

}

export default DashboardApp;
