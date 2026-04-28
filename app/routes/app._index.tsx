import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  DataTable,
  EmptyState,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  ProgressBar,
  Text,
} from "@shopify/polaris";
import { useMemo } from "react";
import { loadCatalogSnapshot } from "../lib/shopifyCatalog.server";
import { issuesToCsv, scanCatalog, type CatalogIssue, type ScanResult } from "../lib/scanner";
import { authenticate } from "../shopify.server";

type LoaderData = {
  result: ScanResult | null;
  error: string | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  try {
    const snapshot = await loadCatalogSnapshot(admin);
    const result = scanCatalog(snapshot);

    return json<LoaderData>({
      result,
      error: null,
    });
  } catch (error) {
    console.error(error);
    return json<LoaderData>({
      result: null,
      error: "Catalog Doctor could not read your catalog data. Check app permissions and try again.",
    });
  }
};

export default function Dashboard() {
  const { result, error } = useLoaderData<typeof loader>();
  const csv = useMemo(() => (result ? issuesToCsv(result.issues) : ""), [result]);

  return (
    <Page
      title="Catalog Doctor"
      subtitle="Find missing images, weak SEO fields, pricing mistakes, and empty collections."
      primaryAction={
        <Button variant="primary" onClick={() => window.location.reload()}>
          Run scan
        </Button>
      }
      secondaryActions={[
        {
          content: "Export CSV",
          disabled: !result || result.issues.length === 0,
          onAction: () => downloadCsv(csv),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {error ? (
              <Banner tone="critical" title="Scan failed">
                <p>{error}</p>
              </Banner>
            ) : null}

            {result?.limitReached ? (
              <Banner tone="warning" title="Partial scan">
                <p>This free preview scans the most recently updated 100 products and 100 collections. A future paid plan can support full-catalog scheduled scans.</p>
              </Banner>
            ) : null}

            {result ? <SummaryCards result={result} /> : null}
            {result ? <IssuesCard issues={result.issues} /> : <EmptyReport />}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
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
            Last scanned {new Date(result.scannedAt).toLocaleString()}
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
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">
              Issues to review
            </Text>
            <Text as="p" tone="subdued">
              Review these findings before they affect shopper trust, search previews, or catalog navigation.
            </Text>
          </BlockStack>
        </InlineStack>
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

function EmptyReport() {
  return (
    <Card>
      <EmptyState heading="Run your first catalog health check" image="/assets/empty-state.svg">
        <p>Catalog Doctor scans catalog data with read-only access and reports problems you can fix in Shopify Admin.</p>
      </EmptyState>
    </Card>
  );
}

function downloadCsv(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `catalog-doctor-issues-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
