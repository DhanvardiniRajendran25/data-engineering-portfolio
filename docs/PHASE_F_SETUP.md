# Phase F setup — accounts and credentials

Everything you need to do so the live pipeline can be built. All free, no card
required anywhere.

Verified against the live docs on 2026-08-05. Numbers below are from Neon's and
Vercel's current pricing pages, not from memory.

---

## Step 0 — Push the branch (do this first)

`origin` currently has only `main`, which is still the **old static HTML site**.
The entire Next.js rewrite exists only on your laptop. Vercel deploys from
GitHub, so nothing else in this document can happen until the branch is pushed.

```bash
cd d:/GitHub/data-engineering-portfolio
git push -u origin rewrite/nextjs
```

This is also, separately, a backup. Right now a disk failure loses all of it.

The repo is **public**, which matters later: GitHub Actions is free and unmetered
on public repos, so the nightly job costs nothing.

---

## Step 1 — Neon (the database)

### Free plan, verified

| | |
|---|---|
| Storage | 0.5 GB per project |
| Compute | 100 CU-hours per project per month |
| Projects | up to 100 |
| Credit card | **not required** |
| Idle behaviour | scale-to-zero after 5 minutes |
| If you exceed a limit | compute suspends until next month. **Nothing is deleted.** |

Our estimated usage: roughly 110 MB of gold-layer data and a few CU-hours a
month. Comfortably inside both.

### Steps

1. Go to **https://neon.com** and sign up. Use **Continue with GitHub** so the
   accounts are linked.
2. Create a project:
   - **Name:** `food-inspection-pipeline`
   - **Postgres version:** latest offered
   - **Cloud / region:** **AWS · US East (N. Virginia)**

   The region matters. Vercel's default function region is `iad1`, also
   Northern Virginia. Matching them keeps the query path short. Picking Europe
   here would add a transatlantic round trip to every homepage render.
3. On the project dashboard, find **Connection string**. There is a toggle
   between **Pooled connection** and **Direct connection**. You need **both**,
   and they are used for different things:

   | Which | Looks like | Used by | Why |
   |---|---|---|---|
   | **Pooled** | host contains `-pooler` | the website's API route | Serverless functions open many short-lived connections. The pooler is built for that. |
   | **Direct** | no `-pooler` | the nightly ingestion job | Bulk loads and schema migrations need a real session. `COPY` and transactions misbehave through a pooler. |

   Copy both. They differ only in the hostname.

---

## Step 2 — Vercel (hosting)

### Hobby plan, verified

| | |
|---|---|
| Cost | free |
| Licence | **personal, non-commercial only.** A portfolio qualifies. |
| Function max duration | 300s (our queries take milliseconds) |
| Function invocations | first 1,000,000/month |
| Deployments | 100/day |
| Credit card | not required |

### Steps

1. Go to **https://vercel.com** and sign up with **Continue with GitHub**.
2. **Add New → Project**, then import `data-engineering-portfolio`.
3. **Root Directory: `web`**

   This is the one people get wrong. The Next.js app is not at the repository
   root; it lives in `web/`. If this is left as `.`, the build fails with no
   framework detected. Click **Edit** next to Root Directory and enter `web`.
4. Framework preset should auto-detect as **Next.js**. Leave the build and
   output settings alone.
5. Before the first deploy, add the environment variable:
   - **Key:** `DATABASE_URL`
   - **Value:** the **pooled** connection string from Step 1
   - **Environments:** Production and Preview
6. Set the production branch. Two options:
   - **Now:** Settings → Git → **Production Branch** → `rewrite/nextjs`
   - **Later, cleaner:** merge `rewrite/nextjs` into `main` once you are happy
     with it, and leave production on `main`

   Option one is the safe order: deploy the branch, look at the real thing on a
   real URL, then merge.
7. Deploy.

You will get a `*.vercel.app` URL. The custom domain decision can wait.

---

## Step 3 — GitHub secrets (for the nightly job)

The ingestion job runs on GitHub's servers, so it needs its own copy of the
credentials. Vercel's environment variables are not visible to GitHub Actions.

Repository → **Settings** → **Secrets and variables** → **Actions** →
**New repository secret**:

| Name | Value |
|---|---|
| `DATABASE_URL_DIRECT` | the **direct** connection string (not pooled) |
| `SOCRATA_APP_TOKEN` | optional, see Step 4 |

Secrets are write-only. Nobody, including you, can read them back afterwards, so
keep the connection strings somewhere safe until the pipeline is confirmed
working.

---

## Step 4 — Socrata app token (optional)

All three cities publish through Socrata. Without a token, requests share an
anonymous per-IP rate-limit pool, which is usually fine for a nightly job but
can throttle during a backfill.

The ingestion job implements exponential backoff either way, so this is a
nice-to-have, not a blocker.

If you want one: sign in at
[data.cityofchicago.org](https://data.cityofchicago.org), open the profile menu,
find **Developer Settings**, and create an app token. Repeat on
[data.cityofnewyork.us](https://data.cityofnewyork.us) and
[dallasopendata.com](https://www.dallasopendata.com) if the token is rejected
cross-domain.

---

## How to hand the credentials over

**Do not paste the connection strings into chat.** A database connection string
is a username, a password and a host in one line. Chat transcripts persist.

Instead, put them in a file that is already gitignored:

```bash
cd d:/GitHub/data-engineering-portfolio/web
cp .env.example .env.local
```

Then edit `.env.local`:

```
DATABASE_URL=<pooled connection string>
DATABASE_URL_DIRECT=<direct connection string>
SOCRATA_APP_TOKEN=<optional>
```

Then just say "it's in `.env.local`." I can read the file to run and test the
pipeline locally, but it never enters a chat message and never enters git.

`web/.gitignore` ignores `.env*` with a single exception for `.env.example`, so
`.env.local` cannot be committed by accident.

---

## Security checks I will run

Not things you need to do, listed so you know they happen.

- [ ] Confirm `DATABASE_URL` never appears in the client JavaScript bundle. This
      is easy to get wrong in Next.js and the consequence is public database
      credentials.
- [ ] API route exposes fixed whitelisted queries only. No SQL, and no query
      fragment, ever comes from the browser.
- [ ] Rate limiting on the API route.
- [ ] Response caching, so visitors do not each trigger a query. Neon
      scale-to-zero means an uncached cold query is slow, and the homepage must
      never wait on a sleeping database.
- [ ] The panel degrades to last-known values, or hides, if the database is
      unreachable. A dead database must not take the page down with it.

---

## The 60-day gotcha

GitHub disables scheduled workflows on repositories with no commits for 60 days.
A portfolio repo goes quiet. Six months later the panel silently reads
"127d ago", which is worse than having no panel at all.

Handled in the workflow itself: each successful run commits a small state file,
which counts as repository activity and keeps its own schedule alive. Failure
notifications come free from GitHub by email.

---

## Summary of what is needed from you

1. `git push -u origin rewrite/nextjs`
2. Neon account, project in AWS US East, both connection strings
3. Vercel account, project imported with **Root Directory `web`**
4. Both strings written into `web/.env.local`
5. Tell me it is done

Everything else, including the GitHub secrets if you would rather I list the
exact values to paste, follows from there.
