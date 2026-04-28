# Publish Checklist

## Local Verification

- [x] `npm install`
- [x] `npx prisma generate`
- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run build`

## Shopify Partner Setup

- [x] Create Partner Dashboard app: `Catalog Doctor`.
- [x] Upload compliant 1200px app icon.
- [ ] Log in to Shopify CLI.
- [ ] Run `npx shopify app config link --client-id 34df8619b2978ecc0a1e7f392b62fe67`.
- [x] Select or create the Partner Dashboard app.
- [x] Confirm scopes are `read_products,read_inventory`.
- [x] Configure temporary Cloudflare application URL for development.
- [x] Configure temporary Cloudflare redirect URLs for development.
- [x] Create development store test data.
- [x] Test OAuth/install in `catalog-doctor-test`.

## Live Test Result

- [x] App installed successfully in `catalog-doctor-test.myshopify.com`.
- [x] Embedded app rendered inside Shopify Admin.
- [x] Scan completed against real development store data.
- [x] Screenshot saved: `listing/catalog-doctor-admin-screenshot.png`

## Production Before Review

- [ ] Replace temporary Cloudflare URL with stable production hosting URL.
- [ ] Replace `.env` production values on hosting provider.
- [ ] Publish a production app version in Dev Dashboard.
- [x] Add privacy policy page in app.
- [x] Add support email: `858338966@qq.com`.
- [ ] Add hosted privacy policy URL to Partner Dashboard listing.

## Hosting

- [ ] Choose hosting provider.
- [ ] Set environment variables:
  - `SHOPIFY_API_KEY`
  - `SHOPIFY_API_SECRET`
  - `SHOPIFY_APP_URL`
  - `SCOPES=read_products,read_inventory`
  - `DATABASE_URL`
- [ ] Run Prisma migration/deploy command in hosting environment.
- [ ] Confirm `/app` works inside Shopify Admin.
- [ ] Confirm `/webhooks/app/uninstalled` returns 200 for valid Shopify webhooks.

## App Store Submission

- [ ] Upload app icon.
- [ ] Upload promotional image/screenshot.
- [ ] Add listing copy.
- [ ] Add support email.
- [ ] Add hosted privacy policy URL.
- [ ] Add demo instructions for reviewer.
- [ ] Run Shopify automated checks.
- [ ] Submit for review.
