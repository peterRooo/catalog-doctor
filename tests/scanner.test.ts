import { describe, expect, it } from "vitest";
import { issuesToCsv, scanCatalog, type CatalogSnapshot } from "../app/lib/scanner";

const fixture: CatalogSnapshot = {
  scannedAt: "2026-04-28T00:00:00.000Z",
  products: [
    {
      id: "gid://shopify/Product/1",
      title: "Bare Product",
      handle: "bare-product",
      status: "ACTIVE",
      isPublished: true,
      descriptionText: "",
      featuredImageUrl: null,
      seoTitle: "",
      seoDescription: null,
      variants: [
        {
          id: "gid://shopify/ProductVariant/1",
          title: "Default",
          sku: "BARE-1",
          price: 0,
          compareAtPrice: 0,
          inventoryQuantity: 0,
        },
      ],
    },
    {
      id: "gid://shopify/Product/2",
      title: "Short Description Shirt",
      handle: "short-description-shirt",
      status: "ACTIVE",
      isPublished: true,
      descriptionText: "Nice shirt.",
      featuredImageUrl: "https://cdn.shopify.com/shirt.jpg",
      seoTitle: "Short Description Shirt",
      seoDescription: "A casual shirt.",
      variants: [
        {
          id: "gid://shopify/ProductVariant/2",
          title: "Blue",
          sku: "SHIRT-BLUE",
          price: 29,
          compareAtPrice: 25,
          inventoryQuantity: 12,
        },
        {
          id: "gid://shopify/ProductVariant/3",
          title: "Green",
          sku: "SHIRT-GREEN",
          price: 31,
          compareAtPrice: 39,
          inventoryQuantity: 3,
          imageUrl: "https://cdn.shopify.com/green.jpg",
        },
      ],
    },
  ],
  collections: [
    {
      id: "gid://shopify/Collection/1",
      title: "Empty Collection",
      handle: "empty",
      productCount: 0,
    },
  ],
};

describe("scanCatalog", () => {
  it("detects catalog health issues with severities", () => {
    const result = scanCatalog(fixture);

    expect(result.summary.productCount).toBe(2);
    expect(result.summary.collectionCount).toBe(1);
    expect(result.summary.criticalCount).toBe(2);
    expect(result.summary.warningCount).toBe(5);
    expect(result.summary.infoCount).toBe(4);
    expect(result.issues.map((item) => item.problem)).toContain("Product has no featured image.");
    expect(result.issues.map((item) => item.problem)).toContain("Variant price is zero.");
    expect(result.issues.map((item) => item.problem)).toContain("Collection is empty.");
  });

  it("exports issues to CSV", () => {
    const result = scanCatalog(fixture);
    const csv = issuesToCsv(result.issues);

    expect(csv).toContain('"Severity","Category","Resource Type","Resource","Problem","Recommendation"');
    expect(csv).toContain('"critical","Images","Product","Bare Product","Product has no featured image.');
  });
});
