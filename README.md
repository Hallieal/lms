# NES Learning

A role-aware learning management system prototype designed around the day-to-day structure of courses at the New Economic School.

The repository now contains two layers:

- the original dependency-free UX prototype in `index.html`, `app.js`, `styles.css` and `v2.css`;
- a production-oriented Next.js application foundation under `src/`.

No real student data is stored and the project is not affiliated with or deployed by the New Economic School.

## Next.js application

The new application uses:

- Next.js 16 App Router;
- React + TypeScript;
- typed LMS domain objects;
- role-aware Student / TA / Instructor interfaces;
- Supabase SSR/browser clients prepared for authentication and persistence;
- the existing PostgreSQL/Supabase schema in `supabase/schema.sql`;
- GitHub Actions for TypeScript and production-build checks.

### Routes

```text
/                         prototype sign-in / role preview
/dashboard                student or teaching dashboard
/courses                  current courses
/courses/[courseId]       course materials and staff controls
/assignments              coursework overview
/assignments/[id]         submission or grading workflow
/grades                    student grades or staff gradebook
/calendar                  academic calendar
```

Role preview is currently persisted in `localStorage`. It is deliberately isolated behind `RoleProvider` so it can later be replaced by the authenticated course membership returned from Supabase.

## Running the Next.js app

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Before connecting Supabase, copy `.env.example` to `.env.local` and provide:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The current UI does not require those variables yet; the clients are prepared for the authentication phase.

Useful checks:

```bash
npm run typecheck
npm run build
```

The same commands run in GitHub Actions.

## Domain model

The production schema centers on:

```text
profiles
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

`course_members` is the authorization boundary that connects a user to a course with a role such as `student`, `ta`, or `instructor`. Client-side visibility is not treated as security; database policies must enforce access to submissions, grades and unpublished content.

## Product principles

NES Learning should remain substantially simpler than a generic enterprise LMS. The interface should optimize for the academic objects that recur constantly: courses, materials, problem sets, submissions, feedback, grades, announcements and deadlines.

Mathematical and quantitative courses are first-class use cases, so LaTeX/Markdown, code attachments, datasets and structured problem-set workflows are planned as native capabilities rather than add-ons.

## Repository structure

```text
lms/
├── src/
│   ├── app/                 Next.js routes and layouts
│   ├── components/          shared UI and role-aware workflows
│   └── lib/                 domain types, data layer and Supabase clients
├── supabase/schema.sql      initial PostgreSQL schema and RLS policies
├── docs/architecture.md     product / security architecture notes
├── .github/workflows/ci.yml
├── package.json
├── index.html               legacy static prototype
├── app.js                   legacy prototype logic
├── styles.css
└── v2.css
```

## Next milestones

1. Create a Supabase project and apply the schema migration.
2. Replace preview sign-in with real authentication.
3. Load courses and memberships from PostgreSQL instead of mock data.
4. Implement secure Storage buckets for course materials and assignment submissions.
5. Persist submission versions, grades and feedback.
6. Add LaTeX/Markdown authoring and rendering.
7. Deploy the Next.js application to Vercel or an equivalent host.

## Status

Active product prototype and application foundation. Not affiliated with or deployed by the New Economic School.
