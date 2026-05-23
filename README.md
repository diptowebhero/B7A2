# DevPulse API

# Live Demo
A live demo of the API is available at https://devpulse-ten-pi.vercel.app/

DevPulse is a modular TypeScript backend for an internal tech issue and feature tracker.


## Features

- User signup and login
- Password hashing with bcrypt
- JWT authentication
- Contributor and maintainer role permissions
- Create, read, update, and delete issues
- Optional issue filtering by type/status and sorting by newest/oldest
- Maintainer-only system metrics
- PostgreSQL with native `pg` driver and raw SQL only

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Native `pg` driver
- bcrypt
- jsonwebtoken

## Project Structure

```txt
src/
  config/       database, env, db initialization
  middleware/   auth and error middleware
  modules/      auth, issues, metrics modules
  types/        shared TypeScript types
  utils/        response, validators, async handler, AppError
sql/
  schema.sql    database tables and updated_at triggers
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

3. Add your environment values:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=your_neon_postgresql_url
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
```

4. Initialize database tables:

```bash
npm run db:init
```

5. Run locally:

```bash
npm run dev
```

## API Endpoints

### Auth

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |

### Issues

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/issues` | Authenticated |
| GET | `/api/issues?sort=newest&type=bug&status=open` | Public |
| GET | `/api/issues/:id` | Public |
| PATCH | `/api/issues/:id` | Maintainer any issue; contributor own open issue |
| PATCH | `/api/issues/:id/status` | Maintainer only |
| DELETE | `/api/issues/:id` | Maintainer only |

### Metrics

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/metrics` | Maintainer only |

## Authorization Header

The assignment format is supported:

```txt
Authorization: <JWT_TOKEN>
```

Bearer format is also accepted:

```txt
Authorization: Bearer <JWT_TOKEN>
```

## Database Schema Summary

### users

- `id` serial primary key
- `name` required
- `email` required and unique
- `password` hashed password
- `role` contributor or maintainer
- `created_at`
- `updated_at`

### issues

- `id` serial primary key
- `title` required, max 150 characters
- `description` required, min 20 characters
- `type` bug or feature_request
- `status` open, in_progress, or resolved
- `reporter_id` user id stored without foreign key constraint
- `created_at`
- `updated_at`

