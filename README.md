# Catalog Doctor

Catalog Doctor is a free, read-only Shopify catalog health check app. It scans products and collections for missing images, weak SEO fields, pricing mistakes, inventory visibility issues, and empty collections.

## Development

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev:remix
```

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

## Scopes

```text
read_products,read_inventory
```

## Listing Assets

- App icon: `public/assets/catalog-doctor-icon.png`
- Promotional image: `listing/catalog-doctor-promo.png`
