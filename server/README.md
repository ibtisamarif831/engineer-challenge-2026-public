# Server development

`src/index.ts` loads environment variables, opens the existing SQLite database and starts
HTTP listening. `createApp(database, summarize?)` in `src/app.ts` builds an app without
opening a database or listening. The entry point supplies the live dependencies.

```text
src/
  index.ts            Process entry point
  app.ts              Express configuration and dependency wiring
  routes/             URL/method mappings and middleware ordering
  controllers/        Parse HTTP input, call services, send typed responses
  services/           Business operations, SQL and feedback serialization
  middleware/         Authentication and final JSON error handling
  validation/         Small runtime parsers for unknown request input
  types/              Database rows and typed Express handlers/locals
  integrations/       External summary provider adapter
  db.ts               Existing SQLite connection and path
  seed.ts             Existing sample schema and data (destructive command)
../shared/types.ts    API request/response contracts used by both workspaces
```

Services take a database connection and domain values rather than Express requests.
Controllers validate input first; route handlers declare their success/error response
shapes. Public user records exclude passwords. Database row types include storage-only
fields, and query generics describe the rows and SQL bindings. These row types describe
the expected schema; they do not migrate or repair existing records.

Request bodies and provider JSON are `unknown` until narrowed. Validation covers scalar
queries, positive integer IDs/pages, status/priority values, assignment dates, nullable
owners, and boolean note privacy. Notes must contain non-whitespace text and at most
10,000 characters. Empty and null assignment dates remain supported. Missing referenced
records return 404; malformed inputs return 400. Dates retain their existing storage
format and time-zone semantics. Invalid pre-existing records are not rewritten.

All existing URLs remain available. Read, assignment and resolve return the same
`FeedbackItem` contract. CSV still uses the existing transport and note inclusion policy.
Synchronous Express errors and asynchronous summary errors reach the final JSON middleware;
parser failures retain 400/413/415 statuses. Unexpected errors use a generic response and
log no request body, token, SQL or provider error details.

## Build checks

From the repository root:

```bash
npm run build --workspace server
npm run build
```

No test files, runner or test command are included. Automated tests are deferred at the
user's request. The working database and seed script are preserved. Production mode is
selected by setting `NODE_ENV=production` when starting the server; it does not resolve
the remaining security/deployment tickets.

## Scope still open

This is a server structure/type refactor, with directly related input and response fixes.
Authentication still decodes JWTs without verifying signatures and uses the existing
hardcoded demo signing key (A001/A005). Identity shape checking does not authenticate a
caller. The root README remains the source of truth for local setup; signing-key changes are
outside the current scope. Password hashing, schema
constraints/migrations, browser error recovery, pagination/count corrections, metric date
scope alignment, token-free CSV transport/formula protection, and summary deadlines remain
separate tickets. This refactor does not establish production readiness.
