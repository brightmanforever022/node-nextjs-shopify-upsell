import { useState } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { Page, Layout, Card, TextStyle } from "@shopify/polaris";
import snippetContent from "../utils/snippetContent";

const SHOP_TIPQUIK_QUERY = gql`
  query {
    shop {
      email
      primaryDomain {
        id
        host
      }
    }
  }
`;

const Install = (shopSettings) => {
  const { loading, error, data, refetch } = useQuery(SHOP_TIPQUIK_QUERY, {
    fetchPolicy: "network-only",
  });

  const [createSnippetLoading, setCreateSnippetLoading] = useState(false);
  const [createProductLoading, setCreateProductLoading] = useState(false);
  const [installationHelpStatus, setInstallationHelpStatus] = useState(
    shopSettings.shopInformation.installation_help_status
  );
  const [productCreated, setProductCreated] = useState(
    shopSettings.shopInformation.product_installation_status
  );
  const [snippetCreated, setSnippetCreated] = useState(
    shopSettings.shopInformation.snippet_installation_status
  );

  const handleCreateSnippet = async () => {
    setCreateSnippetLoading(true);

    const createSnippet = await fetch("/createSnippet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset: {
          key: "snippets/tipquik.liquid",
          value: snippetContent,
        },
      }),
    });
    const createSnippetJson = await createSnippet.json();

    setCreateSnippetLoading(false);
    setSnippetCreated(true);
  };

  const handleCreateProduct = async () => {
    setCreateProductLoading(true);

    const createProduct = await fetch("/createProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product: {
          title: "Tip/Gratuity",
          variants: [
            {
              price: 0.01,
              sku: "TIPQUIK",
              taxable: false,
              requires_shipping: false,
            },
          ],
        },
      }),
    });
    const createProductJson = await createProduct.json();

    setCreateProductLoading(false);
    setProductCreated(true);
  };

  const handleRequestHelp = async () => {
    const requestHelp = await fetch("/requestHelp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storedata: {
          shop_owner: data.shop.email,
          shop_domain: data.shop.primaryDomain.host,
        },
      }),
    });
    const requestHelpJson = await requestHelp.json();

    setInstallationHelpStatus(true);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Page title="Steps to install">
      <Layout>
        <Layout.Section>
          <Card
            sectioned
            title="Create the snippet"
            primaryFooterAction={{
              content: "Create theme snippet",
              loading: createSnippetLoading,
              disabled: snippetCreated,
              onAction: handleCreateSnippet,
            }}
          >
            <p>
              Click the button below to install the{" "}
              <TextStyle variation="code">tipquik.liquid</TextStyle> snippet on
              your published theme.
            </p>
            {snippetCreated && <p>You have already created snippet file.</p>}
          </Card>

          <Card title="Include the snippet on your theme" sectioned>
            <p>
              Manually add the below code to your{" "}
              <TextStyle variation="code">theme.liquid</TextStyle> file,
              directly above the{" "}
              <TextStyle variation="code">{"</body>"}</TextStyle> tag.
            </p>
            <p>
              <TextStyle variation="code">{`{% render 'tipquik' %}`}</TextStyle>
            </p>
          </Card>

          <Card
            title="Create the product"
            sectioned
            primaryFooterAction={{
              content: "Create tip/gratuity product",
              loading: createProductLoading,
              disabled: productCreated,
              onAction: handleCreateProduct,
            }}
          >
            <p>Click the button below to create the Tip/Gratuity product.</p>
            {productCreated && <p>You have already created product.</p>}
          </Card>

          <Card
            title="Need help with installation?"
            sectioned
            primaryFooterAction={{
              content: "Request Help",
              onAction: handleRequestHelp,
              disabled: installationHelpStatus,
            }}
          >
            {installationHelpStatus && (
              <p>
                Your help request has been sent. We will reach out to the{" "}
                {shopSettings.shopInformation.store_owner_email} address soon.
              </p>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

Install.getInitialProps = async (ctx) => {
  let shopOrigin = "";
  if (ctx.query.shop) {
    shopOrigin = ctx.query.shop;
  } else {
    ctx.req.headers.cookie.split(";").map((pairValue) => {
      if (pairValue.includes("shopOrigin=")) {
        shopOrigin = pairValue.split("shopOrigin=")[1];
      }
    });
  }
  const shopSettings = await fetch(process.env.HOST + "getShopSettings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shop_domain: shopOrigin,
    }),
  });

  const settings = await shopSettings.json();
  return settings;
};

export default Install;
