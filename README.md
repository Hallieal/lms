# NES Learning

A lightweight learning management system prototype designed around the day-to-day structure of courses at the New Economic School.

The repository currently contains a dependency-free interactive UX prototype. The goal of this phase is to settle the product structure, permissions and visual language before moving to a persistent backend.

## Current prototype

The demo now supports three preview roles inside one application:

- Student — dashboard, course materials, assignments, submissions, grades, calendar and search;
- Teaching Assistant — teaching dashboard, submission progress, grading queue and gradebook access;
- Instructor — course-management controls, coursework monitoring, gradebook and publishing actions.

The entry screen also includes a prototype NES sign-in flow. Authentication is not real yet and no real student data is stored.

## Main workflows

Student experience:

- term dashboard with the next deadline and announcements;
- current-course overview and individual course pages;
- course modules and learning materials;
- assignment details and submission UI;
- consolidated grade view;
- academic calendar;
- command-palette search (`Ctrl/Cmd + K`).

Teaching experience:

- cross-course teaching dashboard;
- assignments requiring attention;
- submission and grading progress;
- course-management toolbar;
- editable gradebook prototype;
- publishing/export controls;
- quick actions for assignments, materials and announcements.

## Files

```text
lms/
├── index.html      # application shell and sign-in screen
├── styles.css      # base responsive design system
├── v2.css          # role-aware and teaching-workspace additions
├── app.js          # demo data, routing, permissions and interactive views
└── README.md
```

## Running locally

The prototype has no build step. Serve the repository with any static HTTP server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

GitHub Pages can also serve the current prototype directly from `main` / repository root.

## Product principles

NES Learning should remain substantially simpler than a generic enterprise LMS. The interface should optimize for the recurring academic objects that actually matter: courses, materials, problem sets, submissions, feedback, grades, announcements and deadlines.

The same application shell should expose different capabilities through role-based permissions rather than splitting students and instructors into unrelated products.

Mathematical and quantitative courses are first-class use cases. The production application should therefore support LaTeX/Markdown content, code attachments and structured problem-set workflows cleanly.

## Production direction

Once the UX is stable, the intended architecture is:

- Next.js / React for the application UI;
- PostgreSQL for academic data;
- Supabase or an equivalent service for authentication, database access and file storage;
- row-level / role-based authorization for students, teaching assistants, instructors and administrators;
- object storage for materials and submissions;
- server-side audit history for submissions, grading and publishing actions.

## Planned domain model

```text
users
courses
course_members
modules
materials
assignments
submissions
grades
announcements
calendar_events
```

`course_members` connects a user to a course with a role such as `student`, `ta`, or `instructor`. Permissions should be derived from that membership rather than from client-side UI state.

## Development phases

### Phase 1 — UX prototype

Define information architecture and student/teaching workflows using realistic academic objects. This phase is in progress.

### Phase 2 — Application foundation

Move the approved interface to Next.js, add authentication, database migrations, file storage and server-enforced permissions.

### Phase 3 — Student workflows

Implement persistent courses, materials, assignments, submissions, grades, calendar and announcements.

### Phase 4 — Teaching workflows

Implement assignment authoring, submission review, gradebook operations, publishing controls and TA permissions.

### Phase 5 — Institutional features

Add administration, SIS/SSO integrations, imports/exports, analytics, accessibility review, audit tooling, security hardening and production deployment.

## Status

Early product prototype. Not affiliated with or deployed by the New Economic School.
