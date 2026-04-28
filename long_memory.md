# Shopify App Long Memory

This file records the reusable lessons from building and publishing `Catalog Doctor`.

## Current Reference Project

- App: `Catalog Doctor`
- Repo: `https://github.com/peterRooo/catalog-doctor`
- Production URL: `https://catalog-doctor.vercel.app`
- Vercel team: `ropers-projects`
- Shopify app ID: `353906524161`
- Shopify client ID: `34df8619b2978ecc0a1e7f392b62fe67`
- Test store: `catalog-doctor-test.myshopify.com`
- Support email: `858338966@qq.com`
- Privacy URL: `https://peterrooo.github.io/catalog-doctor/privacy.html`

## Fast Path For Next Shopify App

1. Start with Shopify Remix app scaffold.
2. Keep first release simple: no billing, minimal scopes, no extra privileged permissions.
3. Use Vercel + Neon Postgres for production session storage.
4. Put privacy policy in `public/privacy.html`; also add a `/privacy` route if useful.
5. Deploy web app to Vercel first.
6. Update `shopify.app.toml` to use the Vercel URL.
7. Create/publish a new Shopify app version in Dev Dashboard.
8. Install/open in dev store and confirm embedded app loads inside Shopify Admin.

## Recommended Config

`shopify.app.toml`:

```toml
application_url = "https://<app>.vercel.app"
embedded = true

[access_scopes]
scopes = "read_products"

[auth]
redirect_urls = [
  "https://<app>.vercel.app/auth/callback",
  "https://<app>.vercel.app/auth/shopify/callback",
  "https://<app>.vercel.app/api/auth/callback"
]

[webhooks]
api_version = "2026-01"
```

`vercel.json`:

```json
{
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "remix"
}
```

`package.json` scripts:

```json
{
  "vercel-build": "prisma generate && prisma migrate deploy && remix vite:build",
  "typecheck": "tsc --noEmit",
  "test": "vitest run"
}
```

`.vercelignore` must exclude local secrets:

```gitignore
.env
.env.*
!.env.example
.vercel
node_modules
.cache
*.sqlite
*.sqlite-journal
```

## Vercel + Database Notes

- Vercel CLI was easiest after GitHub import got stuck on GitHub integration/namespace issues.
- CLI login flow works with device auth:
  - `npm exec --yes vercel -- whoami`
  - open the device auth URL in logged-in Chrome.
- Link/create project:
  - `npm exec --yes vercel -- link --yes --scope ropers-projects --project <project-name>`
- Deploy:
  - `npm exec --yes vercel -- deploy --prod --yes --scope ropers-projects`
- Vercel aliases production to `https://<project>.vercel.app` after successful prod deploy.
- Vercel/Neon free storage was created successfully.
- Neon env export may contain a whole `.env` template, not only one URL. Extract the actual `POSTGRES_PRISMA_URL` or `DATABASE_URL` line before setting Vercel `DATABASE_URL`.
- Use Postgres for production Prisma session storage. SQLite is fine locally, bad for serverless production.

Required Vercel env vars:

```text
SHOPIFY_API_KEY=<client id>
SHOPIFY_API_SECRET=<from local .env; never commit>
SHOPIFY_APP_URL=https://<app>.vercel.app
SCOPES=read_products
DATABASE_URL=<postgresql://...>
```

## GitHub Notes

- Main repo owner used here: `peterRooo`.
- GitHub token is in `~/.env_local` as `GITHUB_TOKEN_FOR_peterRoo`.
- Do not print or commit tokens.
- The old remote may contain a token in the URL; mask it when displaying `git remote -v`.
- Mirror repo under `roperluo32` was not useful because push permission failed.

## Shopify Dev Dashboard Notes

- The Dashboard app version page can publish config without Shopify CLI.
- To change production URL:
  1. Open `https://dev.shopify.com/dashboard/<org>/apps/<app_id>/versions/new`.
  2. Set redirect URLs and app URL.
  3. Set scopes.
  4. Publish new version.
- Publishing creates a new app version and makes it active. For this project: `catalog-doctor-5`.
- Shopify may require explicit confirmation in a modal after clicking publish.
- After publishing, open the app from Dev Dashboard install link or Shopify Admin to verify the iframe uses the production URL.

## Scopes Lesson

- `read_inventory` caused a Dashboard warning: some scopes need extra Shopify access approval.
- For a first no-billing app, prefer `read_products` only.
- With `read_products`, product image, SEO, description, price, variant image, and collection checks still work.
- If inventory checks are needed later, request/justify `read_inventory` and add it after the first release flow is proven.

## Issues Hit And Fixes

- Problem: Vercel Git import only showed `roperluo32`, not `peterRooo`.
  - Fix: Use Vercel CLI deploy instead of waiting on GitHub integration UI.

- Problem: Vercel build failed with Prisma URL validation.
  - Cause: local `.env` was uploaded; Prisma read local SQLite-style `DATABASE_URL` instead of Vercel env.
  - Fix: add `.vercelignore` excluding `.env` and `.env.*`.

- Problem: Vercel `DATABASE_URL` was set to the whole Neon env template.
  - Fix: extract the actual `postgresql://...` value, preferably `POSTGRES_PRISMA_URL`.

- Problem: `/privacy` returned 500.
  - Cause: route used Polaris components without `AppProvider`.
  - Fix: wrap public Polaris route in `<AppProvider i18n={{}}>`.
  - Safer fallback: always provide static `public/privacy.html`.

- Problem: direct `curl /auth?shop=...` returned 410.
  - Not necessarily a production bug. Shopify embedded OAuth/session flow expects proper admin context and signed params.
  - Real verification should open via Shopify Admin install/app link.

- Problem: Shopify CLI needed login and Google account selection.
  - Fix: use Dev Dashboard app version UI when already logged in.

## Verification Commands

```bash
npm test
npm run typecheck
npm run build
npm exec --yes vercel -- deploy --prod --yes --scope ropers-projects
curl -I https://<app>.vercel.app/privacy
curl -I https://<app>.vercel.app/privacy.html
curl -I https://<app>.vercel.app/preview
```

Final verification must be visual inside Shopify Admin, not only curl.

## Submission Assets

- App icon: `listing/catalog-doctor-icon.png`
- Admin screenshot: `listing/catalog-doctor-admin-screenshot.png`
- Production admin screenshot: `listing/catalog-doctor-prod-admin-screenshot.png`
- Checklist: `listing/publish_checklist.md`

## Security Rules

- Never commit `.env`, `.vercel`, local SQLite DBs, API secrets, OAuth secrets, or raw database URLs.
- Never paste `SHOPIFY_API_SECRET`, GitHub token, or Neon URL in chat/log summaries.
- Before publishing Shopify app version, confirm with user because it changes live cloud app config.
