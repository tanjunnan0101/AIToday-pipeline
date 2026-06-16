# AIToday Client Delivery Pipeline

Production-grade internal operating system for AIToday client delivery. This repository now includes:

- A Next.js 16 App Router workspace shell
- A delivery-focused information architecture for dashboard, clients, Gantt, Kanban, documents, implementation plans, time logs, workload, reports, portal, and handover
- A Prisma PostgreSQL schema covering the requested operational entities
- Demo-backed seed-aligned data so the UI can run before infrastructure credentials are available
- API route foundations for dashboard, client, task, and report data

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- Supabase-ready abstractions
- TanStack Table, DnD Kit, Recharts, React Hook Form, Zod

## Current state

The app is intentionally split into two layers:

1. `app/` and `components/` provide the workspace UI and route structure.
2. `lib/data-access.ts` provides repository-style reads with Prisma when `DATABASE_URL` is available and an in-memory fallback when it is not.

This lets the project run immediately while the real database, auth, storage, and mutation flows are wired in.

## Routes

- `/login`
- `/dashboard`
- `/clients`
- `/clients/[clientId]`
- `/gantt`
- `/kanban`
- `/tasks`
- `/documents`
- `/implementation-plans`
- `/implementation-plans/[planId]`
- `/time-logs`
- `/workload`
- `/notifications`
- `/reports`
- `/settings`
- `/handover`
- `/portal`

## Environment

Copy `.env.example` into `.env.local` and fill in:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `RESEND_API_KEY`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GANTT_PROVIDER`
- `GANTT_LICENSE_KEY`

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run db:validate
npm run db:seed
npm run build
```

## Database notes

- Prisma is configured for PostgreSQL and `DIRECT_URL`.
- The schema includes the requested core models and enums for clients, stages, tasks, implementation plans, documents, time logs, notifications, grants, invoices, proposals, handover, and portal access.
- `prisma/seed.ts` mirrors the demo data shape for initial environment setup once database credentials are available.

## Auth notes

- `/login` now uses signed cookie sessions for the demo environment.
- Set `SESSION_SECRET` before sharing the app beyond local development.
- The auth surface is structured so Supabase Auth can replace the demo credential check without changing the route protection flow.

## Next build steps

- Replace the demo data layer with Prisma-powered DAL functions.
- Wire Supabase Auth into the `/login` flow and route authorization.
- Add persistent document upload handlers using Supabase Storage.
- Replace the lightweight timeline adapter with the final Gantt provider.
- Add mutation surfaces with Server Actions and protected Route Handlers for CRUD flows.
