const courses = [
  { id: 'econometrics', code: 'MAE 202', title: 'Econometrics II', professor: 'Elena Tuzhilina', color: '#2f6f9f', progress: 62, students: 74, staff: 4 },
  { id: 'micro', code: 'MAE 204', title: 'Microeconomics II', professor: 'NES Faculty', color: '#9a5c44', progress: 48, students: 71, staff: 3 },
  { id: 'algorithms', code: 'DATA 210', title: 'Algorithms', professor: 'Course Staff', color: '#467b63', progress: 74, students: 39, staff: 3 },
  { id: 'trade', code: 'MAE 216', title: 'International Trade', professor: 'NES Faculty', color: '#745d9d', progress: 35, students: 52, staff: 2 }
];

const assignments = [
  { id: 1, title: 'Problem Set 3: Instrumental Variables', course: 'Econometrics II', courseId: 'econometrics', dueDay: '18', dueMonth: 'SEP', due: 'Sep 18, 23:59', points: '20 pts', status: 'open', submitted: 61, total: 74, graded: 0 },
  { id: 2, title: 'Problem Set 2: General Equilibrium', course: 'Microeconomics II', courseId: 'micro', dueDay: '20', dueMonth: 'SEP', due: 'Sep 20, 23:59', points: '15 pts', status: 'open', submitted: 43, total: 71, graded: 0 },
  { id: 3, title: 'Sorting and Two Pointers', course: 'Algorithms', courseId: 'algorithms', dueDay: '22', dueMonth: 'SEP', due: 'Sep 22, 19:00', points: '10 pts', status: 'submitted', submitted: 31, total: 39, graded: 12 },
  { id: 4, title: 'Trade Model Replication', course: 'International Trade', courseId: 'trade', dueDay: '27', dueMonth: 'SEP', due: 'Sep 27, 23:59', points: '25 pts', status: 'open', submitted: 9, total: 52, graded: 0 },
  { id: 5, title: 'Problem Set 2: Panel Data', course: 'Econometrics II', courseId: 'econometrics', dueDay: '11', dueMonth: 'SEP', due: 'Sep 11, 23:59', points: '20 pts', status: 'graded', grade: '18.5/20', submitted: 73, total: 74, graded: 73 }
];

const announcements = [
  { course: 'Econometrics II', title: 'Office hours moved to Friday', text: 'This week only, office hours will be held Friday at 15:00 in room 403.', time: '2 hours ago' },
  { course: 'Algorithms', title: 'Seminar materials are available', text: 'Slides and Python solutions from the sorting seminar have been uploaded.', time: 'Yesterday' },
  { course: 'International Trade', title: 'Reading for next week', text: 'Please read the selected sections before Tuesday’s lecture.', time: 'Sep 12' }
];

const courseModules = {
  econometrics: [
    { n: '01', title: 'Review and asymptotics', subtitle: 'Week 1', resources: [['Lecture notes', 'PDF'], ['Recitation problems', 'PDF'], ['Dataset: review.csv', 'DATA']] },
    { n: '02', title: 'Instrumental variables', subtitle: 'Weeks 2–3', resources: [['Lecture 2: IV estimation', 'SLIDES'], ['Weak instruments notes', 'PDF'], ['Problem Set 3', 'ASSIGNMENT']] },
    { n: '03', title: 'Panel data', subtitle: 'Week 4', resources: [['Fixed effects and random effects', 'SLIDES'], ['Replication notebook', 'CODE']] }
  ],
  micro: [
    { n: '01', title: 'General equilibrium', subtitle: 'Weeks 1–2', resources: [['Lecture notes', 'PDF'], ['Exercises', 'PDF']] },
    { n: '02', title: 'Welfare and efficiency', subtitle: 'Week 3', resources: [['Lecture slides', 'SLIDES'], ['Problem Set 2', 'ASSIGNMENT']] }
  ],
  algorithms: [
    { n: '01', title: 'Sorting', subtitle: 'Week 1', resources: [['Sorting handbook', 'WEB'], ['Seminar slides', 'PDF'], ['Practice set', 'ASSIGNMENT']] },
    { n: '02', title: 'Two pointers', subtitle: 'Week 2', resources: [['Technique notes', 'WEB'], ['Problems', 'ASSIGNMENT']] }
  ],
  trade: [
    { n: '01', title: 'Ricardian trade', subtitle: 'Week 1', resources: [['Lecture 1', 'SLIDES'], ['Reading', 'PDF']] },
    { n: '02', title: 'Gravity models', subtitle: 'Weeks 2–3', resources: [['Lecture notes', 'PDF'], ['Replication task', 'ASSIGNMENT']] }
  ]
};

const roster = [
  ['Anna Smirnova', 'anna.smirnova@nes.ru', '19.0', '96%'],
  ['Mikhail Orlov', 'mikhail.orlov@nes.ru', '17.5', '92%'],
  ['Sofia Petrova', 'sofia.petrova@nes.ru', '18.5', '98%'],
  ['Daniel Kim', 'daniel.kim@nes.ru', '16.0', '90%'],
  ['Leila Aliyeva', 'leila.aliyeva@nes.ru', '20.0', '100%'],
  ['Roman Volkov', 'roman.volkov@nes.ru', '—', '74%']
];

const users = {
  student: { name: 'A. Student', role: 'MAE · Year 2', avatar: 'AS', greeting: 'Good morning.' },
  ta: { name: 'A. Teaching Assistant', role: 'Teaching Assistant', avatar: 'AT', greeting: 'Teaching workspace' },
  instructor: { name: 'A. Instructor', role: 'Instructor', avatar: 'AI', greeting: 'Teaching workspace' }
};

const state = {
  route: 'dashboard',
  courseId: null,
  assignmentFilter: 'all',
  role: 'student',
  loggedIn: false
};

const app = document.getElementById('appContent');
const breadcrumbs = document.getElementById('breadcrumbs');
const sidebarCourses = document.getElementById('sidebarCourses');
const loginScreen = document.getElementById('loginScreen');
const appShell = document.getElementById('appShell');

function courseById(id) { return courses.find(c => c.id === id); }
function assignmentById(id) { return assignments.find(a => a.id === Number(id)); }
function isStaff() { return state.role === 'ta' || state.role === 'instructor'; }
function statusLabel(status) { return ({ open: 'Open', submitted: 'Submitted', graded: 'Graded', late: 'Late' })[status] || status; }

function setLoggedIn(role = 'student') {
  state.loggedIn = true;
  state.role = role;
  loginScreen.classList.add('hidden');
  appShell.classList.remove('hidden');
  updateRoleChrome();
  navigate(role === 'student' ? 'dashboard' : 'teaching');
}

function signOut() {
  state.loggedIn = false;
  appShell.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

function updateRoleChrome() {
  const user = users[state.role];
  document.getElementById('profileAvatar').textContent = user.avatar;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileRole').textContent = user.role;
  document.getElementById('sidebarCourseLabel').textContent = isStaff() ? 'Teaching courses' : 'Current courses';
  document.querySelectorAll('.staff-nav').forEach(el => el.classList.toggle('hidden', !isStaff()));
  document.querySelectorAll('#roleSwitcher button').forEach(btn => btn.classList.toggle('active', btn.dataset.role === state.role));
  renderSidebarCourses();
}

function renderSidebarCourses() {
  sidebarCourses.innerHTML = courses.map(c => `
    <button class="course-mini" data-course="${c.id}">
      <span class="course-dot" style="background:${c.color}"></span>
      <span>${c.title}</span>
    </button>`).join('');
}

function setActiveNav(route) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.route === route));
}

function navigate(route, courseId = null) {
  state.route = route;
  state.courseId = courseId;
  if (!isStaff() && route === 'teaching') state.route = 'dashboard';
  setActiveNav(state.route);
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function pageHeader(eyebrow, title, subtitle, action = '') {
  return `<div class="page-header">
    <div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}</div>
    ${action}
  </div>`;
}

function metricCard(value, label, meta = '') {
  return `<div class="metric-card"><div class="metric-value">${value}</div><div class="metric-label">${label}</div>${meta ? `<div class="metric-meta">${meta}</div>` : ''}</div>`;
}

function courseCards(staff = false) {
  return `<div class="course-grid">${courses.map(c => `
    <article class="course-card" data-course="${c.id}">
      <div class="course-accent" style="background:${c.color}"></div>
      <div class="course-code">${c.code}</div>
      <h3>${c.title}</h3>
      <div class="course-professor">${staff ? `${c.students} students · ${c.staff} staff` : c.professor}</div>
      <div class="course-progress">
        <div class="progress-meta"><span>${staff ? 'Teaching period' : 'Course progress'}</span><span>${c.progress}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${c.progress}%; background:${c.color}"></div></div>
      </div>
    </article>`).join('')}</div>`;
}

function assignmentRows(items, limit = null, staff = false) {
  const list = limit ? items.slice(0, limit) : items;
  return `<div class="assignment-list">${list.map(a => `
    <div class="assignment-row" data-assignment="${a.id}">
      <div class="due-badge"><strong>${a.dueDay}</strong><span>${a.dueMonth}</span></div>
      <div>
        <div class="assignment-title">${a.title}</div>
        <div class="assignment-course">${a.course} · ${a.points}${staff ? ` · ${a.submitted}/${a.total} submitted` : ''}</div>
      </div>
      <span class="status-pill ${staff ? 'status-neutral' : `status-${a.status}`}">${staff ? `${a.graded}/${a.total} graded` : statusLabel(a.status)}</span>
    </div>`).join('')}</div>`;
}

function renderStudentDashboard() {
  breadcrumbs.textContent = 'Dashboard';
  const upcoming = assignments.filter(a => a.status === 'open' || a.status === 'submitted');
  app.innerHTML = `
    ${pageHeader('Fall 2026', users.student.greeting, 'Here is what is happening across your courses.')}
    <div class="dashboard-grid">
      <div class="stack">
        <section class="hero-card">
          <div class="hero-kicker">Next deadline</div>
          <h2>Problem Set 3: Instrumental Variables</h2>
          <div class="hero-meta"><span>Econometrics II</span><span>Due Sep 18 · 23:59</span><span>20 points</span></div>
          <button class="hero-action" data-assignment="1">Open assignment →</button>
        </section>
        <section class="section-card">
          <div class="section-heading"><div><h2>Upcoming assignments</h2><p>Your next deadlines across all courses</p></div><button class="text-button" data-route="assignments">View all</button></div>
          ${assignmentRows(upcoming, 4)}
        </section>
        <section class="section-card">
          <div class="section-heading"><div><h2>Your courses</h2><p>Four active courses this term</p></div><button class="text-button" data-route="courses">All courses</button></div>
          ${courseCards(false)}
        </section>
      </div>
      <aside class="stack">
        <section class="section-card">
          <div class="section-heading"><div><h2>This term</h2><p>At a glance</p></div></div>
          <div class="stat-grid"><div class="stat-card"><div class="stat-number">4</div><div class="stat-label">Courses</div></div><div class="stat-card"><div class="stat-number">3</div><div class="stat-label">Open tasks</div></div><div class="stat-card"><div class="stat-number">92%</div><div class="stat-label">Submitted</div></div></div>
        </section>
        <section class="section-card">
          <div class="section-heading"><div><h2>Announcements</h2><p>Latest course updates</p></div></div>
          <div class="announcement-list">${announcements.map(a => `<article class="announcement"><h3>${a.title}</h3><p>${a.text}</p><time>${a.course} · ${a.time}</time></article>`).join('')}</div>
        </section>
      </aside>
    </div>`;
}

function renderTeachingDashboard() {
  breadcrumbs.textContent = 'Teaching';
  const pending = assignments.filter(a => a.submitted > a.graded).sort((a, b) => (b.submitted - b.graded) - (a.submitted - a.graded));
  app.innerHTML = `
    ${pageHeader('Fall 2026', users[state.role].greeting, state.role === 'ta' ? 'Review submissions, grade work and keep course delivery moving.' : 'Manage courses, assignments, grading and communication.', '<button class="primary-button" data-action="new-assignment">+ New assignment</button>')}
    <div class="metric-grid">
      ${metricCard('4', 'Active courses', '236 total enrollments')}
      ${metricCard('91', 'Awaiting grading', 'Across 3 assignments')}
      ${metricCard('6', 'Upcoming deadlines', 'Next 14 days')}
      ${metricCard('97%', 'Submission rate', 'Current term')}
    </div>
    <div class="dashboard-grid teaching-grid">
      <div class="stack">
        <section class="section-card">
          <div class="section-heading"><div><h2>Needs attention</h2><p>Assignments with ungraded submissions</p></div><button class="text-button" data-route="assignments">All assignments</button></div>
          ${assignmentRows(pending, 4, true)}
        </section>
        <section class="section-card">
          <div class="section-heading"><div><h2>Your teaching</h2><p>Courses you can manage this term</p></div><button class="text-button" data-route="courses">View courses</button></div>
          ${courseCards(true)}
        </section>
      </div>
      <aside class="stack">
        <section class="section-card">
          <div class="section-heading"><div><h2>Today</h2><p>Monday, September 14</p></div></div>
          <div class="timeline">
            <div><span>10:30</span><strong>Econometrics II lecture</strong><small>Room 403</small></div>
            <div><span>15:00</span><strong>Office hours</strong><small>Faculty office</small></div>
            <div><span>18:00</span><strong>Algorithms seminar</strong><small>Online</small></div>
          </div>
        </section>
        <section class="section-card">
          <div class="section-heading"><div><h2>Quick actions</h2><p>Common teaching tasks</p></div></div>
          <div class="quick-actions">
            <button data-action="new-announcement">Post announcement <span>→</span></button>
            <button data-route="grades">Open gradebook <span>→</span></button>
            <button data-action="new-material">Upload material <span>→</span></button>
          </div>
        </section>
      </aside>
    </div>`;
}

function renderCourses() {
  breadcrumbs.textContent = 'Courses';
  app.innerHTML = `${pageHeader('Fall 2026', isStaff() ? 'Teaching courses' : 'Courses', isStaff() ? 'Courses where you have teaching access.' : 'Everything you are enrolled in this term.')}
    <section class="section-card">${courseCards(isStaff())}</section>`;
}

function renderCourse(courseId) {
  const c = courseById(courseId) || courses[0];
  const modules = courseModules[c.id] || [];
  breadcrumbs.textContent = `Courses / ${c.title}`;
  const staffControls = isStaff() ? `<div class="course-admin-bar"><div><strong>Course management</strong><span>${state.role === 'ta' ? 'TA access' : 'Instructor access'}</span></div><div><button class="secondary-button" data-action="new-material">+ Material</button><button class="secondary-button" data-action="new-announcement">Announcement</button><button class="primary-button" data-action="new-assignment">+ Assignment</button></div></div>` : '';
  app.innerHTML = `
    <section class="course-hero" style="--course-color:${c.color}">
      <div class="course-hero-top">
        <div><div class="eyebrow">${c.code} · Fall 2026</div><h1>${c.title}</h1><p class="page-subtitle">${c.professor}</p></div>
        <button class="secondary-button">Course syllabus</button>
      </div>
      <div class="course-tabs">
        <button class="course-tab active">Overview</button><button class="course-tab">Materials</button><button class="course-tab">Assignments</button><button class="course-tab">${isStaff() ? 'Gradebook' : 'Grades'}</button><button class="course-tab">People</button>
      </div>
    </section>
    ${staffControls}
    <div class="dashboard-grid">
      <section class="section-card">
        <div class="section-heading"><div><h2>Course materials</h2><p>Organized by teaching week</p></div>${isStaff() ? '<button class="text-button" data-action="reorder">Reorder</button>' : ''}</div>
        <div class="module-list">${modules.map(m => `<article class="module-card">
          <div class="module-header"><div class="module-number">${m.n}</div><div><h3>${m.title}</h3><p>${m.subtitle}</p></div><span>⌄</span></div>
          ${m.resources.map(r => `<div class="resource-row"><span class="resource-icon">↳</span><span>${r[0]}</span><span class="resource-type">${r[1]}</span>${isStaff() ? '<button class="resource-menu">•••</button>' : ''}</div>`).join('')}
        </article>`).join('')}</div>
      </section>
      <aside class="stack">
        <section class="section-card"><div class="section-heading"><div><h2>${isStaff() ? 'Enrollment' : 'Course progress'}</h2><p>${isStaff() ? `${c.students} students · ${c.staff} staff` : `${c.progress}% complete`}</p></div></div>${isStaff() ? `<div class="enrollment-numbers"><strong>${c.students}</strong><span>active students</span></div>` : `<div class="progress-track" style="height:8px"><div class="progress-fill" style="width:${c.progress}%;background:${c.color}"></div></div>`}</section>
        <section class="section-card"><div class="section-heading"><div><h2>Assignments</h2><p>${isStaff() ? 'Submission progress' : 'Work for this course'}</p></div></div>${assignmentRows(assignments.filter(a => a.courseId === c.id), 3, isStaff())}</section>
      </aside>
    </div>`;
}

function renderAssignments() {
  breadcrumbs.textContent = 'Assignments';
  const filter = state.assignmentFilter;
  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);
  app.innerHTML = `${pageHeader('Coursework', 'Assignments', isStaff() ? 'Create, monitor and grade coursework across your courses.' : 'Track everything due across your courses.', isStaff() ? '<button class="primary-button" data-action="new-assignment">+ New assignment</button>' : '')}
    <section class="section-card">
      <div class="list-toolbar"><div class="filter-group">${['all','open','submitted','graded'].map(f => `<button class="filter-chip ${filter === f ? 'active' : ''}" data-filter="${f}">${f[0].toUpperCase()+f.slice(1)}</button>`).join('')}</div></div>
      ${assignmentRows(filtered, null, isStaff())}
    </section>`;
}

function renderStudentGrades() {
  const rows = [
    ['Econometrics II', 'Problem Set 1', '19/20', '95%'],
    ['Econometrics II', 'Problem Set 2', '18.5/20', '92.5%'],
    ['Microeconomics II', 'Problem Set 1', '14/15', '93.3%'],
    ['Algorithms', 'Sorting quiz', '10/10', '100%'],
    ['International Trade', 'Problem Set 1', '—', 'Pending']
  ];
  app.innerHTML = `${pageHeader('Performance', 'Grades', 'A single place for results from all current courses.')}
    <section class="section-card"><table class="data-table"><thead><tr><th>Course</th><th>Assessment</th><th>Score</th><th>Result</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td><div class="table-title">${r[0]}</div></td><td>${r[1]}</td><td class="grade ${r[2] === '—' ? 'grade-muted' : ''}">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}
    </tbody></table></section>`;
}

function renderGradebook() {
  app.innerHTML = `${pageHeader('Teaching', 'Gradebook', 'Econometrics II · Problem Set 2: Panel Data', '<div class="header-actions"><button class="secondary-button">Export CSV</button><button class="primary-button">Publish grades</button></div>')}
    <div class="gradebook-summary">
      ${metricCard('73/74', 'Submitted', '98.6%')}
      ${metricCard('73', 'Graded', '1 remaining')}
      ${metricCard('17.8', 'Mean score', 'out of 20')}
      ${metricCard('19.1', 'Median', 'out of 20')}
    </div>
    <section class="section-card gradebook-card">
      <div class="gradebook-toolbar"><div><strong>Student submissions</strong><span>Autosaved prototype view</span></div><input class="table-search" placeholder="Search students…" /></div>
      <div class="table-scroll"><table class="data-table editable-table"><thead><tr><th>Student</th><th>Email</th><th>Score / 20</th><th>Submitted</th><th>Status</th></tr></thead><tbody>
      ${roster.map((r, i) => `<tr><td><div class="student-cell"><span class="mini-avatar">${r[0].split(' ').map(x=>x[0]).join('')}</span><strong>${r[0]}</strong></div></td><td>${r[1]}</td><td><input class="grade-input" value="${r[2]}" aria-label="Grade for ${r[0]}" /></td><td>${r[3]}</td><td><span class="status-pill ${i === 5 ? 'status-open' : 'status-graded'}">${i === 5 ? 'Missing' : 'Graded'}</span></td></tr>`).join('')}
      </tbody></table></div>
    </section>`;
}

function renderGrades() {
  breadcrumbs.textContent = isStaff() ? 'Gradebook' : 'Grades';
  if (isStaff()) renderGradebook(); else renderStudentGrades();
}

function renderCalendar() {
  breadcrumbs.textContent = 'Calendar';
  const days = Array.from({length: 35}, (_, i) => i - 1);
  const events = { 18:'Econometrics PS 3', 20:'Microeconomics PS 2', 22:'Algorithms assignment', 27:'Trade replication' };
  app.innerHTML = `${pageHeader('September 2026', 'Calendar', isStaff() ? 'Teaching sessions, office hours and assessment deadlines.' : 'Lectures, seminars and deadlines in one view.', '<button class="secondary-button">Today</button>')}
    <div class="calendar-grid">
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<div class="calendar-head">${d}</div>`).join('')}
      ${days.map(d => `<div class="calendar-day ${d === 14 ? 'today' : ''}"><div class="calendar-date">${d > 0 && d <= 30 ? d : ''}</div>${events[d] ? `<div class="calendar-event">${events[d]}</div>` : ''}</div>`).join('')}
    </div>`;
}

function renderAssignmentDetail(id) {
  const a = assignmentById(id);
  if (!a) return renderAssignments();
  breadcrumbs.textContent = `Assignments / ${a.title}`;
  if (isStaff()) {
    const outstanding = a.submitted - a.graded;
    app.innerHTML = `${pageHeader(a.course, a.title, `Due ${a.due} · ${a.points}`, '<div class="header-actions"><button class="secondary-button">Edit assignment</button><button class="primary-button" data-route="grades">Open grading</button></div>')}
      <div class="metric-grid compact-metrics">
        ${metricCard(`${a.submitted}/${a.total}`, 'Submitted', `${Math.round((a.submitted/a.total)*100)}% of class`)}
        ${metricCard(`${a.graded}/${a.total}`, 'Graded', `${Math.max(0, outstanding)} waiting`)}
        ${metricCard(a.points.replace(' pts',''), 'Points', 'Maximum score')}
        ${metricCard(a.dueDay, 'Due date', `${a.dueMonth} · 23:59`)}
      </div>
      <div class="dashboard-grid">
        <section class="section-card"><div class="section-heading"><div><h2>Assignment brief</h2><p>Visible to students</p></div><button class="text-button">Edit</button></div><div class="prose-block"><p>Complete the assigned problems and submit one PDF containing your derivations, interpretation and supporting calculations.</p><h3>Submission requirements</h3><p>PDF format · maximum 20 MB · one submission per student · resubmission allowed until deadline.</p><div class="attachment-row"><span>PDF</span><div><strong>problem-set.pdf</strong><small>Assignment handout · 482 KB</small></div><button>Download</button></div></div></section>
        <aside class="stack"><section class="section-card"><div class="section-heading"><div><h2>Submission progress</h2><p>${a.submitted} of ${a.total}</p></div></div><div class="progress-track" style="height:10px"><div class="progress-fill" style="width:${Math.round((a.submitted/a.total)*100)}%"></div></div><button class="primary-button full-width" data-route="grades">Grade submissions</button></section></aside>
      </div>`;
  } else {
    app.innerHTML = `${pageHeader(a.course, a.title, `Due ${a.due} · ${a.points}`, `<span class="status-pill status-${a.status}">${statusLabel(a.status)}</span>`)}
      <div class="dashboard-grid">
        <section class="section-card"><div class="section-heading"><div><h2>Instructions</h2><p>Read the full brief before submitting</p></div></div><div class="prose-block"><p>Complete the assigned problems and submit one PDF containing your derivations, interpretation and supporting calculations.</p><h3>Submission requirements</h3><p>PDF format · maximum 20 MB · one submission per student · resubmission allowed until deadline.</p><div class="attachment-row"><span>PDF</span><div><strong>problem-set.pdf</strong><small>Assignment handout · 482 KB</small></div><button>Download</button></div></div></section>
        <aside class="stack"><section class="section-card submission-card"><div class="section-heading"><div><h2>Your submission</h2><p>${a.status === 'submitted' || a.status === 'graded' ? 'Submission received' : 'Nothing submitted yet'}</p></div></div><div class="upload-zone"><span>↑</span><strong>Drop a PDF here</strong><small>or choose a file from your device</small><button class="secondary-button">Choose file</button></div><button class="primary-button full-width">Submit assignment</button></section></aside>
      </div>`;
  }
}

function renderProfile() {
  const u = users[state.role];
  breadcrumbs.textContent = 'Profile';
  app.innerHTML = `${pageHeader('Account', u.name, u.role)}
    <div class="profile-page-grid"><section class="section-card"><div class="profile-hero"><div class="large-avatar">${u.avatar}</div><div><h2>${u.name}</h2><p>${state.role === 'student' ? 'MAE programme · 2025–2027' : 'New Economic School · Fall 2026'}</p></div></div><div class="settings-list"><div><span>Email</span><strong>${state.role}@nes.ru</strong></div><div><span>Interface language</span><strong>English</strong></div><div><span>Notifications</span><strong>Email + LMS</strong></div></div></section><aside class="section-card"><h2>Prototype session</h2><p class="page-subtitle">Switch roles from the top bar to preview permissions.</p><button class="secondary-button full-width" data-action="sign-out">Sign out</button></aside></div>`;
}

function renderPlaceholderAction(label) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<strong>${label}</strong><span>This control is wired for the prototype; persistence comes with the backend phase.</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 220); }, 2600);
}

function render() {
  if (!state.loggedIn) return;
  if (state.route === 'dashboard') return isStaff() ? renderTeachingDashboard() : renderStudentDashboard();
  if (state.route === 'teaching') return renderTeachingDashboard();
  if (state.route === 'courses') return renderCourses();
  if (state.route === 'course') return renderCourse(state.courseId);
  if (state.route === 'assignments') return renderAssignments();
  if (state.route === 'assignment') return renderAssignmentDetail(state.assignmentId);
  if (state.route === 'grades') return renderGrades();
  if (state.route === 'calendar') return renderCalendar();
  if (state.route === 'profile') return renderProfile();
  return renderStudentDashboard();
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('visible');
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarBackdrop').classList.add('visible');
}

function openSearch() {
  document.getElementById('commandPalette').classList.remove('hidden');
  const input = document.getElementById('commandInput');
  input.value = '';
  renderSearchResults('');
  setTimeout(() => input.focus(), 20);
}

function closeSearch() {
  document.getElementById('commandPalette').classList.add('hidden');
}

function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  const items = [
    ...courses.map(c => ({ type:'Course', title:c.title, meta:c.code, courseId:c.id })),
    ...assignments.map(a => ({ type:'Assignment', title:a.title, meta:a.course, assignmentId:a.id })),
    ...Object.entries(courseModules).flatMap(([courseId, modules]) => modules.flatMap(m => m.resources.map(r => ({ type:r[1], title:r[0], meta:courseById(courseId).title, courseId }))))
  ].filter(x => !q || `${x.title} ${x.meta} ${x.type}`.toLowerCase().includes(q)).slice(0, 9);
  document.getElementById('commandResults').innerHTML = items.length ? items.map(x => `<button class="command-result" ${x.assignmentId ? `data-assignment="${x.assignmentId}"` : `data-course="${x.courseId}"`}><span class="command-result-type">${x.type}</span><span><strong>${x.title}</strong><small>${x.meta}</small></span><span>↗</span></button>`).join('') : '<div class="empty-search">No results found.</div>';
}

function changeRole(role) {
  if (!users[role] || role === state.role) return;
  state.role = role;
  updateRoleChrome();
  navigate(role === 'student' ? 'dashboard' : 'teaching');
}

document.addEventListener('click', (e) => {
  const loginRole = e.target.closest('[data-login-role]');
  if (loginRole) return setLoggedIn(loginRole.dataset.loginRole);

  if (e.target.closest('#signInButton')) return setLoggedIn('student');

  const role = e.target.closest('[data-role]');
  if (role) return changeRole(role.dataset.role);

  const route = e.target.closest('[data-route]');
  if (route) return navigate(route.dataset.route);

  const course = e.target.closest('[data-course]');
  if (course) { closeSearch(); return navigate('course', course.dataset.course); }

  const assignment = e.target.closest('[data-assignment]');
  if (assignment) { closeSearch(); state.assignmentId = Number(assignment.dataset.assignment); return navigate('assignment'); }

  const filter = e.target.closest('[data-filter]');
  if (filter) { state.assignmentFilter = filter.dataset.filter; return renderAssignments(); }

  const action = e.target.closest('[data-action]');
  if (action) {
    if (action.dataset.action === 'sign-out') return signOut();
    return renderPlaceholderAction(action.textContent.trim());
  }

  if (e.target.closest('#openSidebar')) return openSidebar();
  if (e.target.closest('#closeSidebar') || e.target.closest('#sidebarBackdrop')) return closeSidebar();
  if (e.target.closest('#searchButton')) return openSearch();
  if (e.target.id === 'commandPalette') return closeSearch();
});

document.getElementById('commandInput').addEventListener('input', e => renderSearchResults(e.target.value));

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape') closeSearch();
});

renderSidebarCourses();
