'use strict';

/* ─── HELPERS ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const el = (tag, cls = '', html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const genId = () => 'id_' + Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().split('T')[0];
const fmtDate = d => { if (!d) return '—'; const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); };
const fmtSalary = n => '₱' + Number(n).toLocaleString('en-PH');
const initials = (f, l) => (f?.[0] || '') + (l?.[0] || '');
const calcDays = (s, e) => { const d = Math.floor((new Date(e) - new Date(s)) / 86400000) + 1; return Math.max(0, d); };
const calcHours = (ci, co) => { if (!ci || !co) return '—'; const [h1,m1] = ci.split(':').map(Number); const [h2,m2] = co.split(':').map(Number); const mins = (h2*60+m2) - (h1*60+m1); if (mins <= 0) return '—'; return Math.floor(mins/60) + 'h ' + (mins%60) + 'm'; };

const AV_COLORS = ['av-indigo','av-green','av-amber','av-blue','av-pink','av-purple','av-teal'];
const avColor = id => { const h = [...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0); return AV_COLORS[h % AV_COLORS.length]; };

const STATUS_BADGES = {
  active:   'badge-green', inactive: 'badge-gray',  on_leave: 'badge-blue',
  present:  'badge-green', absent:   'badge-red',   late: 'badge-orange', half_day: 'badge-blue',
  pending:  'badge-amber', approved: 'badge-green', rejected: 'badge-red', cancelled: 'badge-gray',
};
const LEVEL_BADGES = { junior:'badge-gray', mid:'badge-blue', senior:'badge-indigo', lead:'badge-purple', manager:'badge-orange', director:'badge-red' };
const LEAVE_TYPE_BADGES = { annual:'badge-indigo', sick:'badge-orange', maternity:'badge-pink', paternity:'badge-indigo', unpaid:'badge-gray', emergency:'badge-red' };
const LEAVE_TYPE_LABELS = { annual:'Annual', sick:'Sick', maternity:'Maternity', paternity:'Paternity', unpaid:'Unpaid', emergency:'Emergency' };

function badge(label, cls) {
  const dot = cls.replace('badge-','dot-');
  return `<span class="badge ${cls}"><span class="badge-dot ${dot}"></span>${esc(label)}</span>`;
}
function badgePlain(label, cls) {
  return `<span class="badge ${cls}">${esc(label)}</span>`;
}

/* ─── SEED DATA ─── */
const seedDepartments = [
  { id:'d1', name:'Engineering',     description:'Software development and infrastructure', managerId:'e1', createdAt:'2022-01-01' },
  { id:'d2', name:'Human Resources', description:'Recruitment, payroll, and employee relations', managerId:'e4', createdAt:'2022-01-01' },
  { id:'d3', name:'Marketing',       description:'Brand, campaigns, and growth', managerId:'e6', createdAt:'2022-01-01' },
  { id:'d4', name:'Finance',         description:'Accounting, budgeting, and financial planning', managerId:'e8', createdAt:'2022-01-01' },
  { id:'d5', name:'Operations',      description:'Day-to-day business operations and logistics', managerId:null, createdAt:'2022-03-15' },
];
const seedRoles = [
  { id:'r1',  title:'Software Engineer',       departmentId:'d1', level:'mid',      description:'Full-stack development',         createdAt:'2022-01-01' },
  { id:'r2',  title:'Senior Software Engineer',departmentId:'d1', level:'senior',   description:'Senior full-stack development',  createdAt:'2022-01-01' },
  { id:'r3',  title:'Engineering Manager',     departmentId:'d1', level:'manager',  description:'Leads the engineering team',     createdAt:'2022-01-01' },
  { id:'r4',  title:'HR Specialist',           departmentId:'d2', level:'mid',      description:'Handles recruitment and HR ops', createdAt:'2022-01-01' },
  { id:'r5',  title:'HR Manager',              departmentId:'d2', level:'manager',  description:'Leads the HR department',        createdAt:'2022-01-01' },
  { id:'r6',  title:'Marketing Specialist',    departmentId:'d3', level:'mid',      description:'Campaigns and content creation', createdAt:'2022-01-01' },
  { id:'r7',  title:'Marketing Director',      departmentId:'d3', level:'director', description:'Heads the marketing department', createdAt:'2022-01-01' },
  { id:'r8',  title:'Financial Analyst',       departmentId:'d4', level:'mid',      description:'Financial modelling and reporting',createdAt:'2022-01-01' },
  { id:'r9',  title:'Finance Manager',         departmentId:'d4', level:'manager',  description:'Leads the finance department',   createdAt:'2022-01-01' },
  { id:'r10', title:'Operations Coordinator',  departmentId:'d5', level:'junior',   description:'Coordinates daily operations',   createdAt:'2022-03-15' },
];
const seedEmployees = [
  { id:'e1',  firstName:'Alex',   lastName:'Rivera',  email:'alex.rivera@company.com',   phone:'+1 555-001-0001', address:'101 Maple St, Springfield',  departmentId:'d1', roleId:'r3',  managerId:null, status:'active',   employmentType:'full_time', startDate:'2020-03-01', salary:120000, createdAt:'2020-03-01' },
  { id:'e2',  firstName:'Jordan', lastName:'Kim',     email:'jordan.kim@company.com',    phone:'+1 555-001-0002', address:'202 Oak Ave, Springfield',   departmentId:'d1', roleId:'r2',  managerId:'e1', status:'active',   employmentType:'full_time', startDate:'2021-06-14', salary:95000,  createdAt:'2021-06-14' },
  { id:'e3',  firstName:'Sam',    lastName:'Patel',   email:'sam.patel@company.com',     phone:'+1 555-001-0003', address:'303 Pine Rd, Springfield',   departmentId:'d1', roleId:'r1',  managerId:'e1', status:'active',   employmentType:'full_time', startDate:'2022-09-01', salary:75000,  createdAt:'2022-09-01' },
  { id:'e4',  firstName:'Morgan', lastName:'Lee',     email:'morgan.lee@company.com',    phone:'+1 555-002-0001', address:'404 Birch Blvd, Springfield', departmentId:'d2', roleId:'r5',  managerId:null, status:'active',   employmentType:'full_time', startDate:'2020-01-15', salary:90000,  createdAt:'2020-01-15' },
  { id:'e5',  firstName:'Casey',  lastName:'Nguyen',  email:'casey.nguyen@company.com',  phone:'+1 555-002-0002', address:'505 Cedar Ln, Springfield',  departmentId:'d2', roleId:'r4',  managerId:'e4', status:'active',   employmentType:'part_time', startDate:'2023-02-20', salary:48000,  createdAt:'2023-02-20' },
  { id:'e6',  firstName:'Taylor', lastName:'Brooks',  email:'taylor.brooks@company.com', phone:'+1 555-003-0001', address:'606 Elm St, Springfield',    departmentId:'d3', roleId:'r7',  managerId:null, status:'active',   employmentType:'full_time', startDate:'2019-11-01', salary:110000, createdAt:'2019-11-01' },
  { id:'e7',  firstName:'Riley',  lastName:'Torres',  email:'riley.torres@company.com',  phone:'+1 555-003-0002', address:'707 Walnut Way, Springfield', departmentId:'d3', roleId:'r6',  managerId:'e6', status:'on_leave', employmentType:'full_time', startDate:'2022-04-11', salary:68000,  createdAt:'2022-04-11' },
  { id:'e8',  firstName:'Drew',   lastName:'Chen',    email:'drew.chen@company.com',     phone:'+1 555-004-0001', address:'808 Spruce Ct, Springfield',  departmentId:'d4', roleId:'r9',  managerId:null, status:'active',   employmentType:'full_time', startDate:'2021-01-04', salary:105000, createdAt:'2021-01-04' },
  { id:'e9',  firstName:'Quinn',  lastName:'Morales', email:'quinn.morales@company.com', phone:'+1 555-004-0002', address:'909 Hickory Dr, Springfield', departmentId:'d4', roleId:'r8',  managerId:'e8', status:'active',   employmentType:'contract',  startDate:'2023-07-17', salary:72000,  createdAt:'2023-07-17' },
  { id:'e10', firstName:'Blake',  lastName:'Foster',  email:'blake.foster@company.com',  phone:'+1 555-005-0001', address:'1010 Aspen Ave, Springfield', departmentId:'d5', roleId:'r10', managerId:null, status:'inactive', employmentType:'full_time', startDate:'2022-05-23', salary:55000,  createdAt:'2022-05-23' },
];

const offset = (days) => { const d = new Date(); d.setDate(d.getDate()-days); return d.toISOString().split('T')[0]; };
const seedAttendance = [
  { id:'a1',  employeeId:'e1', date:offset(0), clockIn:'08:55', clockOut:null,    status:'present' },
  { id:'a2',  employeeId:'e2', date:offset(0), clockIn:'09:03', clockOut:null,    status:'present' },
  { id:'a3',  employeeId:'e3', date:offset(0), clockIn:'09:32', clockOut:null,    status:'late',   notes:'Traffic delay' },
  { id:'a4',  employeeId:'e4', date:offset(0), clockIn:'08:45', clockOut:null,    status:'present' },
  { id:'a5',  employeeId:'e5', date:offset(0), clockIn:null,    clockOut:null,    status:'absent' },
  { id:'a6',  employeeId:'e6', date:offset(0), clockIn:'08:58', clockOut:null,    status:'present' },
  { id:'a7',  employeeId:'e8', date:offset(0), clockIn:'09:00', clockOut:null,    status:'present' },
  { id:'a8',  employeeId:'e9', date:offset(0), clockIn:'08:50', clockOut:null,    status:'present' },
  { id:'a9',  employeeId:'e1', date:offset(1), clockIn:'08:52', clockOut:'17:05', status:'present' },
  { id:'a10', employeeId:'e2', date:offset(1), clockIn:'09:00', clockOut:'18:00', status:'present' },
  { id:'a11', employeeId:'e3', date:offset(1), clockIn:'09:01', clockOut:'17:30', status:'present' },
  { id:'a12', employeeId:'e4', date:offset(1), clockIn:'08:45', clockOut:'17:00', status:'present' },
  { id:'a13', employeeId:'e5', date:offset(1), clockIn:'09:15', clockOut:'13:00', status:'half_day' },
  { id:'a14', employeeId:'e6', date:offset(1), clockIn:'08:55', clockOut:'17:10', status:'present' },
  { id:'a15', employeeId:'e8', date:offset(1), clockIn:'09:00', clockOut:'17:00', status:'present' },
  { id:'a16', employeeId:'e9', date:offset(1), clockIn:'08:49', clockOut:'17:00', status:'present' },
  { id:'a17', employeeId:'e1', date:offset(2), clockIn:'08:51', clockOut:'17:02', status:'present' },
  { id:'a18', employeeId:'e2', date:offset(2), clockIn:'09:10', clockOut:'18:05', status:'late' },
  { id:'a19', employeeId:'e3', date:offset(2), clockIn:null,    clockOut:null,    status:'absent' },
  { id:'a20', employeeId:'e4', date:offset(2), clockIn:'08:45', clockOut:'17:00', status:'present' },
];
const seedLeaveRequests = [
  { id:'l1', employeeId:'e7', type:'annual',    startDate:offset(-20), endDate:offset(-11), totalDays:10, reason:'Annual vacation',             status:'approved',  reviewedBy:'e6', reviewedAt:offset(-22), reviewNotes:'Approved',        createdAt:offset(-24) },
  { id:'l2', employeeId:'e3', type:'sick',      startDate:offset(-5),  endDate:offset(-5),  totalDays:1,  reason:'Flu symptoms',                status:'approved',  reviewedBy:'e1', reviewedAt:offset(-5),  reviewNotes:null,              createdAt:offset(-5)  },
  { id:'l3', employeeId:'e5', type:'annual',    startDate:offset(-2),  endDate:offset(0),   totalDays:3,  reason:'Personal errands',            status:'pending',   reviewedBy:null, reviewedAt:null,        reviewNotes:null,              createdAt:offset(-3)  },
  { id:'l4', employeeId:'e9', type:'emergency', startDate:offset(-1),  endDate:offset(0),   totalDays:2,  reason:'Family emergency',            status:'pending',   reviewedBy:null, reviewedAt:null,        reviewNotes:null,              createdAt:offset(-1)  },
  { id:'l5', employeeId:'e2', type:'annual',    startDate:offset(7),   endDate:offset(11),  totalDays:5,  reason:'Annual leave',                status:'rejected',  reviewedBy:'e1', reviewedAt:offset(-1),  reviewNotes:'Overlaps sprint', createdAt:offset(-3)  },
];
const seedUsers = [
  { id:'u1', email:'admin@company.com',       password:'Admin@123', role:'admin',    employeeId:null, firstName:'Admin',  lastName:'User',   createdAt:'2022-01-01' },
  { id:'u2', email:'alex.rivera@company.com', password:'Alex@123',  role:'employee', employeeId:'e1', firstName:'Alex',   lastName:'Rivera', createdAt:'2022-01-01' },
  { id:'u3', email:'jordan.kim@company.com',  password:'Jordan@123',role:'employee', employeeId:'e2', firstName:'Jordan', lastName:'Kim',    createdAt:'2022-01-01' },
];

/* ─── STATE ─── */
const State = {
  employees:    JSON.parse(JSON.stringify(seedEmployees)),
  departments:  JSON.parse(JSON.stringify(seedDepartments)),
  roles:        JSON.parse(JSON.stringify(seedRoles)),
  attendance:   JSON.parse(JSON.stringify(seedAttendance)),
  leaveRequests:JSON.parse(JSON.stringify(seedLeaveRequests)),
  users:        JSON.parse(JSON.stringify(seedUsers)),
  currentUser:  null,
  activeView:   'dashboard',
};

function getDeptName(id) { return State.departments.find(d=>d.id===id)?.name || '—'; }
function getRoleTitle(id) { return State.roles.find(r=>r.id===id)?.title || '—'; }
function getEmpName(id) { const e = State.employees.find(e=>e.id===id); return e ? e.firstName+' '+e.lastName : '—'; }
function getFullName(e) { return e.firstName + ' ' + e.lastName; }

/* ─── AUTH ─── */
function login(email, password) {
  const u = State.users.find(u=>u.email.toLowerCase()===email.trim().toLowerCase());
  if (!u) return { ok:false, error:'No account found with that email.' };
  if (u.password !== password) return { ok:false, error:'Incorrect password.' };
  State.currentUser = u;
  return { ok:true };
}
function register(data) {
  if (State.users.find(u=>u.email.toLowerCase()===data.email.trim().toLowerCase()))
    return { ok:false, error:'An account with this email already exists.' };
  if (data.password !== data.confirmPassword)
    return { ok:false, error:'Passwords do not match.' };
  if (data.password.length < 6)
    return { ok:false, error:'Password must be at least 6 characters.' };
  const u = { id:genId(), email:data.email.trim().toLowerCase(), password:data.password, role:data.role, employeeId:null, firstName:data.firstName.trim(), lastName:data.lastName.trim(), createdAt:today() };
  State.users.push(u);
  return { ok:true };
}
function logout() { State.currentUser = null; renderApp(); }

/* ─── TOAST ─── */
function toast(msg, type='success') {
  const icons = { success:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>', error:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>', info:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' };
  const t = el('div', `toast ${type}`);
  t.innerHTML = `<span class="toast-icon">${icons[type]||icons.info}</span><span class="toast-text">${esc(msg)}</span><button class="toast-dismiss" aria-label="Dismiss">×</button>`;
  t.querySelector('.toast-dismiss').onclick = () => t.remove();
  $('#toast-container').appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ─── MODAL ─── */
let _confirmCb = null;
function openModal(title, bodyHTML, size='') {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = bodyHTML;
  if (size) $('#modal-box').className = 'modal-box ' + size; else $('#modal-box').className = 'modal-box';
  $('#modal-overlay').style.display = 'flex';
  $('#modal-overlay').focus?.();
}
function closeModal() { $('#modal-overlay').style.display = 'none'; }
function openConfirm(title, message, okLabel, danger, cb) {
  $('#confirm-title').textContent = title;
  $('#confirm-message').textContent = message;
  $('#confirm-ok').textContent = okLabel || 'Confirm';
  $('#confirm-ok').className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
  $('#confirm-overlay').style.display = 'flex';
  _confirmCb = cb;
}
function closeConfirm() { $('#confirm-overlay').style.display = 'none'; _confirmCb = null; }

/* ─── NAVIGATION ─── */
const ADMIN_NAV = [
  { id:'dashboard',   label:'Dashboard',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>' },
  { id:'employees',   label:'Employees',   icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>' },
  { id:'departments', label:'Departments', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>' },
  { id:'roles',       label:'Roles',       icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>' },
  { id:'attendance',  label:'Attendance',  icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
  { id:'leaves',      label:'Leave',       icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', countKey:'pendingLeaves' },
  { id:'accounts',    label:'Accounts',    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>' },
];
const VIEW_LABELS = { dashboard:'Dashboard', employees:'Employees', departments:'Departments', roles:'Roles', attendance:'Attendance', leaves:'Leave Management', profile:'My Profile', accounts:'Accounts' };

function renderNav() {
  const nav = $('#sb-nav');
  nav.innerHTML = '';
  const isAdmin = State.currentUser?.role === 'admin';
  const items = isAdmin ? ADMIN_NAV : [{ id:'profile', label:'My Profile', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M2 20c0-4 4.5-7 10-7s10 3 10 7"/></svg>' }];
  items.forEach(item => {
    const btn = el('button', `sb-item${State.activeView===item.id?' active':''}`, item.icon + `<span>${esc(item.label)}</span>`);
    if (item.countKey) {
      const cnt = item.countKey === 'pendingLeaves' ? State.leaveRequests.filter(l=>l.status==='pending').length : 0;
      if (cnt > 0) btn.innerHTML += `<span class="sb-item-count danger">${cnt}</span>`;
    }
    btn.onclick = () => { State.activeView = item.id; renderNav(); renderView(); closeMobileNav(); };
    nav.appendChild(btn);
  });
}

function renderUserInfo() {
  const u = State.currentUser;
  if (!u) return;
  const av = initials(u.firstName, u.lastName);
  const isAdmin = u.role === 'admin';

  // Sidebar user info (admin only — still in DOM but hidden for employees)
  $('#sb-user-avatar').textContent = av;
  $('#sb-user-name').textContent = u.firstName + ' ' + u.lastName;
  $('#sb-user-role').textContent = isAdmin ? 'Administrator' : 'Employee';
  $('#sb-user-badge').textContent = isAdmin ? 'Admin' : 'Employee';

  // Employee topbar user chip
  const userEl = $('#emp-topbar-user');
  if (userEl) {
    userEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:30px;height:30px;border-radius:50%;background:var(--brand-100);color:var(--brand-700);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${esc(av)}</div>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--gray-900)">${esc(u.firstName)} ${esc(u.lastName)}</div>
          <div style="font-size:10px;color:var(--gray-400);margin-top:1px">Employee</div>
        </div>
      </div>`;
  }

  // Wire employee topbar sign-out button (safe to re-attach)
  const empLogout = $('#emp-btn-logout');
  if (empLogout) {
    const newBtn = empLogout.cloneNode(true); // clone removes old listeners
    empLogout.parentNode.replaceChild(newBtn, empLogout);
    newBtn.addEventListener('click', () => {
      logout();
      _empSearch = ''; _empDept = ''; _empStatus = '';
      _leaveStatus = ''; _leaveType = '';
      _attDate = today(); _attEmpFilter = '';
      _rolesFilter = '';
      _profileTab = 'overview';
    });
  }
}

/* ─── MAIN RENDER ─── */
function renderApp() {
  if (State.currentUser) {
    const isAdmin = State.currentUser.role === 'admin';
    $('#auth-screen').style.display = 'none';
    $('#app-shell').style.display = 'flex';
    // Sidebar: visible for admin, hidden for employee
    $('#sidebar').style.display = isAdmin ? '' : 'none';
    // Employee topbar: visible for employee, hidden for admin
    $('#emp-topbar').style.display = isAdmin ? 'none' : '';
    // Always land admins on dashboard
    if (isAdmin) { State.activeView = 'dashboard'; }
    renderUserInfo();
    renderNav();
    renderView();
  } else {
    $('#auth-screen').style.display = 'flex';
    $('#app-shell').style.display = 'none';
    showLoginPanel();
  }
}

function renderView() {
  const main = $('#main-content');
  const isAdmin = State.currentUser?.role === 'admin';
  const view = isAdmin ? State.activeView : 'profile';
  switch (view) {
    case 'dashboard':   main.innerHTML = renderDashboard(); bindDashboard(); break;
    case 'employees':   main.innerHTML = renderEmployees(); bindEmployees(); break;
    case 'departments': main.innerHTML = renderDepartments(); bindDepartments(); break;
    case 'roles':       main.innerHTML = renderRoles(); bindRoles(); break;
    case 'attendance':  main.innerHTML = renderAttendance(); bindAttendance(); break;
    case 'leaves':      main.innerHTML = renderLeaves(); bindLeaves(); break;
    case 'accounts':    main.innerHTML = renderAccounts(); bindAccounts(); break;
    case 'profile':     main.innerHTML = renderProfile(); bindProfile(); break;
    default:            main.innerHTML = '<p>View not found.</p>';
  }
}

/* ─── DASHBOARD ─── */
function renderDashboard() {
  const { employees, departments, attendance, leaveRequests, roles } = State;
  const td = today();
  const todayAtt = attendance.filter(a=>a.date===td);
  const present = todayAtt.filter(a=>a.status==='present'||a.status==='late').length;
  const absent  = todayAtt.filter(a=>a.status==='absent').length;
  const active  = employees.filter(e=>e.status==='active').length;
  const pending = leaveRequests.filter(l=>l.status==='pending').length;
  const onLeave = employees.filter(e=>e.status==='on_leave').length;
  const now = new Date();
  const newThisMonth = employees.filter(e=>{ const d=new Date(e.createdAt); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear(); }).length;

  const recentEmps = [...employees].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  const pendingLeaves = leaveRequests.filter(l=>l.status==='pending').slice(0,5);

  const statIcon = (color,svg) => `<div class="stat-icon" style="background:${color}">${svg}</div>`;

  return `
  <div class="page-header"><div><h1 class="page-title">Dashboard</h1><p class="page-sub">Welcome, ${esc(State.currentUser.firstName)} — ${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p></div></div>

  <div class="stat-grid stat-grid-4">
    <div class="stat-card">${statIcon('#e0e7ff','<svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>')}<div><div class="stat-label">Total Employees</div><div class="stat-value">${employees.length}</div><div class="stat-sub">${active} active</div></div></div>
    <div class="stat-card">${statIcon('#dcfce7','<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>')}<div><div class="stat-label">Present Today</div><div class="stat-value">${present}</div><div class="stat-sub">${absent} absent</div></div></div>
    <div class="stat-card">${statIcon('#fef3c7','<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>')}<div><div class="stat-label">Pending Leaves</div><div class="stat-value">${pending}</div><div class="stat-sub">Awaiting review</div></div></div>
    <div class="stat-card">${statIcon('#fee2e2','<svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>')}<div><div class="stat-label">On Leave</div><div class="stat-value">${onLeave}</div><div class="stat-sub">New: ${newThisMonth} this month</div></div></div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
    <div class="table-wrap">
      <div class="card-header"><span class="card-title">Recently Added Employees</span></div>
      <div>${recentEmps.map(emp=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--gray-50)">
          <div class="emp-cell">
            <div class="emp-av ${avColor(emp.id)}">${initials(emp.firstName,emp.lastName)}</div>
            <div><div class="emp-name">${esc(getFullName(emp))}</div><div class="emp-sub">${esc(getRoleTitle(emp.roleId))} · ${esc(getDeptName(emp.departmentId))}</div></div>
          </div>
          ${badge(emp.status.replace('_',' '), STATUS_BADGES[emp.status]||'badge-gray')}
        </div>`).join('')}</div>
    </div>
    <div class="table-wrap">
      <div class="card-header"><span class="card-title">Pending Leave Requests</span></div>
      ${pendingLeaves.length===0?'<div class="empty-state"><div class="empty-title">No pending requests</div></div>':
      pendingLeaves.map(leave=>{ const emp=employees.find(e=>e.id===leave.employeeId); return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--gray-50)">
          <div class="emp-cell">
            <div class="emp-av av-amber">${emp?initials(emp.firstName,emp.lastName):'?'}</div>
            <div><div class="emp-name">${emp?esc(getFullName(emp)):'Unknown'}</div><div class="emp-sub">${esc(LEAVE_TYPE_LABELS[leave.type]||leave.type)} · ${fmtDate(leave.startDate)} – ${fmtDate(leave.endDate)}</div></div>
          </div>
          <span style="font-size:11px;font-weight:600;color:#d97706;background:#fef3c7;padding:2px 8px;border-radius:99px">${leave.totalDays}d</span>
        </div>`;}).join('')}
    </div>
  </div>

  <div class="table-wrap">
    <div class="card-header"><span class="card-title">Today's Attendance — ${fmtDate(td)}</span></div>
    ${todayAtt.length===0?'<div class="empty-state"><div class="empty-title">No attendance records for today yet.</div></div>':
    `<div class="table-scroll"><table class="data-table">
      <thead><tr><th>Employee</th><th>Clock In</th><th>Clock Out</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>${todayAtt.map(rec=>{ const emp=employees.find(e=>e.id===rec.employeeId); return `
        <tr>
          <td><div class="emp-cell"><div class="emp-av ${emp?avColor(emp.id):'av-gray'}">${emp?initials(emp.firstName,emp.lastName):'?'}</div><span class="emp-name">${emp?esc(getFullName(emp)):rec.employeeId}</span></div></td>
          <td>${esc(rec.clockIn||'—')}</td>
          <td>${esc(rec.clockOut||'—')}</td>
          <td>${badge(rec.status.replace('_',' '),STATUS_BADGES[rec.status]||'badge-gray')}</td>
          <td style="color:var(--gray-400);font-size:12px">${esc(rec.notes||'—')}</td>
        </tr>`;}).join('')}</tbody>
    </table></div>`}
    <div class="table-footer">${todayAtt.length} record${todayAtt.length!==1?'s':''}</div>
  </div>`;
}
function bindDashboard() {}

/* ─── EMPLOYEES VIEW ─── */
let _empSearch = '', _empDept = '', _empStatus = '';

function renderEmployees() {
  const { employees, departments } = State;
  const filtered = employees.filter(e => {
    const nm = getFullName(e).toLowerCase();
    const ms = !_empSearch || nm.includes(_empSearch.toLowerCase()) || e.email.toLowerCase().includes(_empSearch.toLowerCase());
    const md = !_empDept || e.departmentId === _empDept;
    const mst = !_empStatus || e.status === _empStatus;
    return ms && md && mst;
  });

  return `
  <div class="page-header">
    <div><h1 class="page-title">Employees</h1><p class="page-sub">${employees.length} employees across ${departments.length} departments</p></div>
    <div class="page-actions"><button class="btn btn-primary" id="btn-add-emp"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Employee</button></div>
  </div>
  <div class="filter-row">
    <div class="filter-search"><span class="filter-search-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span><input class="filter-search-input" id="emp-search" type="text" placeholder="Search name or email…" value="${esc(_empSearch)}" /></div>
    <select class="input select filter-select" id="emp-dept" style="max-width:160px">
      <option value="">All Departments</option>
      ${departments.map(d=>`<option value="${d.id}"${_empDept===d.id?' selected':''}>${esc(d.name)}</option>`).join('')}
    </select>
    <select class="input select filter-select" id="emp-status" style="max-width:130px">
      <option value="">All Statuses</option>
      <option value="active"${_empStatus==='active'?' selected':''}>Active</option>
      <option value="inactive"${_empStatus==='inactive'?' selected':''}>Inactive</option>
      <option value="on_leave"${_empStatus==='on_leave'?' selected':''}>On Leave</option>
    </select>
  </div>
  <div class="table-wrap">
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Employee</th><th>Department</th><th>Role</th><th>Type</th><th>Salary</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${filtered.length===0?`<tr><td colspan="7"><div class="empty-state"><div class="empty-title">No employees found</div><div class="empty-sub">Try adjusting your filters.</div></div></td></tr>`:
        filtered.map(emp=>`<tr>
          <td><div class="emp-cell"><div class="emp-av ${avColor(emp.id)}">${initials(emp.firstName,emp.lastName)}</div><div><div class="emp-name">${esc(getFullName(emp))}</div><div class="emp-sub">${esc(emp.email)}</div></div></div></td>
          <td>${esc(getDeptName(emp.departmentId))}</td>
          <td style="font-size:12px;color:var(--gray-600)">${esc(getRoleTitle(emp.roleId))}</td>
          <td>${badgePlain(emp.employmentType.replace('_',' '),emp.employmentType==='full_time'?'badge-green':emp.employmentType==='part_time'?'badge-blue':'badge-purple')}</td>
          <td class="text-money">${fmtSalary(emp.salary)}</td>
          <td>${badge(emp.status.replace('_',' '),STATUS_BADGES[emp.status]||'badge-gray')}</td>
          <td><div class="row-actions">
            <button class="row-btn view" data-id="${emp.id}" data-action="view-emp" title="View"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
            <button class="row-btn edit" data-id="${emp.id}" data-action="edit-emp" title="Edit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="row-btn del" data-id="${emp.id}" data-action="del-emp" title="Delete"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
          </div></td>
        </tr>`).join('')}
      </tbody>
    </table></div>
    <div class="table-footer">Showing ${filtered.length} of ${employees.length} employees</div>
  </div>`;
}

function bindEmployees() {
  $('#emp-search')?.addEventListener('input', e => { _empSearch = e.target.value; renderView(); });
  $('#emp-dept')?.addEventListener('change', e => { _empDept = e.target.value; renderView(); });
  $('#emp-status')?.addEventListener('change', e => { _empStatus = e.target.value; renderView(); });
  $('#btn-add-emp')?.addEventListener('click', () => openEmpForm(null));
  $$('[data-action="view-emp"]').forEach(b => b.addEventListener('click', () => openEmpDetail(b.dataset.id)));
  $$('[data-action="edit-emp"]').forEach(b => b.addEventListener('click', () => openEmpForm(b.dataset.id)));
  $$('[data-action="del-emp"]').forEach(b => b.addEventListener('click', () => {
    const emp = State.employees.find(e=>e.id===b.dataset.id);
    openConfirm('Delete Employee', `Delete ${getFullName(emp)}? This cannot be undone.`, 'Delete', true, () => {
      State.employees = State.employees.filter(e=>e.id!==b.dataset.id);
      closeConfirm(); renderView(); renderNav();
      toast(`${getFullName(emp)} deleted.`, 'info');
    });
  }));
}

function empFormHTML(emp) {
  const { departments, roles, employees } = State;
  const deptId = emp?.departmentId || departments[0]?.id || '';
  const filtRoles = roles.filter(r=>r.departmentId===deptId);
  return `
  <form id="emp-form" novalidate>
    <div class="form-row-2">
      <div class="form-group"><label class="form-label">First Name <span class="req">*</span></label><input class="input" id="ef-fname" value="${esc(emp?.firstName||'')}" placeholder="Alex" /><span class="field-error" id="ef-fname-err"></span></div>
      <div class="form-group"><label class="form-label">Last Name <span class="req">*</span></label><input class="input" id="ef-lname" value="${esc(emp?.lastName||'')}" placeholder="Rivera" /><span class="field-error" id="ef-lname-err"></span></div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="form-label">Email <span class="req">*</span></label><input class="input" id="ef-email" type="email" value="${esc(emp?.email||'')}" placeholder="name@company.com" /><span class="field-error" id="ef-email-err"></span></div>
      <div class="form-group"><label class="form-label">Phone <span class="req">*</span></label><input class="input" id="ef-phone" value="${esc(emp?.phone||'')}" placeholder="+1 555-000-0000" /><span class="field-error" id="ef-phone-err"></span></div>
    </div>
    <div class="form-group"><label class="form-label">Address</label><input class="input" id="ef-address" value="${esc(emp?.address||'')}" placeholder="123 Main St, Springfield" /></div>
    <div class="form-row-2">
      <div class="form-group"><label class="form-label">Department <span class="req">*</span></label>
        <select class="input select" id="ef-dept">${departments.map(d=>`<option value="${d.id}"${deptId===d.id?' selected':''}>${esc(d.name)}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label class="form-label">Role <span class="req">*</span></label>
        <select class="input select" id="ef-role"><option value="">Select role…</option>${filtRoles.map(r=>`<option value="${r.id}"${emp?.roleId===r.id?' selected':''}>${esc(r.title)}</option>`).join('')}</select>
        <span class="field-error" id="ef-role-err"></span>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="form-label">Manager</label>
        <select class="input select" id="ef-manager">
          <option value="">None</option>
          ${employees.filter(e=>e.id!==emp?.id).map(e=>`<option value="${e.id}"${emp?.managerId===e.id?' selected':''}>${esc(getFullName(e))}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Status</label>
        <select class="input select" id="ef-status"><option value="active"${(emp?.status||'active')==='active'?' selected':''}>Active</option><option value="inactive"${emp?.status==='inactive'?' selected':''}>Inactive</option><option value="on_leave"${emp?.status==='on_leave'?' selected':''}>On Leave</option></select>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="form-label">Employment Type</label>
        <select class="input select" id="ef-type"><option value="full_time"${(emp?.employmentType||'full_time')==='full_time'?' selected':''}>Full Time</option><option value="part_time"${emp?.employmentType==='part_time'?' selected':''}>Part Time</option><option value="contract"${emp?.employmentType==='contract'?' selected':''}>Contract</option></select>
      </div>
      <div class="form-group"><label class="form-label">Start Date <span class="req">*</span></label><input class="input" id="ef-start" type="date" value="${esc(emp?.startDate||today())}" /><span class="field-error" id="ef-start-err"></span></div>
    </div>
    <div class="form-group"><label class="form-label">Salary (PHP / year)</label><input class="input" id="ef-salary" type="number" min="0" value="${emp?.salary||0}" /></div>
    <div style="margin-top:16px">
      <button type="submit" class="btn btn-primary btn-block">${emp?'Save Changes':'Add Employee'}</button>
    </div>
  </form>`;
}

function openEmpForm(id) {
  const emp = id ? State.employees.find(e=>e.id===id) : null;
  openModal(emp ? 'Edit Employee' : 'Add New Employee', empFormHTML(emp), 'modal-lg');
  $('#ef-dept').addEventListener('change', () => {
    const deptId = $('#ef-dept').value;
    const fr = State.roles.filter(r=>r.departmentId===deptId);
    $('#ef-role').innerHTML = '<option value="">Select role…</option>' + fr.map(r=>`<option value="${r.id}">${esc(r.title)}</option>`).join('');
  });
  $('#emp-form').addEventListener('submit', ev => {
    ev.preventDefault();
    const fname = $('#ef-fname').value.trim();
    const lname = $('#ef-lname').value.trim();
    const email = $('#ef-email').value.trim();
    const phone = $('#ef-phone').value.trim();
    const roleId = $('#ef-role').value;
    const startDate = $('#ef-start').value;
    let ok = true;
    const setErr = (id, msg) => { $('#'+id).textContent = msg; if (msg) ok = false; };
    setErr('ef-fname-err', fname ? '' : 'Required');
    setErr('ef-lname-err', lname ? '' : 'Required');
    setErr('ef-email-err', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Valid email required');
    setErr('ef-phone-err', phone ? '' : 'Required');
    setErr('ef-role-err', roleId ? '' : 'Select a role');
    setErr('ef-start-err', startDate ? '' : 'Required');
    if (!ok) return;
    const record = {
      id: emp?.id || genId(),
      firstName: fname, lastName: lname, email, phone,
      address: $('#ef-address').value.trim(),
      departmentId: $('#ef-dept').value,
      roleId,
      managerId: $('#ef-manager').value || null,
      status: $('#ef-status').value,
      employmentType: $('#ef-type').value,
      startDate,
      salary: Number($('#ef-salary').value) || 0,
      createdAt: emp?.createdAt || today(),
    };
    if (emp) State.employees = State.employees.map(e=>e.id===record.id?record:e);
    else State.employees.push(record);
    closeModal(); renderView(); renderNav();
    toast(emp ? 'Employee updated.' : 'Employee added.', 'success');
  });
}

function openEmpDetail(id) {
  const emp = State.employees.find(e=>e.id===id);
  if (!emp) return;
  const rows = [
    ['Email', emp.email], ['Phone', emp.phone], ['Address', emp.address],
    ['Department', getDeptName(emp.departmentId)], ['Role', getRoleTitle(emp.roleId)],
    ['Manager', emp.managerId ? getEmpName(emp.managerId) : 'None'],
    ['Employment', emp.employmentType.replace('_',' ')], ['Start Date', fmtDate(emp.startDate)],
    ['Salary', fmtSalary(emp.salary)],
  ];
  openModal('Employee Profile', `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding:16px;background:var(--gray-50);border-radius:12px">
      <div class="emp-av ${avColor(emp.id)}" style="width:56px;height:56px;font-size:18px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center;">${initials(emp.firstName,emp.lastName)}</div>
      <div>
        <div style="font-size:17px;font-weight:700;color:var(--gray-900)">${esc(getFullName(emp))}</div>
        <div style="font-size:13px;color:var(--gray-500);margin-top:2px">${esc(getRoleTitle(emp.roleId))}</div>
        <div style="margin-top:6px">${badge(emp.status.replace('_',' '),STATUS_BADGES[emp.status]||'badge-gray')}</div>
      </div>
    </div>
    ${rows.map(([l,v])=>`<div class="detail-row"><span class="detail-label">${esc(l)}</span><span class="detail-value">${esc(String(v))}</span></div>`).join('')}
    <button class="btn btn-outline btn-block" style="margin-top:16px" id="detail-close">Close</button>
  `);
  $('#detail-close').onclick = closeModal;
}

/* ─── DEPARTMENTS VIEW ─── */
function renderDepartments() {
  const { departments, employees, roles } = State;
  return `
  <div class="page-header">
    <div><h1 class="page-title">Departments</h1><p class="page-sub">${departments.length} departments</p></div>
    <div class="page-actions"><button class="btn btn-primary" id="btn-add-dept"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Department</button></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
    ${departments.map(d=>{
      const empCnt = employees.filter(e=>e.departmentId===d.id).length;
      const roleCnt = roles.filter(r=>r.departmentId===d.id).length;
      const manager = employees.find(e=>e.id===d.managerId);
      return `<div class="card" style="padding:20px;position:relative">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--brand-100);color:var(--brand-700);display:flex;align-items:center;justify-content:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
          </div>
          <div style="display:flex;gap:4px">
            <button class="row-btn edit" data-id="${d.id}" data-action="edit-dept" title="Edit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="row-btn del" data-id="${d.id}" data-action="del-dept" title="Delete"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
          </div>
        </div>
        <div style="font-size:15px;font-weight:600;color:var(--gray-900);margin-bottom:4px">${esc(d.name)}</div>
        <div style="font-size:12px;color:var(--gray-500);margin-bottom:12px">${esc(d.description)}</div>
        <div style="display:flex;gap:12px;font-size:12px;color:var(--gray-600)">
          <span><strong>${empCnt}</strong> employees</span>
          <span><strong>${roleCnt}</strong> roles</span>
        </div>
        ${manager?`<div style="margin-top:8px;font-size:11px;color:var(--gray-400)">Manager: ${esc(getFullName(manager))}</div>`:''}
      </div>`;
    }).join('')}
  </div>`;
}

function bindDepartments() {
  $('#btn-add-dept')?.addEventListener('click', () => openDeptForm(null));
  $$('[data-action="edit-dept"]').forEach(b=>b.addEventListener('click', ()=>openDeptForm(b.dataset.id)));
  $$('[data-action="del-dept"]').forEach(b=>b.addEventListener('click', ()=>{
    const d = State.departments.find(x=>x.id===b.dataset.id);
    openConfirm('Delete Department', `Delete "${d.name}"? This cannot be undone.`, 'Delete', true, ()=>{
      State.departments = State.departments.filter(x=>x.id!==b.dataset.id);
      closeConfirm(); renderView(); toast(`${d.name} deleted.`,'info');
    });
  }));
}

function openDeptForm(id) {
  const d = id ? State.departments.find(x=>x.id===id) : null;
  const { employees } = State;
  openModal(d?'Edit Department':'Add Department', `
    <form id="dept-form" novalidate>
      <div class="form-group"><label class="form-label">Name <span class="req">*</span></label><input class="input" id="df-name" value="${esc(d?.name||'')}" placeholder="Engineering" /><span class="field-error" id="df-name-err"></span></div>
      <div class="form-group"><label class="form-label">Description</label><input class="input" id="df-desc" value="${esc(d?.description||'')}" placeholder="Team focus…" /></div>
      <div class="form-group"><label class="form-label">Manager</label>
        <select class="input select" id="df-mgr">
          <option value="">None</option>
          ${employees.map(e=>`<option value="${e.id}"${d?.managerId===e.id?' selected':''}>${esc(getFullName(e))}</option>`).join('')}
        </select>
      </div>
      <div style="margin-top:16px">
        <button type="submit" class="btn btn-primary btn-block">${d?'Save':'Add'}</button>
      </div>
    </form>`);
  $('#dept-form').addEventListener('submit', ev=>{
    ev.preventDefault();
    const name = $('#df-name').value.trim();
    if (!name) { $('#df-name-err').textContent='Required'; return; }
    const rec = { id:d?.id||genId(), name, description:$('#df-desc').value.trim(), managerId:$('#df-mgr').value||null, createdAt:d?.createdAt||today() };
    if (d) State.departments = State.departments.map(x=>x.id===rec.id?rec:x);
    else State.departments.push(rec);
    closeModal(); renderView(); toast(d?'Department updated.':'Department added.','success');
  });
}

/* ─── ROLES VIEW ─── */
let _rolesFilter = '';
function renderRoles() {
  const { roles, departments, employees } = State;
  const filtered = _rolesFilter ? roles.filter(r=>r.departmentId===_rolesFilter) : roles;
  return `
  <div class="page-header">
    <div><h1 class="page-title">Roles</h1><p class="page-sub">${roles.length} roles across ${departments.length} departments</p></div>
    <div class="page-actions"><button class="btn btn-primary" id="btn-add-role"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Role</button></div>
  </div>
  <div class="filter-row">
    <select class="input select filter-select" id="role-dept-filter" style="max-width:200px">
      <option value="">All Departments</option>
      ${departments.map(d=>`<option value="${d.id}"${_rolesFilter===d.id?' selected':''}>${esc(d.name)}</option>`).join('')}
    </select>
  </div>
  <div class="table-wrap">
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Role Title</th><th>Department</th><th>Level</th><th>Employees</th><th>Description</th><th>Actions</th></tr></thead>
      <tbody>
        ${filtered.length===0?`<tr><td colspan="6"><div class="empty-state"><div class="empty-title">No roles found</div></div></td></tr>`:
        filtered.map(r=>{
          const cnt = employees.filter(e=>e.roleId===r.id).length;
          return `<tr>
            <td><span style="font-weight:500;color:var(--gray-900)">${esc(r.title)}</span></td>
            <td>${esc(getDeptName(r.departmentId))}</td>
            <td>${badgePlain(r.level, LEVEL_BADGES[r.level]||'badge-gray')}</td>
            <td>${cnt}</td>
            <td style="font-size:12px;color:var(--gray-500);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.description)}</td>
            <td><div class="row-actions">
              <button class="row-btn edit" data-id="${r.id}" data-action="edit-role" title="Edit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="row-btn del" data-id="${r.id}" data-action="del-role" title="Delete"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
            </div></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
    <div class="table-footer">Showing ${filtered.length} of ${roles.length} roles</div>
  </div>`;
}

function bindRoles() {
  $('#role-dept-filter')?.addEventListener('change', e=>{ _rolesFilter=e.target.value; renderView(); });
  $('#btn-add-role')?.addEventListener('click', ()=>openRoleForm(null));
  $$('[data-action="edit-role"]').forEach(b=>b.addEventListener('click',()=>openRoleForm(b.dataset.id)));
  $$('[data-action="del-role"]').forEach(b=>b.addEventListener('click',()=>{
    const r=State.roles.find(x=>x.id===b.dataset.id);
    openConfirm('Delete Role',`Delete "${r.title}"?`,'Delete',true,()=>{
      State.roles=State.roles.filter(x=>x.id!==b.dataset.id);
      closeConfirm(); renderView(); toast(`${r.title} deleted.`,'info');
    });
  }));
}

function openRoleForm(id) {
  const r = id ? State.roles.find(x=>x.id===id) : null;
  const { departments } = State;
  const LEVELS = ['junior','mid','senior','lead','manager','director'];
  openModal(r?'Edit Role':'Add Role', `
    <form id="role-form" novalidate>
      <div class="form-group"><label class="form-label">Title <span class="req">*</span></label><input class="input" id="rf-title" value="${esc(r?.title||'')}" placeholder="Software Engineer" /><span class="field-error" id="rf-title-err"></span></div>
      <div class="form-row-2">
        <div class="form-group"><label class="form-label">Department <span class="req">*</span></label>
          <select class="input select" id="rf-dept">${departments.map(d=>`<option value="${d.id}"${r?.departmentId===d.id?' selected':''}>${esc(d.name)}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Level</label>
          <select class="input select" id="rf-level">${LEVELS.map(l=>`<option value="${l}"${(r?.level||'mid')===l?' selected':''}>${l.charAt(0).toUpperCase()+l.slice(1)}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="input" id="rf-desc" rows="2">${esc(r?.description||'')}</textarea></div>
      <div style="margin-top:16px">
        <button type="submit" class="btn btn-primary btn-block">${r?'Save':'Add'}</button>
      </div>
    </form>`);
  $('#role-form').addEventListener('submit', ev=>{
    ev.preventDefault();
    const title=$('#rf-title').value.trim();
    if(!title){$('#rf-title-err').textContent='Required';return;}
    const rec={id:r?.id||genId(),title,departmentId:$('#rf-dept').value,level:$('#rf-level').value,description:$('#rf-desc').value.trim(),createdAt:r?.createdAt||today()};
    if(r) State.roles=State.roles.map(x=>x.id===rec.id?rec:x); else State.roles.push(rec);
    closeModal(); renderView(); toast(r?'Role updated.':'Role added.','success');
  });
}

/* ─── ATTENDANCE VIEW ─── */
let _attDate = today(), _attEmpFilter = '';
function renderAttendance() {
  const { attendance, employees, departments } = State;
  const filtered = attendance.filter(a=>{
    const md = a.date === _attDate;
    const me = !_attEmpFilter || a.employeeId === _attEmpFilter;
    return md && me;
  });
  const present = filtered.filter(a=>a.status==='present'||a.status==='late').length;
  const absent  = filtered.filter(a=>a.status==='absent').length;
  const late    = filtered.filter(a=>a.status==='late').length;
  const half    = filtered.filter(a=>a.status==='half_day').length;

  const statIcon = (bg, stroke, svg) => `<div class="stat-icon" style="background:${bg}">${svg.replace('COLOR',stroke)}</div>`;
  const clockSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const checkSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`;
  const xSVG     = `<svg viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

  return `
  <div class="page-header">
    <div><h1 class="page-title">Attendance</h1><p class="page-sub">Track daily clock-ins and manage records</p></div>
    <div class="page-actions"><button class="btn btn-primary" id="btn-log-att"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Log Record</button></div>
  </div>
  <div class="stat-grid stat-grid-4" style="margin-bottom:20px">
    <div class="stat-card"><div class="stat-icon" style="background:#dcfce7">${checkSVG.replace('COLOR','#16a34a')}</div><div><div class="stat-label">Present</div><div class="stat-value">${present}</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:#fee2e2">${xSVG.replace('COLOR','#dc2626')}</div><div><div class="stat-label">Absent</div><div class="stat-value">${absent}</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:#ffedd5">${clockSVG.replace('COLOR','#c2410c')}</div><div><div class="stat-label">Late</div><div class="stat-value">${late}</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:#dbeafe">${clockSVG.replace('COLOR','#1d4ed8')}</div><div><div class="stat-label">Half Day</div><div class="stat-value">${half}</div></div></div>
  </div>
  <div class="filter-row">
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-size:13px;font-weight:500;color:var(--gray-600)">Date:</label>
      <input type="date" class="input" id="att-date" value="${_attDate}" style="width:160px" />
    </div>
    <select class="input select filter-select" id="att-emp" style="max-width:200px">
      <option value="">All Employees</option>
      ${employees.map(e=>`<option value="${e.id}"${_attEmpFilter===e.id?' selected':''}>${esc(getFullName(e))}</option>`).join('')}
    </select>
  </div>
  <div class="table-wrap">
    <div class="card-header"><span class="card-title">Attendance for ${fmtDate(_attDate)}</span></div>
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Employee</th><th>Department</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
      <tbody>
        ${filtered.length===0?`<tr><td colspan="8"><div class="empty-state"><div class="empty-title">No records for this date</div></div></td></tr>`:
        filtered.map(rec=>{
          const emp=employees.find(e=>e.id===rec.employeeId);
          return `<tr>
            <td><div class="emp-cell"><div class="emp-av ${emp?avColor(emp.id):'av-gray'}">${emp?initials(emp.firstName,emp.lastName):'?'}</div><span class="emp-name">${emp?esc(getFullName(emp)):rec.employeeId}</span></div></td>
            <td style="font-size:12px">${emp?esc(getDeptName(emp.departmentId)):'—'}</td>
            <td>${esc(rec.clockIn||'—')}</td>
            <td>${esc(rec.clockOut||'—')}</td>
            <td>${esc(calcHours(rec.clockIn,rec.clockOut))}</td>
            <td>${badge(rec.status.replace('_',' '),STATUS_BADGES[rec.status]||'badge-gray')}</td>
            <td style="font-size:11px;color:var(--gray-400)">${esc(rec.notes||'—')}</td>
            <td>${rec.clockIn && rec.clockOut
              ? `<span style="font-size:11px;color:var(--gray-400)">Complete</span>`
              : `<button class="row-btn edit" data-id="${rec.id}" data-action="edit-att" title="Add Clock Out"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`
            }</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
    <div class="table-footer">${filtered.length} record${filtered.length!==1?'s':''}</div>
  </div>`;
}

function bindAttendance() {
  $('#att-date')?.addEventListener('change', e=>{ _attDate=e.target.value; renderView(); });
  $('#att-emp')?.addEventListener('change', e=>{ _attEmpFilter=e.target.value; renderView(); });
  $('#btn-log-att')?.addEventListener('click', ()=>openAttForm(null));
  $$('[data-action="edit-att"]').forEach(b=>b.addEventListener('click',()=>openAttForm(b.dataset.id)));
}

function openAttForm(id) {
  const rec = id ? State.attendance.find(x => x.id === id) : null;
  const isAdmin = State.currentUser?.role === 'admin';

  // Block editing complete records (both clock in + out filled)
  if (rec && rec.clockIn && rec.clockOut) {
    toast('This record is complete and cannot be edited.', 'info');
    return;
  }

  // For new records: admin picks employee, employee uses own account
  const empId = rec ? rec.employeeId : (isAdmin ? '' : (State.currentUser?.employeeId || ''));
  const emp = empId ? State.employees.find(e => e.id === empId) : null;
  const isEdit = !!rec; // editing an existing record to add clock-out

  const empPickerHTML = isAdmin && !isEdit
    ? `<div class="form-group">
        <label class="form-label">Employee <span class="req">*</span></label>
        <select class="input select" id="af-emp">
          <option value="">Select employee…</option>
          ${State.employees.map(e => `<option value="${e.id}">${esc(getFullName(e))}</option>`).join('')}
        </select>
        <span class="field-error" id="af-emp-err"></span>
      </div>`
    : (emp ? `<div style="display:flex;align-items:center;gap:10px;background:var(--gray-50);border-radius:10px;padding:12px 14px;margin-bottom:14px">
        <div class="emp-av ${avColor(emp.id)}" style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${initials(emp.firstName, emp.lastName)}</div>
        <div><div style="font-size:13px;font-weight:600;color:var(--gray-900)">${esc(getFullName(emp))}</div><div style="font-size:11px;color:var(--gray-400)">${esc(getRoleTitle(emp.roleId))}</div></div>
      </div>` : '');

  openModal(isEdit ? 'Add Clock Out' : 'Log Attendance', `
    <form id="att-form" novalidate>
      ${empPickerHTML}
      <div style="background:var(--brand-50);border:1px solid var(--brand-100);border-radius:8px;padding:9px 12px;margin-bottom:14px;font-size:12px;color:var(--brand-700);font-weight:500;display:flex;align-items:center;gap:6px">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Date: <strong>${new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric', year:'numeric'})}</strong>
      </div>
      ${isEdit
        ? `<div class="form-group">
            <label class="form-label">Clock In <span style="font-size:11px;color:var(--gray-400)">(recorded)</span></label>
            <input type="time" class="input" value="${rec.clockIn}" disabled style="background:var(--gray-50);color:var(--gray-400);cursor:not-allowed" />
          </div>
          <div class="form-group">
            <label class="form-label">Clock Out <span class="req">*</span></label>
            <input type="time" class="input" id="af-out" value="" />
            <span class="field-error" id="af-out-err"></span>
          </div>`
        : `<div class="form-row-2">
            <div class="form-group"><label class="form-label">Clock In</label><input type="time" class="input" id="af-in" value="" /></div>
            <div class="form-group"><label class="form-label">Clock Out</label><input type="time" class="input" id="af-out" value="" /></div>
          </div>`
      }
      <div class="form-group"><label class="form-label">Notes</label><input class="input" id="af-notes" value="${esc(rec?.notes||'')}" placeholder="Optional note…" /></div>
      <div style="margin-top:16px">
        <button type="submit" class="btn btn-primary btn-block">${isEdit ? 'Save Clock Out' : 'Log Attendance'}</button>
      </div>
    </form>`, 'modal-sm');

  $('#att-form').addEventListener('submit', ev => {
    ev.preventDefault();
    // Validate employee selection for admin new records
    const selectedEmpId = (isAdmin && !isEdit) ? ($('#af-emp')?.value || '') : empId;
    if (isAdmin && !isEdit && !selectedEmpId) {
      $('#af-emp-err').textContent = 'Select an employee';
      return;
    }
    // Validate clock-out required when editing
    const clockOutVal = $('#af-out')?.value || null;
    if (isEdit && !clockOutVal) {
      $('#af-out-err').textContent = 'Clock out time is required';
      return;
    }
    const r2 = {
      id: rec?.id || genId(),
      employeeId: selectedEmpId,
      date: rec?.date || today(),
      clockIn: isEdit ? rec.clockIn : ($('#af-in')?.value || null),
      clockOut: clockOutVal,
      status: 'present',
      notes: $('#af-notes').value.trim(),
    };
    if (rec) State.attendance = State.attendance.map(x => x.id === r2.id ? r2 : x);
    else State.attendance.push(r2);
    closeModal(); renderView(); toast(isEdit ? 'Clock out saved.' : 'Attendance logged.', 'success');
  });
}

/* ─── LEAVES VIEW ─── */
let _leaveStatus = '', _leaveType = '';
function renderLeaves() {
  const { leaveRequests, employees } = State;
  const total    = leaveRequests.length;
  const pending  = leaveRequests.filter(l=>l.status==='pending').length;
  const approved = leaveRequests.filter(l=>l.status==='approved').length;
  const rejected = leaveRequests.filter(l=>l.status==='rejected').length;
  const filtered = leaveRequests.filter(l=>{
    const ms = !_leaveStatus || l.status===_leaveStatus;
    const mt = !_leaveType   || l.type===_leaveType;
    return ms && mt;
  });

  return `
  <div class="page-header">
    <div><h1 class="page-title">Leave Management</h1><p class="page-sub">Review requests, manage balances, track availability</p></div>
    <div class="page-actions"><button class="btn btn-primary" id="btn-add-leave"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Request</button></div>
  </div>
  <div class="stat-grid stat-grid-4" style="margin-bottom:20px">
    <div class="stat-card"><div class="stat-icon" style="background:#e0e7ff"><svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div><div class="stat-label">Total</div><div class="stat-value">${total}</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:#fef3c7"><svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div><div class="stat-label">Pending</div><div class="stat-value" style="color:var(--amber-500)">${pending}</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:#dcfce7"><svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div><div><div class="stat-label">Approved</div><div class="stat-value" style="color:var(--green-600)">${approved}</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:#fee2e2"><svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><div><div class="stat-label">Rejected</div><div class="stat-value" style="color:var(--red-600)">${rejected}</div></div></div>
  </div>
  <div class="filter-row">
    <select class="input select filter-select" id="leave-status" style="max-width:160px">
      <option value="">All Statuses</option>
      ${['pending','approved','rejected','cancelled'].map(s=>`<option value="${s}"${_leaveStatus===s?' selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
    </select>
    <select class="input select filter-select" id="leave-type" style="max-width:160px">
      <option value="">All Types</option>
      ${Object.entries(LEAVE_TYPE_LABELS).map(([k,v])=>`<option value="${k}"${_leaveType===k?' selected':''}>${v}</option>`).join('')}
    </select>
    <span style="font-size:12px;color:var(--gray-400);margin-left:auto">${filtered.length} requests</span>
  </div>
  <div class="table-wrap">
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Employee</th><th>Type</th><th>Period</th><th>Days</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
      <tbody>
        ${filtered.length===0?`<tr><td colspan="7"><div class="empty-state"><div class="empty-title">No leave requests found</div></div></td></tr>`:
        filtered.map(leave=>{
          const emp=employees.find(e=>e.id===leave.employeeId);
          return `<tr>
            <td><div class="emp-cell"><div class="emp-av ${emp?avColor(emp.id):'av-gray'}">${emp?initials(emp.firstName,emp.lastName):'?'}</div><span class="emp-name">${emp?esc(getFullName(emp)):leave.employeeId}</span></div></td>
            <td>${badgePlain(LEAVE_TYPE_LABELS[leave.type]||leave.type, LEAVE_TYPE_BADGES[leave.type]||'badge-gray')}</td>
            <td style="font-size:12px;white-space:nowrap">${fmtDate(leave.startDate)} – ${fmtDate(leave.endDate)}</td>
            <td style="font-weight:600">${leave.totalDays}</td>
            <td>${badge(leave.status,STATUS_BADGES[leave.status]||'badge-gray')}</td>
            <td style="font-size:12px;color:var(--gray-500)">${fmtDate(leave.createdAt)}</td>
            <td><div class="row-actions">
              <button class="row-btn view" data-id="${leave.id}" data-action="view-leave" title="View"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
              ${leave.status==='pending'?`
              <button class="row-btn approve" data-id="${leave.id}" data-action="approve-leave" title="Approve"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></button>
              <button class="row-btn reject"  data-id="${leave.id}" data-action="reject-leave"  title="Reject"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`:''}
            </div></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
    <div class="table-footer">Showing ${filtered.length} of ${leaveRequests.length} requests · <span style="${pending>0?'color:var(--amber-600);font-weight:600':''}">${pending} pending</span></div>
  </div>`;
}

function bindLeaves() {
  $('#leave-status')?.addEventListener('change', e=>{ _leaveStatus=e.target.value; renderView(); });
  $('#leave-type')?.addEventListener('change', e=>{ _leaveType=e.target.value; renderView(); });
  $('#btn-add-leave')?.addEventListener('click', ()=>openLeaveForm());
  $$('[data-action="view-leave"]').forEach(b=>b.addEventListener('click',()=>openLeaveDetail(b.dataset.id)));
  $$('[data-action="approve-leave"]').forEach(b=>b.addEventListener('click',()=>openLeaveReview(b.dataset.id,'approve')));
  $$('[data-action="reject-leave"]').forEach(b=>b.addEventListener('click',()=>openLeaveReview(b.dataset.id,'reject')));
}

function openLeaveForm() {
  // Use the current logged-in user's linked employee record
  const empId = State.currentUser?.employeeId || '';
  const emp = State.employees.find(e => e.id === empId);
  openModal('New Leave Request', `
    <form id="leave-form" novalidate>
      ${emp ? `<div style="display:flex;align-items:center;gap:10px;background:var(--gray-50);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:13px;color:var(--gray-700)">
        <div class="emp-av ${avColor(emp.id)}" style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${initials(emp.firstName, emp.lastName)}</div>
        <div><div style="font-weight:600;color:var(--gray-900)">${esc(getFullName(emp))}</div><div style="font-size:11px;color:var(--gray-400)">${esc(getRoleTitle(emp.roleId))}</div></div>
      </div>` : ''}
      <div class="form-group"><label class="form-label">Leave Type</label>
        <select class="input select" id="lf-type">${Object.entries(LEAVE_TYPE_LABELS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>
      </div>
      <div class="form-row-2">
        <div class="form-group"><label class="form-label">Start Date <span class="req">*</span></label><input type="date" class="input" id="lf-start" value="${today()}" /></div>
        <div class="form-group"><label class="form-label">End Date <span class="req">*</span></label><input type="date" class="input" id="lf-end" value="${today()}" /><span class="field-error" id="lf-end-err"></span></div>
      </div>
      <div class="day-calc-pill" id="lf-days-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span id="lf-days-text">1 day</span></div>
      <div class="form-group"><label class="form-label">Reason <span class="req">*</span></label><textarea class="input" id="lf-reason" rows="3" placeholder="Reason for leave…"></textarea><span class="field-error" id="lf-reason-err"></span></div>
      <div style="margin-top:16px">
        <button type="submit" class="btn btn-primary btn-block">Submit Request</button>
      </div>
    </form>`, 'modal-sm');
  const updateDays = () => {
    const s = $('#lf-start').value, e = $('#lf-end').value;
    if (s && e) { const d = calcDays(s, e); $('#lf-days-text').textContent = d + ' day' + (d !== 1 ? 's' : ''); }
  };
  $('#lf-start').addEventListener('change', updateDays);
  $('#lf-end').addEventListener('change', updateDays);
  $('#leave-form').addEventListener('submit', ev => {
    ev.preventDefault();
    const start = $('#lf-start').value, end = $('#lf-end').value, reason = $('#lf-reason').value.trim();
    let ok = true;
    if (end < start) { $('#lf-end-err').textContent = 'End must be after start'; ok = false; } else { $('#lf-end-err').textContent = ''; }
    if (!reason) { $('#lf-reason-err').textContent = 'Required'; ok = false; } else { $('#lf-reason-err').textContent = ''; }
    if (!ok) return;
    State.leaveRequests.push({ id: genId(), employeeId: empId, type: $('#lf-type').value, startDate: start, endDate: end, totalDays: calcDays(start, end), reason, status: 'pending', reviewedBy: null, reviewedAt: null, reviewNotes: null, createdAt: today() });
    closeModal(); renderView(); renderNav(); toast('Leave request submitted.', 'success');
  });
}

function openLeaveReview(id, action) {
  const leave = State.leaveRequests.find(l=>l.id===id);
  const emp   = State.employees.find(e=>e.id===leave.employeeId);
  openModal(action==='approve'?'Approve Leave':'Reject Leave', `
    <div style="background:var(--gray-50);border-radius:10px;padding:14px;margin-bottom:16px;font-size:13px">
      <div style="margin-bottom:4px"><strong>Employee:</strong> ${emp?esc(getFullName(emp)):'—'}</div>
      <div style="margin-bottom:4px"><strong>Type:</strong> ${esc(LEAVE_TYPE_LABELS[leave.type]||leave.type)}</div>
      <div style="margin-bottom:4px"><strong>Period:</strong> ${fmtDate(leave.startDate)} – ${fmtDate(leave.endDate)}</div>
      <div style="margin-bottom:4px"><strong>Days:</strong> ${leave.totalDays}</div>
      <div><strong>Reason:</strong> ${esc(leave.reason)}</div>
    </div>
    <form id="review-form">
      <div class="form-group"><label class="form-label">${action==='approve'?'Notes (optional)':'Rejection Reason'}</label>
        <textarea class="input" id="rev-notes" rows="3" placeholder="${action==='approve'?'Any notes…':'Reason…'}"></textarea>
      </div>
      <div style="margin-top:16px">
        <button type="submit" class="btn ${action==='approve'?'btn-green':'btn-danger'} btn-block">${action==='approve'?'Approve':'Reject'}</button>
      </div>
    </form>`, 'modal-sm');
  $('#review-form').addEventListener('submit', ev=>{
    ev.preventDefault();
    State.leaveRequests = State.leaveRequests.map(l=>l.id===id?{...l, status:action==='approve'?'approved':'rejected', reviewedBy:'e4', reviewedAt:today(), reviewNotes:$('#rev-notes').value.trim()||null}:l);
    closeModal(); renderView(); renderNav(); toast(`Leave ${action==='approve'?'approved':'rejected'}.`,action==='approve'?'success':'info');
  });
}

function openLeaveDetail(id) {
  const leave = State.leaveRequests.find(l=>l.id===id);
  const emp   = State.employees.find(e=>e.id===leave.employeeId);
  const reviewer = State.employees.find(e=>e.id===leave.reviewedBy);
  const rows = [
    ['Employee', emp?getFullName(emp):'—'],
    ['Type', LEAVE_TYPE_LABELS[leave.type]||leave.type],
    ['Start Date', fmtDate(leave.startDate)],
    ['End Date', fmtDate(leave.endDate)],
    ['Duration', leave.totalDays+' day'+(leave.totalDays!==1?'s':'')],
    ['Reason', leave.reason],
    ['Status', leave.status],
    ['Submitted', fmtDate(leave.createdAt)],
    ...(leave.reviewedBy?[['Reviewed By',reviewer?getFullName(reviewer):leave.reviewedBy],['Reviewed On',fmtDate(leave.reviewedAt)]]:[] ),
    ...(leave.reviewNotes?[['Review Notes',leave.reviewNotes]]:[]),
  ];
  openModal('Leave Request Details', `
    ${rows.map(([l,v])=>`<div class="detail-row"><span class="detail-label">${esc(l)}</span><span class="detail-value">${l==='Status'?badge(esc(v),STATUS_BADGES[v]||'badge-gray'):esc(String(v))}</span></div>`).join('')}
    <button class="btn btn-outline btn-block" style="margin-top:16px" id="ld-close">Close</button>`, 'modal-sm');
  $('#ld-close').onclick = closeModal;
}

/* ─── SUPER ADMIN ─── */
// u1 is the immutable main admin — only they can delete others; nobody can delete them
const SUPER_ADMIN_ID = 'u1';

/* ─── ACCOUNTS VIEW (Admin only) ─── */
function renderAccounts() {
  const { users, employees } = State;
  const isSuperAdmin = State.currentUser?.id === SUPER_ADMIN_ID;
  return `
  <div class="page-header">
    <div><h1 class="page-title">Accounts</h1><p class="page-sub">${users.length} system account${users.length!==1?'s':''} · Admin can create new logins here</p></div>
    <div class="page-actions">
      <button class="btn btn-primary" id="btn-add-account">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Account
      </button>
    </div>
  </div>
  <div class="table-wrap">
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Linked Employee</th><th>Created</th><th>Actions</th></tr></thead>
      <tbody>
        ${users.map(u => {
          const emp = u.employeeId ? employees.find(e => e.id === u.employeeId) : null;
          const isTargetSuperAdmin = u.id === SUPER_ADMIN_ID;
          const isSelf = u.id === State.currentUser?.id;
          // Delete is visible only when:
          //   - not targeting yourself
          //   - not targeting the super-admin (unless you ARE the super-admin)
          const canDelete = !isSelf && (!isTargetSuperAdmin || isSuperAdmin);
          return `<tr>
            <td><div class="emp-cell">
              <div class="emp-av ${u.role==='admin'?'av-indigo':'av-green'}" style="width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">
                ${esc(u.firstName[0])}${esc(u.lastName[0])}
              </div>
              <div>
                <div class="emp-name" style="display:flex;align-items:center;gap:6px">
                  ${esc(u.firstName)} ${esc(u.lastName)}
                  ${isTargetSuperAdmin ? `<span style="font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--amber-100);color:#78350f;padding:1px 6px;border-radius:99px">Main Admin</span>` : ''}
                </div>
                <div class="emp-sub" style="font-size:10px">${isSelf ? 'You' : ''}</div>
              </div>
            </div></td>
            <td style="font-size:12px;color:var(--gray-600)">${esc(u.email)}</td>
            <td>${u.role==='admin'
              ? `<span class="badge badge-indigo">Admin</span>`
              : `<span class="badge badge-green">Employee</span>`}</td>
            <td style="font-size:12px;color:var(--gray-600)">${emp ? esc(emp.firstName+' '+emp.lastName) : '<span style="color:var(--gray-400)">Not linked</span>'}</td>
            <td style="font-size:12px;color:var(--gray-500)">${fmtDate(u.createdAt)}</td>
            <td><div class="row-actions">
              <button class="row-btn edit" data-id="${u.id}" data-action="edit-account" title="Edit account">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              ${canDelete ? `
              <button class="row-btn del" data-id="${u.id}" data-action="del-account" title="Delete account">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>` : ''}
            </div></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
    <div class="table-footer">
      ${users.filter(u=>u.role==='admin').length} admin${users.filter(u=>u.role==='admin').length!==1?'s':''} ·
      ${users.filter(u=>u.role==='employee').length} employee${users.filter(u=>u.role==='employee').length!==1?'s':''}
    </div>
  </div>`;
}

function bindAccounts() {
  $('#btn-add-account')?.addEventListener('click', () => openAccountForm(null));
  $$('[data-action="edit-account"]').forEach(b => b.addEventListener('click', () => openAccountForm(b.dataset.id)));
  $$('[data-action="del-account"]').forEach(b => b.addEventListener('click', () => {
    const u = State.users.find(x => x.id === b.dataset.id);
    // Double-guard: non-super-admin cannot delete the main admin
    if (b.dataset.id === SUPER_ADMIN_ID && State.currentUser?.id !== SUPER_ADMIN_ID) {
      toast('The Main Admin account cannot be deleted.', 'error');
      return;
    }
    openConfirm('Delete Account', `Delete the account for ${u.firstName} ${u.lastName}? This cannot be undone.`, 'Delete', true, () => {
      State.users = State.users.filter(x => x.id !== b.dataset.id);
      closeConfirm(); renderView(); toast(`Account deleted.`, 'info');
    });
  }));
}

function openAccountForm(id) {
  const u = id ? State.users.find(x => x.id === id) : null;
  const { employees } = State;
  openModal(u ? 'Edit Account' : 'Create Account', `
    <form id="account-form" novalidate>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">First Name <span class="req">*</span></label>
          <input class="input" id="ac-fname" value="${esc(u?.firstName||'')}" placeholder="Juan" />
          <span class="field-error" id="ac-fname-err"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Last Name <span class="req">*</span></label>
          <input class="input" id="ac-lname" value="${esc(u?.lastName||'')}" placeholder="dela Cruz" />
          <span class="field-error" id="ac-lname-err"></span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address <span class="req">*</span></label>
        <input class="input" id="ac-email" type="email" value="${esc(u?.email||'')}" placeholder="juan@company.com" />
        <span class="field-error" id="ac-email-err"></span>
      </div>
      <div class="form-group">
        <label class="form-label">${u ? 'New Password' : 'Password <span class="req">*</span>'}</label>
        <input class="input" id="ac-pw" type="password" placeholder="${u ? 'Leave blank to keep current' : 'Min 6 characters'}" />
        <span class="field-error" id="ac-pw-err"></span>
      </div>
      <div class="form-group">
        <label class="form-label">Account Role <span class="req">*</span></label>
        <select class="input select" id="ac-role">
          <option value="admin"${(u?.role||'')  ==='admin'   ?' selected':''}>Admin</option>
          <option value="employee"${(u?.role||'')==='employee'?' selected':''}>Employee</option>
        </select>
        <span class="form-hint">Admins have full access. Employees see only their own profile.</span>
      </div>
      <div class="form-group" id="ac-emp-group">
        <label class="form-label">Link to Employee Record</label>
        <select class="input select" id="ac-emp">
          <option value="">None (admin-only account)</option>
          ${employees.map(e => `<option value="${e.id}"${u?.employeeId===e.id?' selected':''}>${esc(e.firstName+' '+e.lastName)} — ${esc(getDeptName(e.departmentId))}</option>`).join('')}
        </select>
        <span class="form-hint">Required for Employee role — determines whose profile they see.</span>
      </div>
      <div style="margin-top:16px">
        <button type="submit" class="btn btn-primary btn-block">${u ? 'Save Changes' : 'Create Account'}</button>
      </div>
    </form>`);

  // Toggle employee link field visibility based on role
  const toggleEmpField = () => {
    const role = $('#ac-role').value;
    $('#ac-emp-group').style.display = role === 'employee' ? '' : 'none';
  };
  toggleEmpField();
  $('#ac-role').addEventListener('change', toggleEmpField);

  $('#account-form').addEventListener('submit', ev => {
    ev.preventDefault();
    const fname = $('#ac-fname').value.trim();
    const lname = $('#ac-lname').value.trim();
    const email = $('#ac-email').value.trim().toLowerCase();
    const pw    = $('#ac-pw').value;
    const role  = $('#ac-role').value;
    const empId = $('#ac-emp').value || null;
    let ok = true;
    const setE = (id, msg) => { $('#'+id).textContent = msg; if (msg) ok = false; };
    setE('ac-fname-err', fname ? '' : 'Required');
    setE('ac-lname-err', lname ? '' : 'Required');
    setE('ac-email-err', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Valid email required');
    // Check duplicate email (ignore own email when editing)
    if (State.users.find(x => x.email.toLowerCase() === email && x.id !== u?.id)) {
      setE('ac-email-err', 'An account with this email already exists');
    }
    if (!u && pw.length < 6) setE('ac-pw-err', 'Min 6 characters');
    else if (u && pw && pw.length < 6) setE('ac-pw-err', 'Min 6 characters');
    else setE('ac-pw-err', '');
    if (!ok) return;

    if (u) {
      // Edit existing
      const updated = { ...u, firstName: fname, lastName: lname, email, role, employeeId: role==='employee' ? empId : null };
      if (pw) updated.password = pw;
      State.users = State.users.map(x => x.id === u.id ? updated : x);
      // Update currentUser if editing self
      if (State.currentUser?.id === u.id) State.currentUser = { ...State.currentUser, ...updated };
    } else {
      // Create new
      State.users.push({
        id: genId(),
        firstName: fname, lastName: lname,
        email, password: pw, role,
        employeeId: role === 'employee' ? empId : null,
        createdAt: today(),
      });
    }
    closeModal(); renderView(); renderUserInfo();
    toast(u ? 'Account updated.' : 'Account created.', 'success');
  });
}

/* ─── MY PROFILE (Employee self-service) ─── */
let _profileTab = 'overview';
function renderProfile() {
  const { currentUser } = State;
  const emp = State.employees.find(e=>e.id===currentUser.employeeId);
  if (!emp) return `<div class="empty-state"><div class="empty-title">No employee record linked to this account.</div></div>`;

  const myAtt = State.attendance.filter(a=>a.employeeId===emp.id);
  const myLeaves = State.leaveRequests.filter(l=>l.employeeId===emp.id);
  const presentCnt = myAtt.filter(a=>a.status==='present'||a.status==='late').length;
  const lateCnt = myAtt.filter(a=>a.status==='late').length;
  const leaveDays = myLeaves.filter(l=>l.status==='approved').reduce((s,l)=>s+l.totalDays,0);

  const tabContent = () => {
    if (_profileTab==='attendance') {
      const sorted = [...myAtt].sort((a,b)=>b.date.localeCompare(a.date));
      return `<div class="table-wrap" style="margin-top:0">
        <div style="padding:12px 16px;border-bottom:1px solid var(--gray-100);display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:13px;font-weight:600">Attendance Records</span>
          <button class="btn btn-primary btn-sm" id="btn-log-my-att">Log Attendance</button>
        </div>
        <div class="table-scroll"><table class="data-table">
          <thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th><th>Notes</th><th></th></tr></thead>
          <tbody>
            ${sorted.length===0?`<tr><td colspan="7"><div class="empty-state"><div class="empty-title">No records yet</div></div></td></tr>`:
            sorted.map(r=>`<tr>
              <td>${fmtDate(r.date)}</td><td>${r.clockIn||'—'}</td><td>${r.clockOut||'—'}</td>
              <td>${calcHours(r.clockIn,r.clockOut)}</td>
              <td>${badge(r.status.replace('_',' '),STATUS_BADGES[r.status]||'badge-gray')}</td>
              <td style="font-size:11px;color:var(--gray-400)">${esc(r.notes||'—')}</td>
              <td>${r.clockIn && !r.clockOut
                ? `<button class="row-btn edit" data-id="${r.id}" data-action="edit-att-p" title="Add Clock Out"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`
                : ''}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>`;
    }
    if (_profileTab==='leave') {
      return `<div class="table-wrap" style="margin-top:0">
        <div style="padding:12px 16px;border-bottom:1px solid var(--gray-100);display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:13px;font-weight:600">My Leave Requests</span>
          <button class="btn btn-primary btn-sm" id="btn-req-my-leave">Request Leave</button>
        </div>
        <div class="table-scroll"><table class="data-table">
          <thead><tr><th>Type</th><th>Period</th><th>Days</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
          <tbody>
            ${myLeaves.length===0?`<tr><td colspan="6"><div class="empty-state"><div class="empty-title">No requests yet</div></div></td></tr>`:
            myLeaves.map(l=>`<tr>
              <td>${badgePlain(LEAVE_TYPE_LABELS[l.type]||l.type,LEAVE_TYPE_BADGES[l.type]||'badge-gray')}</td>
              <td style="font-size:12px;white-space:nowrap">${fmtDate(l.startDate)} – ${fmtDate(l.endDate)}</td>
              <td>${l.totalDays}</td>
              <td>${badge(l.status,STATUS_BADGES[l.status]||'badge-gray')}</td>
              <td style="font-size:12px;color:var(--gray-500)">${fmtDate(l.createdAt)}</td>
              <td><button class="row-btn view" data-id="${l.id}" data-action="view-leave-p" title="View"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>`;
    }
    // Overview
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        ${[['Email',emp.email],['Phone',emp.phone],['Address',emp.address,'col-span-2'],['Department',getDeptName(emp.departmentId)],['Role',getRoleTitle(emp.roleId)],['Manager',emp.managerId?getEmpName(emp.managerId):'None'],['Employment',emp.employmentType.replace('_',' ')],['Start Date',fmtDate(emp.startDate)]].map(([l,v,span])=>`
          <div class="card" style="padding:14px;${span?'grid-column:span 2':''}">
            <div style="font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--gray-400);margin-bottom:4px">${esc(l)}</div>
            <div style="font-size:13px;font-weight:500;color:var(--gray-800)">${esc(String(v))}</div>
          </div>`).join('')}
      </div>`;
  };

  return `
  <div style="background:#fff;border-bottom:1px solid var(--gray-200);padding:0 0 0 0;margin:-28px -28px 24px">
    <div style="background:linear-gradient(135deg,#1e1b4b,#3730a3);padding:28px 28px 0;color:#fff">
      <div style="display:flex;align-items:flex-end;gap:20px">
        <div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;border:3px solid rgba(255,255,255,.3)">${initials(emp.firstName,emp.lastName)}</div>
        <div style="flex:1;padding-bottom:16px">
          <div style="font-size:20px;font-weight:700;margin-bottom:4px">${esc(getFullName(emp))}</div>
          <div style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:8px">${esc(getRoleTitle(emp.roleId))} · ${esc(getDeptName(emp.departmentId))}</div>
          <div style="display:flex;gap:8px">${badge(emp.status.replace('_',' '),STATUS_BADGES[emp.status]||'badge-gray')} ${badgePlain(emp.employmentType.replace('_',' '),'badge-indigo')}</div>
        </div>
      </div>
      <div class="tabs" style="border-bottom-color:rgba(255,255,255,.2);margin-bottom:0">
        <button class="tab${_profileTab==='overview'?' active':''}" style="${_profileTab==='overview'?'color:#fff;border-bottom-color:#fff':'color:rgba(255,255,255,.6)'}" data-ptab="overview">Overview</button>
        <button class="tab${_profileTab==='attendance'?' active':''}" style="${_profileTab==='attendance'?'color:#fff;border-bottom-color:#fff':'color:rgba(255,255,255,.6)'}" data-ptab="attendance">Attendance</button>
        <button class="tab${_profileTab==='leave'?' active':''}" style="${_profileTab==='leave'?'color:#fff;border-bottom-color:#fff':'color:rgba(255,255,255,.6)'}" data-ptab="leave">Leave</button>
      </div>
    </div>
    <div style="display:flex;background:#fff;border-bottom:1px solid var(--gray-100)">
      <div style="flex:1;padding:14px;text-align:center;border-right:1px solid var(--gray-100)"><div style="font-size:22px;font-weight:700;color:var(--green-600)">${presentCnt}</div><div style="font-size:10px;color:var(--gray-400);font-weight:600;letter-spacing:.05em;margin-top:2px">DAYS PRESENT</div></div>
      <div style="flex:1;padding:14px;text-align:center;border-right:1px solid var(--gray-100)"><div style="font-size:22px;font-weight:700;color:var(--amber-500)">${lateCnt}</div><div style="font-size:10px;color:var(--gray-400);font-weight:600;letter-spacing:.05em;margin-top:2px">DAYS LATE</div></div>
      <div style="flex:1;padding:14px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--brand-600)">${leaveDays}</div><div style="font-size:10px;color:var(--gray-400);font-weight:600;letter-spacing:.05em;margin-top:2px">LEAVE USED</div></div>
    </div>
  </div>
  ${tabContent()}`;
}

function bindProfile() {
  $$('[data-ptab]').forEach(b=>b.addEventListener('click',()=>{ _profileTab=b.dataset.ptab; renderView(); }));
  $('#btn-log-my-att')?.addEventListener('click', ()=>openAttForm(null));
  $('#btn-req-my-leave')?.addEventListener('click', ()=>openLeaveForm());
  $$('[data-action="view-leave-p"]').forEach(b=>b.addEventListener('click',()=>openLeaveDetail(b.dataset.id)));
  $$('[data-action="edit-att-p"]').forEach(b=>b.addEventListener('click',()=>openAttForm(b.dataset.id)));
}

/* ─── AUTH SCREENS ─── */
function showLoginPanel() {
  $('#panel-login').style.display = 'flex';
}

function initAuth() {
  // Toggle password visibility
  $('#toggle-pw').addEventListener('click', () => {
    const inp = $('#login-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  // Demo account buttons
  $$('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $('#login-email').value = btn.dataset.email;
      $('#login-password').value = btn.dataset.pw;
      $('#login-error').style.display = 'none';
    });
  });

  // Login form
  $('#login-form').addEventListener('submit', ev => {
    ev.preventDefault();
    const email = $('#login-email').value.trim();
    const pw    = $('#login-password').value;
    const emailErr = $('#login-email-err');
    const pwErr    = $('#login-pw-err');
    emailErr.textContent = '';
    pwErr.textContent    = '';
    let ok = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailErr.textContent = 'Valid email required'; ok = false; }
    if (!pw || pw.length < 6) { pwErr.textContent = 'Password must be 6+ characters'; ok = false; }
    if (!ok) return;

    const res = login(email, pw);
    if (!res.ok) {
      $('#login-error').textContent = res.error;
      $('#login-error').style.display = 'flex';
    } else {
      $('#login-error').style.display = 'none';
      renderApp();
    }
  });

  // Register form — removed (admin-only user creation via Settings)

  // go-register and go-login links removed
}

/* ─── MOBILE NAV ─── */
function initMobileNav() {
  let overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebar-overlay';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', closeMobileNav);
}
function openMobileNav()  { $('#sidebar').classList.add('open'); $('#sidebar-overlay').classList.add('open'); }
function closeMobileNav() { $('#sidebar').classList.remove('open'); $('#sidebar-overlay').classList.remove('open'); }

/* ─── MODAL EVENTS ─── */
function initModals() {
  // Use event delegation so the X button works even after modal content is replaced
  $('#modal-overlay').addEventListener('click', e => {
    if (e.target === $('#modal-overlay') || e.target.closest('#modal-close')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeConfirm(); } });
  $('#confirm-cancel').addEventListener('click', closeConfirm);
  $('#confirm-ok').addEventListener('click', () => { if (_confirmCb) { _confirmCb(); } });
  $('#confirm-overlay').addEventListener('click', e => { if (e.target === $('#confirm-overlay')) closeConfirm(); });
}

/* ─── GLOBAL SEARCH ─── */
function initGlobalSearch() {
  // Search bar removed — function kept as no-op for boot compatibility
}

/* ─── LOGOUT ─── */
function initLogout() {
  $('#btn-logout').addEventListener('click', () => {
    logout();
    _empSearch = ''; _empDept = ''; _empStatus = '';
    _leaveStatus = ''; _leaveType = '';
    _attDate = today(); _attEmpFilter = '';
    _rolesFilter = '';
    _profileTab = 'overview';
  });
}

/* ─── BOOT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initMobileNav();
  initModals();
  initGlobalSearch();
  initLogout();
  renderApp();
});
