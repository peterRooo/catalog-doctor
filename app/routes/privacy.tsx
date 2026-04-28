import { AppProvider, Card, Layout, Page, Text } from "@shopify/polaris";

export default function PrivacyPolicy() {
  return (
    <AppProvider i18n={{}}>
      <Page title="Privacy Policy">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ display: "grid", gap: "1rem" }}>
                <Text as="p">Effective date: April 28, 2026</Text>
                <Text as="p">
                  Catalog Doctor is a Shopify app that helps merchants identify catalog quality issues such as missing
                  images, incomplete SEO fields, pricing mistakes, and empty collections.
                </Text>
                <Text as="h2" variant="headingMd">
                  Information We Access
                </Text>
                <Text as="p">
                  Catalog Doctor requests read-only access to product, variant, image, SEO, pricing, and collection
                  metadata from the merchant&apos;s Shopify store. This information is used only to generate catalog
                  health reports inside Shopify Admin.
                </Text>
                <Text as="h2" variant="headingMd">
                  Information We Do Not Access
                </Text>
                <Text as="p">
                  Catalog Doctor does not request customer data, payment data, checkout data, order data, marketing
                  consent data, or theme files in the current version.
                </Text>
                <Text as="h2" variant="headingMd">
                  Data Writes
                </Text>
                <Text as="p">
                  Catalog Doctor does not automatically edit products, collections, inventory, storefront code, checkout,
                  or themes. The app provides issue reports and suggested fixes for the merchant to review.
                </Text>
                <Text as="h2" variant="headingMd">
                  Data Storage
                </Text>
                <Text as="p">
                  Catalog Doctor stores Shopify app session information required to keep the app installed and
                  authorized. Catalog scan results are generated on demand and are not sold to third parties.
                </Text>
                <Text as="h2" variant="headingMd">
                  Data Sharing
                </Text>
                <Text as="p">
                  We do not sell merchant data. We do not share merchant catalog data with advertisers or data brokers.
                </Text>
                <Text as="h2" variant="headingMd">
                  Uninstall
                </Text>
                <Text as="p">
                  When a merchant uninstalls Catalog Doctor, the app receives Shopify&apos;s uninstall webhook and removes
                  the stored Shopify session for that shop.
                </Text>
                <Text as="h2" variant="headingMd">
                  Contact
                </Text>
                <Text as="p">For privacy or support questions, contact 858338966@qq.com.</Text>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}
