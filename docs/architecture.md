# NES Learning — production architecture

This document translates the UX prototype into a production application architecture.

## 1. Application boundary

The production application should be one role-aware web application rather than separate student and instructor products.

Recommended stack:

- Next.js + React + TypeScript;
- PostgreSQL;
- Supabase Auth and Storage for the first deployable version;
- server-side authorization for every mutation;
- object storage for course files and student submissions;
- GitHub Actions for CI;
- Vercel or another Node-compatible platform for the web application.

The current static prototype remains the UX reference while the production application is introduced alongside it.

## 2. Core domain

### Users

A user represents a person with an authenticated NES identity. Application-specific profile data should be separate from the authentication provider.

### Courses

A course is a term-specific teaching instance, for example `MAE 202 — Econometrics II — Fall 2026`.

A course owns modules, materials, assignments, announcements and calendar events.

### Memberships

`course_members` is the authorization boundary. A membership connects one user to one course and grants exactly one role:

- `student`;
- `ta`;
- `instructor`.

The browser may hide controls according to the role, but the database/API must enforce the same permission independently.

### Modules and materials

Modules organize learning content. Materials can be links, uploaded files, text/Markdown/LaTeX documents or code/data resources.

### Assignments and submissions

An assignment belongs to one course and defines release time, deadline, maximum score and submission rules.

A submission belongs to one assignment and one student. Resubmission should update the current submission while preserving an audit/version history in production.

### Grades

Grades are deliberately separate from submissions. This makes it possible to support non-submission assessments, manual gradebook items and future exam imports.

## 3. Permission matrix

| Capability | Student | TA | Instructor |
| --- | --- | --- | --- |
| View enrolled course | Yes | Yes | Yes |
| View released materials | Yes | Yes | Yes |
| Submit own assignment | Yes | No | No |
| View all submissions | No | Yes | Yes |
| Grade submissions | No | Yes | Yes |
| Publish grades | No | Optional | Yes |
| Upload course material | No | Yes | Yes |
| Create/edit assignment | No | Optional | Yes |
| Post announcement | No | Optional | Yes |
| Manage staff/memberships | No | No | Yes |

TA permissions should eventually be configurable per course instead of globally assuming every TA can publish or author coursework.

## 4. Server rules

The client must never be trusted for authorization. In particular:

- a student cannot obtain another student's submission by changing an ID in a URL;
- unpublished grades are not returned to students;
- unreleased materials are not returned to students;
- submission deadlines are checked server-side;
- only authorized course staff can modify grades;
- instructor-only operations are checked again in the database/API;
- file download URLs for private material and submissions should be short-lived signed URLs.

## 5. Storage layout

A possible object-storage convention:

```text
course-materials/{course_id}/{material_id}/{filename}
submissions/{course_id}/{assignment_id}/{student_id}/{submission_id}/{filename}
```

The database stores metadata and object keys, not public permanent download URLs.

## 6. Grade lifecycle

A useful grade lifecycle is:

```text
draft -> ready -> published
```

Students see only `published` grades. Course staff can work on draft scores without accidental disclosure.

Publishing should create an audit record with actor and timestamp.

## 7. Assignment lifecycle

Recommended assignment states:

```text
draft -> scheduled -> open -> closed
```

The state can partly be derived from `release_at` and `due_at`, but an explicit publication flag is still useful for instructor control.

## 8. Authentication

For the prototype backend, Supabase Auth is adequate. A real institutional deployment should be able to replace or supplement it with NES SSO without changing the academic domain model.

The internal user UUID should remain stable and independent of the external identity provider.

## 9. Integrations to postpone

Do not make the first deployable version depend on SIS, Zoom, Teams or external plagiarism services. First establish reliable core workflows: membership, materials, assignments, submissions and grading.

Likely later integrations:

- institutional SSO;
- student information system / enrollment import;
- calendar feeds;
- email notifications;
- GitHub Classroom or code submission tooling;
- plagiarism / similarity checking if the institution requires it.

## 10. Migration from the current prototype

The static prototype should not be rewritten screen-by-screen before the domain layer exists. A safer migration order is:

1. create Next.js shell and design tokens;
2. implement authentication/session handling;
3. implement courses and memberships;
4. migrate course overview and materials;
5. implement assignments and submissions;
6. implement gradebook and publishing;
7. migrate calendar/search/announcements;
8. remove the static prototype only after feature parity.
