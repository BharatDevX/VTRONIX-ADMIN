# Vetronix Admin ERP

Production-grade React admin dashboard for managing Vetronix medical representatives, attendance, field visits, sales, MTP approvals, live tracking, notifications, reports, and organization settings.

## Stack

- React 19, Vite, TypeScript
- React Router v7
- TanStack Query and TanStack Table
- React Hook Form and Zod
- Supabase Auth, Postgres, Realtime, Edge Functions
- Tailwind CSS v4
- Lucide React, Recharts, React Leaflet, OpenStreetMap

## Environment

Create `.env` with the public Supabase project settings. The app supports both Vite and Expo-style prefixes because the existing Vetronix mobile app already uses `EXPO_PUBLIC_*`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Also supported:
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Never place the Supabase service role key in the Vite environment. The service role key is used only by Supabase Edge Functions.

## Supabase Setup

This admin panel is mapped to the existing Vetronix database used by the employee app. It does not include migrations that create a new schema. Core modules read the existing tables: `employees`, `attendance`, `work_sessions`, `sales`, `doctors`, `dealers`, `products`, `doctor_visits`, `dealer_visits`, `monthly_tour_programmes`, and `monthly_tour_entries`.

## Local Development

```bash
npm install
npm run dev
```

The app starts on Vite's default port, or the next available port if `5173` is occupied.

## Verification

```bash
npm run lint
npm run build
```

Both commands should pass before deployment.

## Feature Coverage

- Auth: protected routes, session persistence, auto token refresh, admin/manager/viewer role gates
- Dashboard: live KPI cards, charts, recent activities, top performers
- Employees: server-side search/filter/pagination, drawer create/edit, soft deactivate, password reset Edge Function
- Attendance: daily status table, filters, CSV export
- Doctor and dealer modules: visit history, outcomes, search, filters, CSV export
- Sales: primary/secondary sales, invoices, products, revenue exports
- MTP: pending/approved/rejected status workflow with approve/reject actions
- Live Tracking: OpenStreetMap with employee markers, latest location, update time, today's KM
- Notifications: Supabase Realtime refresh, read/unread, delete
- Reports: attendance, sales, doctor, dealer, employee, and MTP export hub
- Settings: organization profile, branches, designations, roles and permissions reference
