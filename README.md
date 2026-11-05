# user-management-system

[![CI](https://github.com/leonardo-merlo/user-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/leonardo-merlo/user-management-system/actions/workflows/ci.yml)

REST API for user accounts with NestJS: sign-up, JWT login, and protected routes where each user can only read, change or delete their own account.

> **About this repository.** A study project, first written in September 2025 and hardened in November 2026 (route protection, validation, tests). It is small on purpose: one entity, one auth flow. It is not deployed anywhere.

## What it does

| Method | Route | Auth | What it does |
|---|---|---|---|
| `POST` | `/users` | public | Sign-up. Validates the body, hashes the password with bcrypt, answers `409` if the e-mail or username is taken |
| `POST` | `/auth/login` | public | Returns a JWT (`access_token`, valid for 1 hour). Wrong e-mail or password answers `401` |
| `GET` | `/users/me` | JWT | The logged-in user |
| `PUT` | `/users/me` | JWT | Updates the logged-in user |
| `GET` | `/users` | JWT | Lists users |
| `GET` / `PUT` / `DELETE` | `/users/:id` | JWT | Only for your own id; any other id answers `403` |
| `GET` | `/health` | public | Uptime check |

No response ever includes the password hash.

## Tech stack

NestJS 11 · TypeScript · TypeORM · MySQL · Passport + JWT · bcrypt · class-validator · Jest + Supertest

## Key technical decisions

**Every route except sign-up and login needs a token, and `:id` routes check ownership.** There are no roles yet, so the safe default is that a user can only touch their own record (`assertSelf` in `src/user/user.controller.ts`). An admin role would be the place to relax this.

**Validation runs on every request, and unknown fields are rejected.** The global `ValidationPipe` uses `whitelist` and `forbidNonWhitelisted`, so a body like `{ "role": "admin" }` answers `400` instead of being silently passed to the database. It is set up in one function (`src/app.setup.ts`) used by both `main.ts` and the tests, so the tests run the same validation as the server.

**The JWT secret has no default.** The app refuses to start without `JWT_SECRET`. A fallback value in the code would let anyone who reads the repository sign valid tokens. The strategy also reloads the user on each request, so the token of a deleted account stops working.

**Login does not reveal which e-mails exist.** An unknown e-mail and a wrong password give the same `401` and the same message.

## Testing

```bash
npm test          # unit tests: AuthService password check (3 tests)
npm run test:e2e  # HTTP tests with Supertest (14 tests)
```

The HTTP tests start the real controllers, services, guards and validation, and replace only the TypeORM repository with an in-memory one (`test/in-memory-user-repository.ts`), so they run without MySQL. They cover sign-up validation, duplicate e-mail, login, missing token, and one user trying to change or delete another user's account. CI runs the build and both suites on every push.

## Getting started

Requires Node.js 20+ and a MySQL database.

```bash
npm install
cp .env.example .env              # then fill in the values
npm run typeorm migration:run     # creates the users table
npm run start:dev
```

## Environment variables

See [`.env.example`](.env.example): `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_SYNC`, `DB_LOGGING` and `JWT_SECRET`. All of them except `PORT` are required at startup.

## Known limitations

- No roles or admin user, so `GET /users` lists everyone to any logged-in user.
- No refresh token: the access token expires after 1 hour and the user logs in again.
- No rate limit on login.
- The tests do not run against MySQL, so they do not cover the migration or the database's own unique indexes.
