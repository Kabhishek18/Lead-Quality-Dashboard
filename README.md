# Lead Quality Dashboard

**Live link:** [https://kabhishek18.github.io/Lead-Quality-Dashboard/](https://kabhishek18.github.io/Lead-Quality-Dashboard/)

**Assignment / grader summary:** Carrier account managers need to compare **lead sources** on quality—not only volume—to decide what to **scale** vs **cut**. This app loads a CSV in the browser, computes **strict acceptance** (decided leads), **pending** risk, form timing, geography, and derived **phone hygiene**, then shows **Scale / Watch / Cut** verdicts with thresholds in **Methodology**. Open the **[live site](https://kabhishek18.github.io/Lead-Quality-Dashboard/)** to review the full UI (Start here, executive summary, charts, geo, table).

- **Repository:** [github.com/Kabhishek18/Lead-Quality-Dashboard](https://github.com/Kabhishek18/Lead-Quality-Dashboard)

## Metrics (short)

- **Strict acceptance:** Accepted ÷ (Accepted + Rejected). Pending is excluded from the denominator; pending % is shown separately.
- **Phone issues:** Invalid 10-digit patterns, obvious test numbers, or duplicate phones across leads (no validity column in the CSV).
- **Verdicts:** Tunable in [`src/lib/constants.ts`](src/lib/constants.ts); full definitions in the in-app **Methodology** section.

## Daily development

Typical loop: install once, then run the dev server.

```bash
npm install
npm run dev
```

Open the URL Vite prints (default base `/`). Use this for all UI and data changes.

## Demo (60 seconds)

1. Open the **[live link](https://kabhishek18.github.io/Lead-Quality-Dashboard/)**.
2. Read **Start here**, then **Executive summary**—note verdict **legend** (green / amber / red) and a **Scale** vs **Cut** source.
3. Optionally skim **Charts** and **Geo**; scroll to **Methodology** for metric definitions.
4. Done.

## Data

Bundled at [`public/leads_dataset.csv`](public/leads_dataset.csv) (copy of the assignment CSV). The app loads it at runtime via `fetch` using Vite’s `import.meta.env.BASE_URL`.

## Deploy (GitHub Pages)

### Production build (only when deploying or matching GitHub Pages)

You usually do **not** need this for day-to-day work—use `npm run dev` above. Use a production build when checking asset paths or before relying on CI.

For this **project site** (repo [`Lead-Quality-Dashboard`](https://github.com/Kabhishek18/Lead-Quality-Dashboard)), CI sets `VITE_BASE` automatically. To build locally the same way:

```bash
VITE_BASE=/Lead-Quality-Dashboard/ npm run build
```

Preview the production build (same base as GitHub Pages):

```bash
npx vite preview --base /Lead-Quality-Dashboard/
```

For a **user site** (`username.github.io` with repo `username.github.io`), use:

```bash
VITE_BASE=/ npm run build
```

**Order matters.** The **deploy** step talks to GitHub’s Pages API. If Pages is not turned on for this repo, the deploy job fails with **`Failed to create deployment (status: 404)`** and *“Ensure GitHub Pages has been enabled”* — even when the **build** job is green and the `github-pages` artifact exists.

### First-time setup

1. Open the repo on GitHub → **Settings** (top bar) → **Pages** (left sidebar).
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”, not “None”). Save if prompted.
3. Still under **Settings** → **Actions** → **General** → **Workflow permissions** → choose **Read and write permissions** → **Save**.
4. Go to **Actions**, open **Deploy to GitHub Pages**, and **Re-run** the latest workflow (or push a commit).

After a green run, the site URL appears on the **Pages** settings screen and at **[https://kabhishek18.github.io/Lead-Quality-Dashboard/](https://kabhishek18.github.io/Lead-Quality-Dashboard/)**.

### Ongoing deploys

1. Push to [the repo](https://github.com/Kabhishek18/Lead-Quality-Dashboard).
2. The workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds with `VITE_BASE=/<repo>/` and deploys the `dist` folder.

If your default branch is not `main` or `master`, edit the workflow `on.push.branches` list.

### “404 — There isn’t a GitHub Pages site here”

That page means **GitHub has not published a site yet** (or the last deploy failed). Do this in order:

1. **Turn on GitHub Actions** for the repo: **Settings → Actions → General → Actions permissions** → allow actions (at least for this repo).
2. **Set Pages to use Actions** (this is easy to miss): **Settings → Pages → Build and deployment → Source** → choose **GitHub Actions**, not “Deploy from a branch”. Until this is set, the workflow’s deploy step will not go live.
3. Open the **Actions** tab, select **Deploy to GitHub Pages**, and confirm the latest run is **green**. If it failed, open the failed job and fix the error (often `npm ci` or permissions).
4. If the workflow waits for approval, check **Settings → Environments → `github-pages`** and clear any required reviewers for a personal repo, or approve the pending deployment in the Actions run.
5. After a successful deploy, wait **1–2 minutes** and refresh the **[live link](https://kabhishek18.github.io/Lead-Quality-Dashboard/)**. You can also confirm the deployment under **Settings → Pages** (it should show the environment URL).

To trigger a deploy without code changes: **Actions → Deploy to GitHub Pages → Run workflow**.

### Build succeeds but **deploy** fails with 404

| Symptom | Fix |
|--------|-----|
| `Failed to create deployment (status: 404)` / *Ensure GitHub Pages has been enabled* | **Settings → Pages → Source → GitHub Actions** (see [First-time setup](#first-time-setup)). |
| Permission / `Resource not accessible` | **Settings → Actions → General → Workflow permissions → Read and write** → Save → re-run workflow. |

The workflow cannot enable Pages for you; that has to be done in **Settings → Pages** once per repo.

## Stack

Vite, React, TypeScript, Papa Parse, Recharts.
