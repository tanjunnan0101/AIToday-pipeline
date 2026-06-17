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
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GANTT_PROVIDER`
- `GANTT_LICENSE_KEY`

For a local login that matches the seeded internal `ADMIN` role, create a Supabase Auth user with the same email as the demo admin record:

1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
2. Run `set ADMIN_PASSWORD=your-secure-password` in PowerShell or Command Prompt for the current shell.
3. Run `npm run auth:bootstrap-admin`.
4. Sign in with `admin@aitoday.sg` and the password you just set.

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

- `/login` now signs in through Supabase Auth using server-side cookie handling from `@supabase/ssr`.
- Route protection and token refresh run through [repo/proxy.ts](C:/Users/tanju/Documents/Codex/2026-06-15/files-mentioned-by-the-user-aitoday/repo/proxy.ts).
- Known internal users still inherit their display name and role from the app's seeded user records by matching email.

## Storage notes

- Document uploads now send the file through the server and write version objects into `SUPABASE_STORAGE_BUCKET` when Supabase storage credentials are configured.
- Document version rows persist the Storage object path, which keeps private-bucket serving options open for a later download layer.

## Next build steps

- Replace the demo data layer with Prisma-powered DAL functions.
- Add persistent document upload handlers using Supabase Storage.
- Replace the lightweight timeline adapter with the final Gantt provider.
- Add mutation surfaces with Server Actions and protected Route Handlers for CRUD flows.
