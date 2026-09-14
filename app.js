const courses = [
  { id: 'econometrics', code: 'MAE 202', title: 'Econometrics II', professor: 'Elena Tuzhilina', color: '#2f6f9f', progress: 62 },
  { id: 'micro', code: 'MAE 204', title: 'Microeconomics II', professor: 'NES Faculty', color: '#9a5c44', progress: 48 },
  { id: 'algorithms', code: 'DATA 210', title: 'Algorithms', professor: 'Course Staff', color: '#467b63', progress: 74 },
  { id: 'trade', code: 'MAE 216', title: 'International Trade', professor: 'NES Faculty', color: '#745d9d', progress: 35 }
];

const assignments = [
  { id: 1, title: 'Problem Set 3: Instrumental Variables', course: 'Econometrics II', courseId: 'econometrics', dueDay: '18', dueMonth: 'SEP', due: 'Sep 18, 23:59', points: '20 pts', status: 'open' },
  { id: 2, title: 'Problem Set 2: General Equilibrium', course: 'Microeconomics II', courseId: 'micro', dueDay: '20', dueMonth: 'SEP', due: 'Sep 20, 23:59', points: '15 pts', status: 'open' },
  { id: 3, title: 'Sorting and Two Pointers', course: 'Algorithms', courseId: 'algorithms', dueDay: '22', dueMonth: 'SEP', due: 'Sep 22, 19:00', points: '10 pts', status: 'submitted' },
  { id: 4, title: 'Trade Model Replication', course: 'International Trade', courseId: 'trade', dueDay: '27', dueMonth: 'SEP', due: 'Sep 27, 23:59', points: '25 pts', status: 'open' },
  { id: 5, title: 'Problem Set 2: Panel Data', course: 'Econometrics II', courseId: 'econometrics', dueDay: '11', dueMonth: 'SEP', due: 'Sep 11, 23:59', points: '20 pts', status: 'graded', grade: '18.5/20' }
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

const state = { route: 'dashboard', courseId: null, assignmentFilter: 'all' };
const app = document.getElementById('appContent');
const breadcrumbs = document.getElementById('breadcrumbs');
const sidebarCourses = document.getElementById('sidebarCourses');

function courseById(id) { return courses.find(c => c.id === id); }
function statusLabel(status) { return ({ open: 'Open', submitted: 'Submitted', graded: 'Graded', late: 'Late' })[status] || status; }

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
  setActiveNav(route);
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

function courseCards() {
  return `<div class="course-grid">${courses.map(c => `
    <article class="course-card" data-course="${c.id}">
      <div class="course-accent" style="background:${c.color}"></div>
      <div class="course-code">${c.code}</div>
      <h3>${c.title}</h3>
      <div class="course-professor">${c.professor}</div>
      <div class="course-progress">
        <div class="progress-meta"><span>Course progress</span><span>${c.progress}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${c.progress}%; background:${c.color}"></div></div>
      </div>
    </article>`).join('')}</div>`;
}

function assignmentRows(items, limit = null) {
  const list = limit ? items.slice(0, limit) : items;
  return `<div class="assignment-list">${list.map(a => `
    <div class="assignment-row" data-assignment="${a.id}">
      <div class="due-badge"><strong>${a.dueDay}</strong><span>${a.dueMonth}</span></div>
      <div>
        <div class="assignment-title">${a.title}</div>
        <div class="assignment-course">${a.course} · ${a.points}</div>
      </div>
      <span class="status-pill status-${a.status}">${statusLabel(a.status)}</span>
    </div>`).join('')}</div>`;
}

function renderDashboard() {
  breadcrumbs.textContent = 'Dashboard';
  const upcoming = assignments.filter(a => a.status === 'open' || a.status === 'submitted');
  app.innerHTML = `
    ${pageHeader('Fall 2026', 'Good morning.', 'Here is what is happening across your courses.')}
    <div class="dashboard-grid">
      <div class="stack">
        <section class="hero-card">
          <div class="hero-kicker">Next deadline</div>
          <h2>Problem Set 3: Instrumental Variables</h2>
          <div class="hero-meta"><span>Econometrics II</span><span>Due Sep 18 · 23:59</span><span>20 points</span></div>
        </section>

        <section class="section-card">
          <div class="section-heading"><div><h2>Upcoming assignments</h2><p>Your next deadlines across all courses</p></div><button class="text-button" data-route="assignments">View all</button></div>
          ${assignmentRows(upcoming, 4)}
        </section>

        <section class="section-card">
          <div class="section-heading"><div><h2>Your courses</h2><p>Four active courses this term</p></div><button class="text-button" data-route="courses">All courses</button></div>
          ${courseCards()}
        </section>
      </div>

      <aside class="stack">
        <section class="section-card">
          <div class="section-heading"><div><h2>This term</h2><p>At a glance</p></div></div>
          <div class="stat-grid">
            <div class="stat-card"><div class="stat-number">4</div><div class="stat-label">Courses</div></div>
            <div class="stat-card"><div class="stat-number">3</div><div class="stat-label">Open tasks</div></div>
            <div class="stat-card"><div class="stat-number">92%</div><div class="stat-label">Submitted</div></div>
          </div>
        </section>
        <section class="section-card">
          <div class="section-heading"><div><h2>Announcements</h2><p>Latest course updates</p></div></div>
          <div class="announcement-list">${announcements.map(a => `<article class="announcement"><h3>${a.title}</h3><p>${a.text}</p><time>${a.course} · ${a.time}</time></article>`).join('')}</div>
        </section>
      </aside>
    </div>`;
}

function renderCourses() {
  breadcrumbs.textContent = 'Courses';
  app.innerHTML = `${pageHeader('Fall 2026', 'Courses', 'Everything you are enrolled in this term.')}
    <section class="section-card">${courseCards()}</section>`;
}

function renderCourse(courseId) {
  const c = courseById(courseId) || courses[0];
  const modules = courseModules[c.id] || [];
  breadcrumbs.textContent = `Courses / ${c.title}`;
  app.innerHTML = `
    <section class="course-hero" style="--course-color:${c.color}">
      <div class="course-hero-top">
        <div><div class="eyebrow">${c.code} · Fall 2026</div><h1>${c.title}</h1><p class="page-subtitle">${c.professor}</p></div>
        <button class="secondary-button">Course syllabus</button>
      </div>
      <div class="course-tabs">
        <button class="course-tab active">Overview</button><button class="course-tab">Materials</button><button class="course-tab">Assignments</button><button class="course-tab">Grades</button><button class="course-tab">People</button>
      </div>
    </section>
    <div style="height:20px"></div>
    <div class="dashboard-grid">
      <section class="section-card">
        <div class="section-heading"><div><h2>Course materials</h2><p>Organized by teaching week</p></div></div>
        <div class="module-list">${modules.map(m => `<article class="module-card">
          <div class="module-header"><div class="module-number">${m.n}</div><div><h3>${m.title}</h3><p>${m.subtitle}</p></div><span>⌄</span></div>
          ${m.resources.map(r => `<div class="resource-row"><span class="resource-icon">↳</span><span>${r[0]}</span><span class="resource-type">${r[1]}</span></div>`).join('')}
        </article>`).join('')}</div>
      </section>
      <aside class="stack">
        <section class="section-card"><div class="section-heading"><div><h2>Course progress</h2><p>${c.progress}% complete</p></div></div><div class="progress-track" style="height:8px"><div class="progress-fill" style="width:${c.progress}%;background:${c.color}"></div></div></section>
        <section class="section-card"><div class="section-heading"><div><h2>Assignments</h2><p>Work for this course</p></div></div>${assignmentRows(assignments.filter(a => a.courseId === c.id), 3)}</section>
      </aside>
    </div>`;
}

function renderAssignments() {
  breadcrumbs.textContent = 'Assignments';
  const filter = state.assignmentFilter;
  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);
  app.innerHTML = `${pageHeader('Coursework', 'Assignments', 'Track everything due across your courses.')}
    <section class="section-card">
      <div class="list-toolbar"><div class="filter-group">${['all','open','submitted','graded'].map(f => `<button class="filter-chip ${filter === f ? 'active' : ''}" data-filter="${f}">${f[0].toUpperCase()+f.slice(1)}</button>`).join('')}</div></div>
      ${assignmentRows(filtered)}
    </section>`;
}

function renderGrades() {
  breadcrumbs.textContent = 'Grades';
  const rows = [
    ['Econometrics II', 'Problem Set 1', '19/20', '95%'],
    ['Econometrics II', 'Problem Set 2', '18.5/20', '92.5%'],
    ['Microeconomics II', 'Problem Set 1', '14/15', '93.3%'],
    ['Algorithms', 'Sorting quiz', '10/10', '100%'],
    ['International Trade', 'Problem Set 1', '—', 'Pending']
  ];
  app.innerHTML = `${pageHeader('Performance', 'Grades', 'A single place for results from all current courses.')}
    <section class="section-card">
      <table class="data-table"><thead><tr><th>Course</th><th>Assessment</th><th>Score</th><th>Result</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td><div class="table-title">${r[0]}</div></td><td>${r[1]}</td><td class="grade ${r[2] === '—' ? 'grade-muted' : ''}">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}
      </tbody></table>
    </section>`;
}

function renderCalendar() {
  breadcrumbs.textContent = 'Calendar';
  const days = Array.from({length: 35}, (_, i) => i - 1);
  const events = { 18:'Econometrics PS 3', 20:'Microeconomics PS 2', 22:'Algorithms assignment', 27:'Trade replication' };
  app.innerHTML = `${pageHeader('September 2026', 'Calendar', 'Lectures, seminars and deadlines in one view.', '<button class="secondary-button">Today</button>')}
    <div class="calendar-grid">
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<div class="calendar-head">${d}</div>`).join('')}
      ${days.map(d => `<div class="calendar-day"><div class="calendar-date">${d > 0 && d <= 30 ? d : ''}</div>${events[d] ? `<div class="calendar-event">${events[d]}</div>` : ''}</div>`).join('')}
    </div>`;
}

function renderAssignmentDetail(id) {
  const a = assignments.find(x => x.id === Number(id));
  if (!a) return renderAssignments();
  breadcrumbs.textContent = `Assignments / ${a.title}`;
  app.innerHTML = `${pageHeader(a.course, a.title, `Due ${a.due} · ${a.points}`, `<span class="status-pill status-${a.status}">${statusLabel(a.status)}</span>`)}
    <div class="dashboard-grid">
      <section class="section-card">
        <div class="section-heading"><div><h2>Instructions</h2><p>Complete all parts and submit one PDF file.</p></div></div>
        <p style="font-size:13px;line-height:1.75;color:#4f5d6a;margin:0 0 18px">This prototype shows how a full assignment page could work. The production version will support rich text, LaTeX equations, downloadable files, release dates, grading rubrics and submission history.</p>
        <div class="module-card"><div class="resource-row"><span class="resource-icon">↓</span><span>Assignment handout.pdf</span><span class="resource-type">PDF</span></div></div>
      </section>
      <aside class="section-card">
        <div class="section-heading"><div><h2>Submission</h2><p>${a.status === 'submitted' ? 'Submitted successfully' : 'Upload your work before the deadline'}</p></div></div>
        <button class="primary-button" style="width:100%">${a.status === 'submitted' ? 'View submission' : 'Upload submission'}</button>
      </aside>
    </div>`;
}

function renderProfile() {
  breadcrumbs.textContent = 'Profile';
  app.innerHTML = `${pageHeader('Account', 'Student profile', 'A future home for identity, notifications and accessibility preferences.')}
    <section class="section-card"><div class="empty-state"><div class="empty-state-symbol">AS</div><h2>A. Student</h2><p>MAE · Year 2 · Fall 2026</p></div></section>`;
}

function render() {
  switch (state.route) {
    case 'courses': renderCourses(); break;
    case 'course': renderCourse(state.courseId); break;
    case 'assignments': renderAssignments(); break;
    case 'assignment': renderAssignmentDetail(state.assignmentId); break;
    case 'calendar': renderCalendar(); break;
    case 'grades': renderGrades(); break;
    case 'profile': renderProfile(); break;
    default: renderDashboard();
  }
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarBackdrop').classList.add('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('visible');
}

function searchItems(query) {
  const q = query.trim().toLowerCase();
  const items = [
    ...courses.map(c => ({ title: c.title, meta: `${c.code} · ${c.professor}`, kind: 'Course', icon: '▦', action: () => navigate('course', c.id) })),
    ...assignments.map(a => ({ title: a.title, meta: `${a.course} · Due ${a.due}`, kind: 'Assignment', icon: '✓', action: () => { state.route='assignment'; state.assignmentId=a.id; render(); } }))
  ];
  return q ? items.filter(i => `${i.title} ${i.meta}`.toLowerCase().includes(q)) : items.slice(0, 6);
}

function renderSearch(query = '') {
  const target = document.getElementById('commandResults');
  const items = searchItems(query);
  target.innerHTML = items.length ? items.map((i, idx) => `<button class="command-result" data-search-index="${idx}"><span class="command-result-icon">${i.icon}</span><span><span class="command-result-title">${i.title}</span><span class="command-result-meta">${i.meta}</span></span><span class="command-result-kind">${i.kind}</span></button>`).join('') : '<div class="empty-state" style="padding:28px">No results</div>';
  target.querySelectorAll('[data-search-index]').forEach(btn => btn.addEventListener('click', () => { items[Number(btn.dataset.searchIndex)].action(); closeSearch(); }));
}
function openSearch() { document.getElementById('commandPalette').classList.remove('hidden'); const input = document.getElementById('commandInput'); input.value=''; renderSearch(); setTimeout(() => input.focus(), 20); }
function closeSearch() { document.getElementById('commandPalette').classList.add('hidden'); }

document.addEventListener('click', e => {
  const route = e.target.closest('[data-route]');
  const course = e.target.closest('[data-course]');
  const assignment = e.target.closest('[data-assignment]');
  const filter = e.target.closest('[data-filter]');
  if (route) navigate(route.dataset.route);
  if (course) navigate('course', course.dataset.course);
  if (assignment) { state.route = 'assignment'; state.assignmentId = assignment.dataset.assignment; render(); }
  if (filter) { state.assignmentFilter = filter.dataset.filter; renderAssignments(); }
});

document.getElementById('openSidebar').addEventListener('click', openSidebar);
document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
document.getElementById('sidebarBackdrop').addEventListener('click', closeSidebar);
document.getElementById('searchButton').addEventListener('click', openSearch);
document.getElementById('commandInput').addEventListener('input', e => renderSearch(e.target.value));
document.getElementById('commandPalette').addEventListener('click', e => { if (e.target.id === 'commandPalette') closeSearch(); });
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape') closeSearch();
});

renderSidebarCourses();
render();
