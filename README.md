# Lead Quality Dashboard

Static dashboard for **carrier account managers**: compare lead **sources** on strict carrier acceptance, pending risk, form-completion behavior, geography, and derived phone hygiene—then see **Scale / Watch / Cut** verdicts backed by explicit thresholds.

**Live demo:** after you enable GitHub Pages, use  
`https://<your-username>.github.io/<repo-name>/`  
(Replace with your username and repository name.)

## Metrics (short)

- **Strict acceptance:** Accepted ÷ (Accepted + Rejected). Pending is excluded from the denominator; pending % is shown separately.
- **Phone issues:** Invalid 10-digit patterns, obvious test numbers, or duplicate phones across leads (no validity column in the CSV).
- **Verdicts:** Tunable in [`src/lib/constants.ts`](src/lib/constants.ts); full definitions in the in-app **Methodology** section.

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (default base `/`).

## Production build

For a **GitHub project site** where the repo name is e.g. `Lead_Dashboard`:

```bash
VITE_BASE=/Lead_Dashboard/ npm run build
```

Preview:

```bash
npx vite preview
```

For a **user/org site** (`username.github.io` with repo named `username.github.io`), use:

```bash
VITE_BASE=/ npm run build
```

## Data

Bundled at [`public/leads_dataset.csv`](public/leads_dataset.csv) (copy of the assignment CSV). The app loads it at runtime via `fetch` using Vite’s `import.meta.env.BASE_URL`.

## Deploy (GitHub Pages)

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment:** set **Source** to **GitHub Actions**.
3. The workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds with `VITE_BASE=/<repo>/` and deploys the `dist` folder.

If your default branch is not `main` or `master`, edit the workflow `on.push.branches` list.

## Stack

Vite, React, TypeScript, Papa Parse, Recharts.
# Lead-Quality-Dashboard
