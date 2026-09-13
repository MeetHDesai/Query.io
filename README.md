# Query.io

A full-stack app that lets you ask questions about your database in plain English. Connect a Postgres database, type a question, and Query.io uses an LLM to generate a safe, read-only SQL query, runs it, and streams the results back with an auto-generated chart or table.

## How it works

1. **Connect a database** — credentials are encrypted (AES-256) before being stored, never in plaintext.
2. **Ask a question** — e.g. "what were our top 5 products by revenue last quarter?"
3. **The LLM generates SQL** — the query is generated via the OpenAI API based on your database's introspected schema.
4. **The query is validated** — before anything runs, a validation layer enforces SELECT-only execution and blocks common injection vectors (stacked queries, SQL comments, destructive keywords).
5. **Results stream back** — as a table, chart, or both.

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Firebase Authentication
- **AI:** OpenAI API for natural language → SQL generation
- **Testing:** Jest, with CI (GitHub Actions) running lint + tests on every push

## Security

- SQL validation layer: SELECT-only, blocks multi-statement injection, dangerous keywords, and SQL comment syntax — covered by an automated test suite (see `__tests__/sqlValidator.test.ts`)
- Encrypted storage for user-supplied database credentials
- Per-user rate limiting on query generation and execution endpoints

## Documentation

More detail on specific parts of the system:
- [`API.md`](./API.md) — API route reference
- [`AUTH.md`](./AUTH.md) — authentication flow
- [`DB-SCHEMA.md`](./DB-SCHEMA.md) — database schema
- [`DESIGN-SPEC.md`](./DESIGN-SPEC.md) — product/design spec

## Getting started

See [`ENV-SETUP.md`](./ENV-SETUP.md) for environment variable setup, then:

\`\`\`bash
npm install --legacy-peer-deps
npm run dev
\`\`\`

Run tests with `npm test`, lint with `npm run lint`.

## Status

Personal project, built solo. Not currently deployed.
