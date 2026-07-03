# Chemi Surveys & Mapping Consultants — Portfolio & Management Dashboard

Production-ready full-stack web application for **Chemi Surveys & Mapping
Consultants**, a land surveying firm based in Thika, Kenya, founded by
Surveyor John Muiruri Gachemi.

## Tech stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **API layer:** tRPC (end-to-end type safety, no manual `fetch` calls)
- **Backend:** Node.js + Express
- **Database:** MySQL via Prisma ORM (compatible with Supabase's MySQL
  bridge, PlanetScale, Railway, or a local MySQL instance)
- **Auth:** JWT-based staff sign-in with bcrypt password hashing
- **Storage:** Supabase Storage recommended for client logos and project
  images (URLs are stored in MySQL; binary files are not)

## What's included

- Header with the real CSMC brand logo (`src/assets/csmc-logo.png`),
  notification bell, and a "My Account" dropdown pulling live staff data
- Sidebar navigation: **Home** (new), Dashboard, Calendar, Consultations,
  Clients, Services, My Projects, About Us, Contact Us
- **Home page** featuring the real GNSS field photo
  (`src/assets/field-survey-hero.jpg`) and firm overview
- **Dashboard** — lemon-yellow → neon-green gradient background, Egyptian
  blue text, live stat cards, an empty Today's Schedule and empty Upcoming
  Tasks list (both populated only by what the surveyor adds)
- **Reports** — generate a printable monthly field report as a PDF
  directly from the browser (no server round-trip). Month/year picker
  defaulting to the current month, a live stat preview before exporting,
  and a one-click "Generate PDF" button that downloads
  `CSMC_Field_Report_<Month>_<Year>.pdf` instantly. The PDF includes a firm
  letterhead, 8 summary stat boxes, a color-coded field tasks table for the
  selected month, an upcoming tasks table, the full client directory, and
  page numbers on every page.
- **Clients** — starts completely empty; staff add clients with name, logo
  URL, phone, and email through a modal form
- **My Projects** — a 12-slot grid, all empty by default; each slot is
  independently editable (title, date, image)
- **Calendar** — Excel-style 7-day × 8am–5pm grid
- **Consultations** — status-filterable list (Booked / Confirmed /
  Completed / Cancelled / No-show)
- **Services** and **About / Contact** pages backed by the database
- Full MySQL schema via Prisma (`prisma/schema.prisma`) with Users,
  Clients, Services, Consultations, Projects, Notifications, and an
  AuditLog
- JWT auth middleware (`protectedProcedure` / `adminProcedure`) protecting
  all write operations
- Fully responsive layout — a collapsible slide-in sidebar with hamburger
  toggle on phones/tablets, a fixed sidebar on laptops/desktops, and fluid
  grids/typography that adapt from small smartphones up to large monitors

## Project structure

```
chemi-surveys-app/
├── prisma/
│   ├── schema.prisma        # MySQL schema (Users, Clients, Projects, etc.)
│   └── seed.ts               # Seeds staff + service catalogue ONLY
├── server/
│   ├── index.ts               # Express entry point
│   ├── context.ts             # JWT verification → tRPC context
│   ├── trpc.ts                 # public/protected/admin procedures
│   ├── db.ts                    # Prisma client singleton
│   └── routers/
│       ├── _app.ts               # combines all routers
│       ├── auth.ts                # login, me, staffDirectory
│       ├── client.ts               # client directory CRUD
│       ├── consultation.ts          # schedule, stats, status updates
│       ├── project.ts                # 12-slot project grid CRUD
│       ├── service.ts                 # service catalogue CRUD
│       └── notification.ts             # email/SMS simulation
├── src/
│   ├── assets/
│   │   ├── csmc-logo.png         # provided brand logo
│   │   └── field-survey-hero.jpg  # provided GNSS field photo
│   ├── features/
│   │   ├── home/Home.tsx
│   │   ├── auth/Login.tsx
│   │   ├── dashboard/Dashboard.tsx
│   │   ├── calendar/CalendarPage.tsx
│   │   ├── consultations/Consultations.tsx
│   │   ├── clients/Clients.tsx
│   │   ├── services/Services.tsx
│   │   ├── projects/Projects.tsx
│   │   ├── reports/Reports.tsx        # month picker, live preview, PDF export
│   │   ├── about/AboutUs.tsx
│   │   └── contact/ContactUs.tsx
│   ├── hooks/useAuth.ts
│   ├── layouts/MainLayout.tsx
│   ├── utils/trpc.ts
│   ├── utils/generateFieldReportPdf.ts  # client-side PDF builder (jsPDF)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` — your MySQL connection string
- `JWT_SECRET` — a long random string (never commit this)
- `CLIENT_ORIGIN` — your frontend URL (defaults to `http://localhost:5173`)

### 3. Set up the database

```bash
npm run db:migrate     # creates all tables from prisma/schema.prisma
npm run db:seed        # seeds staff users + service catalogue only
```

> **Note:** the seed script intentionally does **not** create any Clients,
> Projects, or Consultations. Those start empty in production and are
> populated by Surveyor John Muiruri Gachemi through the dashboard UI, as
> requested.

The seed creates three staff accounts with a temporary password
(`ChangeMe123!`) — change these immediately after first login:

| Name | Email | Role |
|---|---|---|
| John Muiruri Gachemi | johnmuiruri68@gmail.com | Admin / Land Surveyor |
| Anthony Nd'ungu Gachemi | anthony.gachemi@chemisurveys.co.ke | Land Surveyor |
| John Malele | john.malele@chemisurveys.co.ke | Fieldwork Operations |

### 4. Run the app

```bash
npm run dev
```

This runs the Vite frontend (`http://localhost:5173`) and the Express/tRPC
backend (`http://localhost:4000`) concurrently.

### 5. Sign in

Go to `/login` and sign in with one of the seeded staff accounts to access
the Dashboard, Clients, and Projects pages (these require authentication).
The Home, Calendar, Consultations, Services, About, and Contact pages are
publicly viewable, matching a typical client-facing portfolio site.

## Connecting image/logo uploads to Supabase Storage

Currently the Clients and Projects forms accept a pasted image URL. To
wire up real uploads:

1. Create a public bucket in Supabase Storage (e.g. `chemi-surveys-media`)
2. Add the Supabase JS client to the frontend and upload the file on form
   submit
3. Use the returned public URL in place of the manually-typed URL field

This keeps the MySQL database lightweight — only URL strings are stored,
never binary image data.

## Production deployment notes

- Run `npm run build` to produce a static frontend bundle (`dist/`) and
  compile the server with `tsc`
- Deploy the Express/tRPC server separately (e.g. Railway, Render, Fly.io)
- Point `VITE_API_URL` (frontend env var) at your deployed API URL
- Use a managed MySQL instance in production (PlanetScale, Railway MySQL,
  or AWS RDS) rather than a local database
- Rotate `JWT_SECRET` and the seeded staff passwords before going live
