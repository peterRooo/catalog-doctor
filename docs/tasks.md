# Catalog Doctor Task Breakdown

## Phase 1: Planning

- [x] Create independent app directory.
- [x] Define MVP scope and non-goals.
- [x] Define minimum read-only Shopify scopes.
- [x] Document review positioning.

## Phase 2: App Foundation

- [x] Create Remix/Shopify project structure.
- [x] Add package scripts and dependencies.
- [x] Add Prisma session model.
- [x] Add Shopify app config template.
- [x] Add environment template.

## Phase 3: Scanner

- [x] Create normalized catalog data types.
- [x] Implement catalog issue rules.
- [x] Implement score and severity summary.
- [x] Add deterministic fixture tests.

## Phase 4: Shopify Data Access

- [x] Query products, variants, media, SEO fields, publication status, and inventory.
- [x] Query custom collections and product counts.
- [x] Normalize GraphQL results into scanner input.
- [x] Handle API failures with a user-readable error state.

## Phase 5: UI

- [x] Build embedded app dashboard.
- [x] Show scan summary and health score.
- [x] Show issue table with suggested fixes.
- [x] Add browser-side CSV export.
- [x] Add empty state and error state.
- [x] Add local `/preview` page for fixture-based UI validation before Shopify login.

## Phase 6: Verification

- [x] Run install.
- [x] Run typecheck.
- [x] Run unit tests.
- [x] Run build.
- [x] Smoke-test `/preview` and static asset HTTP responses locally.
- [x] Create Shopify dev store `catalog-doctor-test`.
- [x] Run live Shopify OAuth/install test in development store.
- [x] Confirm embedded app renders scan results in Shopify Admin.

## Phase 7: Store Listing Assets

- [x] Prepare app listing copy.
- [x] Prepare privacy/support notes.
- [x] Generate logo and promotional artwork.
- [x] Save final assets in `public/assets` and `listing`.
- [x] Capture Shopify Admin screenshot after live install.

## Phase 8: User Publishing Step

- [x] Create Partner Dashboard app and upload app icon.
- [x] Configure active development version for Cloudflare tunnel.
- [ ] Deploy to stable production hosting.
- [ ] Configure production app URLs after hosting.
- [ ] Run automated checks in Partner Dashboard.
- [ ] Submit app for review.
