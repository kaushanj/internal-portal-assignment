# Internal Portal

Small internal task portal built with Next.js (App Router) for both the UI and API routes.

## Features

- Sign up / login / logout
- Protected task area (middleware + API auth checks)
- Create, edit, delete tasks
- Change task status (`TODO`, `IN_PROGRESS`, `DONE`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and set a secret:

```bash
cp .env.example .env
```

3. Create the database:

```bash
npm run db:push
```

4. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`

## Tech stack

- Next.js 15 (App Router + Route Handlers)
- TypeScript
- Prisma + SQLite
- bcryptjs (password hashing)
- jose (JWT session cookie)
- Zod (request validation)

## Project structure

```
app/                  Pages and API routes
app/tasks/components  Task UI pieces (table, drawer, header)
lib/auth.ts           Session helpers
lib/db.ts             Prisma client
lib/repositories/     Data access layer
lib/validators/       Request validation (Zod)
prisma/schema.prisma  Database models
middleware.ts         Protects /tasks
```

## Key decisions

**Next.js for frontend and backend**  
Matches the brief. API route handlers live in the same app as the UI.

**SQLite + Prisma**  
Easy to run locally with no external database. Can switch to Postgres later by changing the Prisma datasource URL.

**Repository pattern**  
API routes call `UserRepository` / `TaskRepository` instead of using Prisma directly. Keeps data access in one place and makes the route handlers easier to read.

**Zod for request validation**  
Create/update task payloads are validated with shared schemas in `lib/validators`, so route handlers stay thin and rules live in one place.

**JWT in an httpOnly cookie**  
Simple session auth without a third-party auth service. Cookie is not readable by JavaScript.

**CSRF protection**  
Mutating requests require same-origin and a double-submit CSRF token (`csrf` cookie + `x-csrf-token` header). Login/signup validate origin; authenticated actions (tasks + logout) require both checks. Client calls go through `apiFetch`.

**Passwords are hashed**  
Plain password from signup/login is hashed with bcrypt before it is stored in the `password` field.

**Tasks are owned by the logged-in user**  
Each user only sees and changes their own tasks. Update/delete checks ownership in the API.

**Simple CSS**  
No UI library. Enough styling to be usable without adding extra dependencies.

## Part 2

See [Task_2.pdf](./Task_2.pdf) for the process flow map and sprint plan.

