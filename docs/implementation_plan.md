# Catalog Doctor: Store Health Check Implementation Plan

Date: 2026-04-28

## Product Goal

Build a free, read-only Shopify App Store app that helps merchants find catalog quality issues before they hurt sales. Version 1 intentionally avoids paid billing, storefront scripts, theme edits, automatic product mutations, and complex background infrastructure.

## MVP Scope

Catalog Doctor scans the merchant's Shopify catalog and reports:

- Products without a featured image.
- Product descriptions that are missing or very short.
- Missing SEO title or SEO description.
- Products with price equal to zero.
- Products with compare-at price less than or equal to price.
- Products that are published but have no available inventory.
- Variants missing images.
- Empty custom collections.

The app provides:

- Embedded Shopify Admin UI using Polaris.
- One-click scan of the first batch of products and collections.
- Health score and issue counts by severity.
- Issue list with suggested fixes.
- CSV export in the browser.
- No billing, no write operations, no theme injection.

## Non-goals for V1

- No paid subscription or Billing API.
- No AI-generated product edits yet.
- No scheduled scans or email reports.
- No automatic fixes or product writes.
- No checkout, discount, order, or customer data access.
- No app block or theme extension.

## Technical Architecture

- Remix app with Shopify app auth middleware.
- Shopify Polaris for embedded admin UI.
- Prisma + SQLite for session storage.
- Shopify Admin GraphQL API for read-only catalog data.
- Shared scanner module with deterministic tests.
- Browser-side CSV export to keep server small.

## Minimal Shopify Scopes

Expected scopes:

- `read_products`
- `read_inventory`

If collection reads are covered by product scope in the selected API version, keep scopes to those two. If Shopify review flags missing access, add the smallest required read-only scope.

## Core Files

- `app/shopify.server.ts`: Shopify auth, session storage, app config.
- `app/routes/app.tsx`: embedded app shell.
- `app/routes/app._index.tsx`: scan UI, loader, CSV export.
- `app/lib/scanner.ts`: issue detection and health scoring.
- `app/lib/shopifyCatalog.server.ts`: GraphQL data fetch and normalization.
- `tests/scanner.test.ts`: deterministic scanner tests.
- `shopify.app.toml`: app config template for linking after Partner login.

## Review Readiness

The first submission should emphasize:

- The app only reads catalog data.
- It does not edit products automatically.
- It does not inject storefront code or affect site speed.
- It helps merchants identify missing images, weak SEO fields, pricing mistakes, inventory visibility issues, and empty collections.

## Future Paid Upgrade Path

After the free app is published and installs are validated:

1. Add weekly scheduled scans and email alerts.
2. Add AI rewrite suggestions for SEO fields and descriptions.
3. Add merchant-approved product updates.
4. Add Managed Pricing with free and paid tiers.
5. Add agency multi-store reporting.
