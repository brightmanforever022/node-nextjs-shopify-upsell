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

const Install = () => {
  const { loading, error, data, refetch } = useQuery(SHOP_TIPQUIK_QUERY, {
    fetchPolicy: "network-only",
  });

  const [createSnippetLoading, setCreateSnippetLoading] = useState(false);
  const [createProductLoading, setCreateProductLoading] = useState(false);
  const [installationHelpStatus, setInstallationHelpStatus] = useState(false);

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
    console.log(
      "Response for createSnippetJson:",
      JSON.stringify(createSnippetJson)
    );

    setCreateSnippetLoading(false);
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
    console.log(
      "Response for createProductJson:",
      JSON.stringify(createProductJson)
    );

    setCreateProductLoading(false);
  };

  const handleRequestHelp = async () => {
    const requestHelp = await fetch("/requestHelp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        store_owner: data.shop.email,
        store_domain: data.shop.primaryDomain.host,
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
              onAction: handleCreateSnippet,
            }}
          >
            <p>
              Click the button below to install the{" "}
              <TextStyle variation="code">tipquik.liquid</TextStyle> snippet on
              your published theme.
            </p>
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
              onAction: handleCreateProduct,
            }}
          >
            <p>Click the button below to create the Tip/Gratuity product.</p>
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
                Your help request has been sent, we’ll be in touch with you at
                storeEmail@asdf.com soon.
              </p>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Install;
