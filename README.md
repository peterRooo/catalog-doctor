# Catalog Doctor

Catalog Doctor is a free, read-only Shopify catalog health check app. It scans products and collections for missing images, weak SEO fields, pricing mistakes, inventory visibility issues, and empty collections.

## Development

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev:remix
```

Production uses Postgres for Shopify session storage. For local development, use
any reachable Postgres database and set `DATABASE_URL` in `.env`.

For Shopify OAuth testing, log in to the Shopify CLI and link the app:

```bash
shopify app config link
shopify app dev
```

## Verification

```bash
npm test
npm run typecheck
npm run build
```

## Vercel Deployment

This app can run on Vercel as a Remix app. Before the first production deploy,
create or connect a Postgres database in Vercel and set these environment
variables:

```text
SHOPIFY_API_KEY=34df8619b2978ecc0a1e7f392b62fe67
SHOPIFY_API_SECRET=...
SHOPIFY_APP_URL=https://your-vercel-domain.vercel.app
SCOPES=read_products,read_inventory
DATABASE_URL=postgresql://...
```

Vercel uses `npm run vercel-build`, which generates Prisma Client, applies
database migrations, and builds Remix.

## Scopes

```text
read_products,read_inventory
```

## Listing Assets

- App icon: `public/assets/catalog-doctor-icon.png`
- Promotional image: `listing/catalog-doctor-promo.png`

## Privacy Policy

https://peterrooo.github.io/catalog-doctor/privacy.html
