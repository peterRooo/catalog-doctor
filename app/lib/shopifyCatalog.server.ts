import type { CatalogCollection, CatalogProduct, CatalogSnapshot, CatalogVariant } from "./scanner";

type AdminContext = {
  graphql: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;
};

type ProductsResponse = {
  data?: {
    products?: {
      nodes?: ProductNode[];
      pageInfo?: { hasNextPage: boolean };
    };
    collections?: {
      nodes?: CollectionNode[];
      pageInfo?: { hasNextPage: boolean };
    };
  };
  errors?: unknown;
};

type ProductNode = {
  id: string;
  title: string;
  handle: string;
  status: string;
  publishedAt?: string | null;
  descriptionHtml?: string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
  } | null;
  featuredMedia?: {
    preview?: {
      image?: {
        url?: string | null;
      } | null;
    } | null;
  } | null;
  variants?: {
    nodes?: VariantNode[];
  };
};

type VariantNode = {
  id: string;
  title: string;
  sku?: string | null;
  price?: string | null;
  compareAtPrice?: string | null;
  inventoryQuantity?: number | null;
  image?: {
    url?: string | null;
  } | null;
};

type CollectionNode = {
  id: string;
  title: string;
  handle: string;
  productsCount?: {
    count?: number | null;
  } | null;
};

const CATALOG_QUERY = `#graphql
  query CatalogDoctorScan($productLimit: Int!, $collectionLimit: Int!, $variantLimit: Int!) {
    products(first: $productLimit, sortKey: UPDATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
      }
      nodes {
        id
        title
        handle
        status
        publishedAt
        descriptionHtml
        seo {
          title
          description
        }
        featuredMedia {
          preview {
            image {
              url
            }
          }
        }
        variants(first: $variantLimit) {
          nodes {
            id
            title
            sku
            price
            compareAtPrice
            image {
              url
            }
          }
        }
      }
    }
    collections(first: $collectionLimit, sortKey: UPDATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
      }
      nodes {
        id
        title
        handle
        productsCount {
          count
        }
      }
    }
  }
`;

export async function loadCatalogSnapshot(admin: AdminContext): Promise<CatalogSnapshot> {
  const response = await admin.graphql(CATALOG_QUERY, {
    variables: {
      productLimit: 100,
      collectionLimit: 100,
      variantLimit: 50,
    },
  });
  const payload = (await response.json()) as ProductsResponse;

  if (payload.errors) {
    throw new Error("Shopify returned an error while reading catalog data.");
  }

  const products = payload.data?.products?.nodes?.map(normalizeProduct) ?? [];
  const collections = payload.data?.collections?.nodes?.map(normalizeCollection) ?? [];

  return {
    products,
    collections,
    scannedAt: new Date().toISOString(),
    limitReached: Boolean(payload.data?.products?.pageInfo?.hasNextPage || payload.data?.collections?.pageInfo?.hasNextPage),
  };
}

function normalizeProduct(product: ProductNode): CatalogProduct {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    status: product.status,
    isPublished: Boolean(product.publishedAt),
    descriptionText: stripHtml(product.descriptionHtml ?? ""),
    featuredImageUrl: product.featuredMedia?.preview?.image?.url,
    seoTitle: product.seo?.title,
    seoDescription: product.seo?.description,
    variants: product.variants?.nodes?.map(normalizeVariant) ?? [],
  };
}

function normalizeVariant(variant: VariantNode): CatalogVariant {
  return {
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    price: moneyToNumber(variant.price),
    compareAtPrice: variant.compareAtPrice ? moneyToNumber(variant.compareAtPrice) : null,
    inventoryQuantity: variant.inventoryQuantity,
    imageUrl: variant.image?.url,
  };
}

function normalizeCollection(collection: CollectionNode): CatalogCollection {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    productCount: collection.productsCount?.count ?? 0,
  };
}

function moneyToNumber(value?: string | null): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
