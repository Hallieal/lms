# NES LMS

A lightweight learning management system prototype designed around the day-to-day structure of courses at the New Economic School.

The current repository contains the first UI/UX prototype. It is intentionally dependency-free so the product structure and visual language can be tested before a backend and authentication layer are introduced.

## Current prototype

The demo includes:

- student dashboard with upcoming deadlines and announcements;
- current-course overview;
- individual course pages with modules and learning materials;
- assignments and submission states;
- consolidated grade view;
- academic calendar;
- responsive mobile navigation;
- command-palette search (`Ctrl/Cmd + K`).

All data is currently mock data stored in `app.js`.

## Files

```text
lms/
├── index.html      # application shell
├── styles.css      # complete responsive design system
├── app.js          # demo data, routing and interactive views
└── README.md
```

## Running locally

Because the first prototype has no build step, it can be opened directly in a browser or served with any static HTTP server.

For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Product direction

The prototype is the design layer for a production LMS rather than the final technical architecture. Once the core screens and workflows are approved, the planned application can move to a full-stack implementation with:

- Next.js / React for the application UI;
- PostgreSQL for persistent academic data;
- Supabase or an equivalent service for authentication, database access and file storage;
- role-based access for students, teaching assistants, instructors and administrators;
- secure assignment submissions;
- instructor gradebook;
- LaTeX and Markdown rendering;
- course announcements and notifications;
- release dates and deadlines;
- audit history for submissions and grades.

## Planned domain model

The first production schema is expected to center on:

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

`course_members` will connect a user with a course and define a role such as `student`, `ta`, or `instructor`.

## Development phases

### Phase 1 — UX prototype

Define the information architecture and student experience using realistic course data and workflows.

### Phase 2 — Application foundation

Move the approved interface to the full-stack application, add authentication, database migrations and role-based permissions.

### Phase 3 — Student workflows

Implement enrollment views, materials, assignments, submissions, grades, calendar and announcements.

### Phase 4 — Instructor workflows

Add course administration, assignment creation, submission review, gradebook tools and publishing controls.

### Phase 5 — Institutional features

Add admin tools, integrations, analytics, imports/exports, accessibility review, security hardening and production deployment.

## Status

Early product prototype. Not affiliated with or deployed by the New Economic School.
