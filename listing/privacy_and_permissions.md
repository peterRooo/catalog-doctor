# Privacy and Permissions Notes

## Data Access

Catalog Doctor requests read-only catalog access for the first version:

- `read_products`
- `read_inventory`

The app reads product, variant, image, SEO, inventory, and collection metadata needed to generate a catalog health report.

## Data Writes

Version 1 does not write or mutate merchant data.

## Storefront Impact

Version 1 does not inject scripts, app blocks, pixels, or theme code. It has no storefront performance impact.

## Customer Data

Version 1 does not request customer, order, checkout, payment, or marketing consent data.

## Billing

Version 1 is free and does not use Shopify Billing API or Managed Pricing.

## App Uninstall

The app handles `app/uninstalled` webhooks and deletes the stored session for the shop.

## Privacy Policy Draft

Catalog Doctor uses read-only access to inspect product and collection metadata in order to generate catalog health reports. We do not sell merchant data. We do not access customer payment information. We do not modify your products, theme, checkout, or storefront. If you uninstall the app, the app removes its stored Shopify session for your shop.

Public privacy policy paths:

- App route: `/privacy`
- Static file: `/privacy.html`

Support email: 858338966@qq.com
