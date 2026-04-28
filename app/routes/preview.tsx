import { AppProvider, Badge, BlockStack, Box, Button, Card, DataTable, EmptyState, InlineGrid, InlineStack, Page, ProgressBar, Text } from "@shopify/polaris";
import { issuesToCsv, scanCatalog, type CatalogIssue, type CatalogSnapshot, type ScanResult } from "../lib/scanner";

const previewSnapshot: CatalogSnapshot = {
  scannedAt: new Date().toISOString(),
  products: [
    {
      id: "preview-product-1",
      title: "Everyday Tote",
      handle: "everyday-tote",
      status: "ACTIVE",
      isPublished: true,
      descriptionText: "",
      featuredImageUrl: null,
      seoTitle: "",
      seoDescription: "",
      variants: [
        {
          id: "preview-variant-1",
          title: "Default",
          sku: "TOTE-001",
          price: 0,
          compareAtPrice: 0,
          inventoryQuantity: 0,
        },
      ],
    },
    {
      id: "preview-product-2",
      title: "Desk Lamp",
      handle: "desk-lamp",
      status: "ACTIVE",
      isPublished: true,
      descriptionText: "Modern desk lamp.",
      featuredImageUrl: "https://cdn.shopify.com/lamp.jpg",
      seoTitle: "Desk Lamp",
      seoDescription: "A modern desk lamp for focused work.",
      variants: [
        {
          id: "preview-variant-2",
          title: "Black",
          sku: "LAMP-BLK",
          price: 42,
          compareAtPrice: 39,
          inventoryQuantity: 12,
        },
        {
          id: "preview-variant-3",
          title: "White",
          sku: "LAMP-WHT",
          price: 42,
          compareAtPrice: 55,
          inventoryQuantity: 8,
          imageUrl: "https://cdn.shopify.com/lamp-white.jpg",
        },
      ],
    },
  ],
  collections: [
    {
      id: "preview-collection-1",
      title: "Spring Launch",
      handle: "spring-launch",
      productCount: 0,
    },
  ],
};

export default function Preview() {
  const result = scanCatalog(previewSnapshot);
  const csv = issuesToCsv(result.issues);

  return (
    <AppProvider i18n={{}}>
      <Page
        title="Catalog Doctor"
        subtitle="Local preview with fixture data"
        primaryAction={<Button variant="primary">Run scan</Button>}
        secondaryActions={[
          {
            content: "Export CSV",
            onAction: () => downloadCsv(csv),
          },
        ]}
      >
        <BlockStack gap="400">
          <SummaryCards result={result} />
          <IssuesCard issues={result.issues} />
        </BlockStack>
      </Page>
    </AppProvider>
  );
}

function SummaryCards({ result }: { result: ScanResult }) {
  const badgeTone = result.summary.healthScore >= 85 ? "success" : result.summary.healthScore >= 65 ? "warning" : "critical";
  const progressTone = result.summary.healthScore >= 85 ? "success" : result.summary.healthScore >= 65 ? "primary" : "critical";

  return (
    <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h2" variant="headingMd">
              Health score
            </Text>
            <Badge tone={badgeTone}>{`${result.summary.healthScore}/100`}</Badge>
          </InlineStack>
          <ProgressBar progress={result.summary.healthScore} tone={progressTone} size="small" />
          <Text as="p" tone="subdued">
            Fixture scan preview
          </Text>
        </BlockStack>
      </Card>
      <MetricCard label="Products scanned" value={result.summary.productCount} />
      <MetricCard label="Collections scanned" value={result.summary.collectionCount} />
      <MetricCard label="Total issues" value={result.summary.issueCount} />
    </InlineGrid>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="p" tone="subdued">
          {label}
        </Text>
        <Text as="p" variant="heading2xl">
          {value}
        </Text>
      </BlockStack>
    </Card>
  );
}

function IssuesCard({ issues }: { issues: CatalogIssue[] }) {
  if (issues.length === 0) {
    return (
      <Card>
        <EmptyState heading="Your scanned catalog looks healthy" image="/assets/empty-state.svg">
          <p>No catalog quality issues were found in this scan.</p>
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card padding="0">
      <Box padding="400">
        <Text as="h2" variant="headingMd">
          Issues to review
        </Text>
      </Box>
      <DataTable
        columnContentTypes={["text", "text", "text", "text", "text"]}
        headings={["Severity", "Category", "Resource", "Problem", "Suggested fix"]}
        rows={issues.map((item) => [
          <SeverityBadge key={`${item.id}-severity`} severity={item.severity} />,
          item.category,
          `${item.resourceType}: ${item.resourceTitle}`,
          item.problem,
          item.recommendation,
        ])}
      />
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: CatalogIssue["severity"] }) {
  if (severity === "critical") return <Badge tone="critical">Critical</Badge>;
  if (severity === "warning") return <Badge tone="warning">Warning</Badge>;
  return <Badge tone="info">Info</Badge>;
}

function downloadCsv(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "catalog-doctor-preview.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
