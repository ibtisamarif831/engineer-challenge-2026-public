# Pulse

This repository is a coding challenge for engineering candidates. It is not intended
for production use.

Pulse is a small internal customer-feedback inbox for support teams. Sign in, browse
incoming feedback across email, chat, and app-store channels, open an item to read the
full message and customer details, resolve or reopen it, and generate a quick AI summary
of any message. The app also includes assignment routing, priority and due-date fields,
customer profile history, internal notes, a small metrics panel, search, and CSV export.

## Requirements

- Node 20+
- npm

## Setup

1. Install dependencies (installs both the server and web packages):

   ```bash
   npm install
   ```

2. Create the environment files from the examples:

   ```bash
   cp server/.env.example server/.env
   cp web/.env.example web/.env
   ```

   Generate a local signing key once with `openssl rand -hex 32` and save its output as
   `JWT_SECRET` in `server/.env`. The API requires a non-placeholder secret of at least
   32 bytes in every environment and refuses to start without one. Never commit this key.

   Restart the API after changing the key. Previously issued tokens (including tokens
   signed with the old demo key) will no longer work; sign out and sign in again.

   The app runs fully offline — the Summarize feature uses a built-in canned
   summarizer (`FAKE_LLM=true`), so no provider API key is required.

3. Seed the database with sample users, customers, and feedback:

   ```bash
   npm run seed
   ```

4. Start the API and the web app together:

   ```bash
   npm run dev
   ```

   - API: http://localhost:4000
   - Web: http://localhost:5173

Open the web app in your browser and sign in.

## Test login

- **Email:** `alice@pulse.test`
- **Password:** `password123`

## Project layout

- `server/` — Node + Express + TypeScript API backed by SQLite (`better-sqlite3`).
- `web/` — React + TypeScript single-page app built with Vite.

## Optional: live summaries

To use a real model for the Summarize feature, set the following in `server/.env`:

```bash
FAKE_LLM=false
OPENAI_API_KEY=sk-...
```

Keep the provider key only in `server/.env`; the browser sends summary requests to the
API without a provider key. With `FAKE_LLM=true`, summaries need no provider key.

Feedback, internal notes and summaries display as plain text with line breaks preserved.
Stored HTML, including the sample `<strong>` and `<em>` tags, is shown literally.

## CSV exports

Export CSV downloads the current status/search selection using an authenticated request.
Bearer tokens are sent in the Authorization header; query-string tokens are not accepted.

Formula-like text (including whitespace-prefixed formulas) and text starting with control
characters receive a leading apostrophe before normal CSV quote escaping. Ordinary text,
quotes and line breaks are preserved, and stored data is unchanged. Import CSV fields as
text and retain the protective prefix. Spreadsheet-application import behavior remains
unverified; see [CSV injection guidance](https://community.owasp.org/attacks/CSV_Injection).
