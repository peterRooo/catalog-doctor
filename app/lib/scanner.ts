export type Severity = "critical" | "warning" | "info";

export type CatalogVariant = {
  id: string;
  title: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  inventoryQuantity?: number | null;
  imageUrl?: string | null;
};

export type CatalogProduct = {
  id: string;
  title: string;
  handle: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT" | string;
  isPublished: boolean;
  descriptionText: string;
  featuredImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  variants: CatalogVariant[];
};

export type CatalogCollection = {
  id: string;
  title: string;
  handle: string;
  productCount: number;
};

export type CatalogSnapshot = {
  products: CatalogProduct[];
  collections: CatalogCollection[];
  scannedAt: string;
  limitReached?: boolean;
};

export type CatalogIssue = {
  id: string;
  severity: Severity;
  category: "Images" | "SEO" | "Content" | "Pricing" | "Inventory" | "Collections";
  resourceType: "Product" | "Variant" | "Collection";
  resourceId: string;
  resourceTitle: string;
  problem: string;
  recommendation: string;
};

export type ScanSummary = {
  healthScore: number;
  productCount: number;
  collectionCount: number;
  issueCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
};

export type ScanResult = {
  summary: ScanSummary;
  issues: CatalogIssue[];
  scannedAt: string;
  limitReached: boolean;
};

const DESCRIPTION_MIN_LENGTH = 80;

export function scanCatalog(snapshot: CatalogSnapshot): ScanResult {
  const issues: CatalogIssue[] = [];

  for (const product of snapshot.products) {
    if (product.status === "ACTIVE" && !product.featuredImageUrl) {
      issues.push(issue("critical", "Images", "Product", product.id, product.title, "Product has no featured image.", "Add a clear featured image so shoppers can recognize the product in collections and search results."));
    }

    if (!product.descriptionText.trim()) {
      issues.push(issue("warning", "Content", "Product", product.id, product.title, "Product description is missing.", "Add a useful product description that explains benefits, materials, sizing, care, or usage."));
    } else if (product.descriptionText.trim().length < DESCRIPTION_MIN_LENGTH) {
      issues.push(issue("info", "Content", "Product", product.id, product.title, "Product description is very short.", `Expand the description to at least ${DESCRIPTION_MIN_LENGTH} characters with shopper-focused details.`));
    }

    if (!product.seoTitle?.trim()) {
      issues.push(issue("warning", "SEO", "Product", product.id, product.title, "SEO title is missing.", "Add a concise SEO title that includes the product name and primary search phrase."));
    }

    if (!product.seoDescription?.trim()) {
      issues.push(issue("warning", "SEO", "Product", product.id, product.title, "SEO description is missing.", "Add a meta description that summarizes the product and encourages clicks."));
    }

    const variantsWithInventory = product.variants.filter((variant) => typeof variant.inventoryQuantity === "number");
    const totalInventory = variantsWithInventory.reduce((sum, variant) => sum + Math.max(variant.inventoryQuantity ?? 0, 0), 0);

    if (product.status === "ACTIVE" && product.isPublished && variantsWithInventory.length > 0 && totalInventory === 0) {
      issues.push(issue("warning", "Inventory", "Product", product.id, product.title, "Published product has no available inventory.", "Review inventory tracking, incoming stock, or product visibility so shoppers do not hit a dead end."));
    }

    for (const variant of product.variants) {
      const label = variant.sku ? `${product.title} / ${variant.sku}` : `${product.title} / ${variant.title}`;

      if (variant.price === 0) {
        issues.push(issue("critical", "Pricing", "Variant", variant.id, label, "Variant price is zero.", "Set a valid selling price or archive the variant if it should not be sold."));
      }

      if (variant.compareAtPrice != null && variant.compareAtPrice <= variant.price) {
        issues.push(issue("info", "Pricing", "Variant", variant.id, label, "Compare-at price is not higher than price.", "Remove compare-at price or set it higher than the current price so sale messaging is accurate."));
      }

      if (product.featuredImageUrl && product.variants.length > 1 && !variant.imageUrl) {
        issues.push(issue("info", "Images", "Variant", variant.id, label, "Variant has no image.", "Assign a variant-specific image when color, style, or bundle contents differ."));
      }
    }
  }

  for (const collection of snapshot.collections) {
    if (collection.productCount === 0) {
      issues.push(issue("warning", "Collections", "Collection", collection.id, collection.title, "Collection is empty.", "Add products, adjust collection rules, or hide the collection from navigation until it is ready."));
    }
  }

  const summary = summarize(snapshot, issues);

  return {
    summary,
    issues,
    scannedAt: snapshot.scannedAt,
    limitReached: Boolean(snapshot.limitReached),
  };
}

function issue(
  severity: Severity,
  category: CatalogIssue["category"],
  resourceType: CatalogIssue["resourceType"],
  resourceId: string,
  resourceTitle: string,
  problem: string,
  recommendation: string,
): CatalogIssue {
  return {
    id: `${severity}:${category}:${resourceType}:${resourceId}:${problem}`,
    severity,
    category,
    resourceType,
    resourceId,
    resourceTitle,
    problem,
    recommendation,
  };
}

function summarize(snapshot: CatalogSnapshot, issues: CatalogIssue[]): ScanSummary {
  const criticalCount = issues.filter((item) => item.severity === "critical").length;
  const warningCount = issues.filter((item) => item.severity === "warning").length;
  const infoCount = issues.filter((item) => item.severity === "info").length;
  const productCount = snapshot.products.length;
  const collectionCount = snapshot.collections.length;
  const denominator = Math.max(productCount + collectionCount, 1);
  const weightedPenalty = criticalCount * 14 + warningCount * 7 + infoCount * 3;
  const healthScore = Math.max(0, Math.round(100 - weightedPenalty / denominator));

  return {
    healthScore,
    productCount,
    collectionCount,
    issueCount: issues.length,
    criticalCount,
    warningCount,
    infoCount,
  };
}

export function issuesToCsv(issues: CatalogIssue[]): string {
  const header = ["Severity", "Category", "Resource Type", "Resource", "Problem", "Recommendation"];
  const rows = issues.map((item) => [
    item.severity,
    item.category,
    item.resourceType,
    item.resourceTitle,
    item.problem,
    item.recommendation,
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}
