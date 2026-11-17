# Student Management System — John Iverson Ulleras

A full-stack student records app created for an Integrative Programming ORM activity.

**Stack:** React + Vite · Node.js/Express · Prisma ORM 6 · MySQL 8

## Features

- Create, view, update, and delete student records (CRUD)
- Search by name, email, or course
- Active/inactive status and year-level fields
- Database validation and duplicate email handling
- Mobile-friendly dashboard and working REST API

## Project files

- `frontend/` — React user interface
- `backend/src/` — Express REST API
- `backend/prisma/` — Prisma schema and MySQL table migration
- `backend/tests/` — validation tests
- `backend/scripts/smoke-test.js` — CRUD integration test
- `.github/workflows/mysql-crud.yml` — GitHub Actions MySQL 8 test

## Run the app with MySQL (computer)

You need **Node.js 20.19+** and **MySQL 8** running locally.

1. In MySQL Workbench, execute `backend/database/create_database.sql` to create `ulleras_students`.
2. In `backend/`, copy `.env.example` to `.env` and set the MySQL username/password in `DATABASE_URL`. **Never upload `.env` to GitHub.**
3. Open a terminal in `backend/`:

```bash
npm install
npm run db:setup
npm start
```

4. Open another terminal in `frontend/`:

```bash
npm install
npm run dev
```

5. Visit **http://localhost:5173**. The backend is at **http://localhost:5000**.

Optional: With Docker Desktop, copy `.env.mysql.example` to `.env.mysql`, set both private passwords, and run `docker compose --env-file .env.mysql -f compose.mysql.yml up -d` from the repository root. Then point `backend/.env` at the new `ulleras_students` database and run the setup commands.

## Tests

In the `backend` folder:

```bash
npm test
npm run test:crud
```

`npm test` checks student input validation. `npm run test:crud` needs your database and backend already running and performs Create, Read, Update and Delete against MySQL.

The **Actions** tab also runs a temporary MySQL 8 server, applies Prisma migrations, checks the CRUD API, and builds the React front-end on each push to `main`. A successful green check is test evidence, **not** an online website or a permanent MySQL server.

## Database API

| Method | Endpoint | Action |
| --- | --- | --- |
| GET | `/api/health` | Check MySQL connection |
| GET | `/api/students` | Read all students |
| GET | `/api/students/:id` | Read one student |
| POST | `/api/students` | Create |
| PUT | `/api/students/:id` | Update |
| DELETE | `/api/students/:id` | Delete |

## Security and submission

This is an **academic demonstration**, not a production system. Use **fictional records only**. There is no authentication. Do not expose the API publicly without adding authorization, security controls, and appropriate data-protection measures.

The GitHub repository contains source code; GitHub Pages cannot run the Node.js backend or MySQL server. A working public CRUD demo requires separate hosting.

**Developer:** John Iverson Ulleras  
**Portfolio repository:** https://github.com/Johniversonulleras/John-IversonPortfolio
