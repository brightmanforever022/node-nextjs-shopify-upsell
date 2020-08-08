import { useState } from "react";
import { Page, Layout, Card, PageActions } from "@shopify/polaris";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import DefaultTippingPercentage from "../components/DefaultTippingPercentage";
import EnableTipQuikApp from "../components/EnableTipQuikApp";
import EnableCustomTipOption from "../components/EnableCustomTipOption";
import EnablePoweredTipQuik from "../components/EnablePoweredTipQuik";
import TipModalTitle from "../components/TipModalTitle";
import TipModalDescription from "../components/TipModalDescription";
import TipModalTextColor from "../components/TipModalTextColor";
import TipModalBgColor from "../components/TipModalBgColor";
import initialSettings from "../utils/initialSettings";

const SHOP_TIPQUIK_METAFIELD_QUERY = gql`
  query {
    shop {
      metafields(first: 1, namespace: "tipquik") {
        edges {
          node {
            key
            value
          }
        }
      }
    }
  }
`;

const Index = (shopSettings) => {
  const { loading, error, data, refetch } = useQuery(
    SHOP_TIPQUIK_METAFIELD_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const [updateMetafieldIsLoading, setUpdateMetafieldIsLoading] = useState(
    false
  );
  const [
    installInitialSettingsLoading,
    setInstallInitialSettingsLoading,
  ] = useState(false);

  const [newSettings, updateSettings] = useState();
  const shopPlan =
    shopSettings.subscription_status && shopSettings.subscription_plan > 0;

  const handleUpdateSettings = async () => {
    setUpdateMetafieldIsLoading(true);

    const updateMetafield = await fetch("/updateSettingsMetafield", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metafieldValue: JSON.stringify(newSettings),
      }),
    });
    const updateMetafieldJson = await updateMetafield.json();
    console.log(
      "Response for updateMetafieldJson:",
      JSON.stringify(updateMetafieldJson)
    );

    // Refetch data to make sure everything is up to date
    setUpdateMetafieldIsLoading(false);
    refetch();
  };

  const handleInstallInitialSettings = async () => {
    setInstallInitialSettingsLoading(true);

    const updateMetafield = await fetch("/updateSettingsMetafield", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metafieldValue: JSON.stringify(initialSettings),
      }),
    });
    const updateMetafieldJson = await updateMetafield.json();
    console.log(
      "Response for updateMetafieldJson:",
      JSON.stringify(updateMetafieldJson)
    );

    // Refetch data to make sure everything is up to date
    setInstallInitialSettingsLoading(false);
    refetch();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const originalSettings = data.shop.metafields.edges[0]
    ? JSON.parse(data.shop.metafields.edges[0].node.value)
    : null;
  const settings = newSettings ? newSettings : originalSettings;

  return (
    <Page
      title="Tip Settings"
      primaryAction={
        newSettings &&
        JSON.stringify(newSettings) != JSON.stringify(originalSettings)
          ? {
              content: "Update settings",
              onAction: handleUpdateSettings,
              loading: updateMetafieldIsLoading,
            }
          : null
      }
    >
      {!originalSettings && (
        <Layout>
          <Layout.Section>
            <Card
              title="Initialize TipQuik"
              primaryFooterAction={{
                content: "Install initial settings",
                loading: installInitialSettingsLoading,
                onAction: handleInstallInitialSettings,
              }}
            >
              <Card.Section>
                Press the button below initiliaze TipQuik settings.
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      )}

      {originalSettings && (
        <Layout>
          <DefaultTippingPercentage
            settings={settings}
            updateSettings={updateSettings}
          />

          <EnableTipQuikApp
            settings={settings}
            updateSettings={updateSettings}
          />

          <EnableCustomTipOption
            settings={settings}
            shopPlan={shopPlan}
            updateSettings={updateSettings}
          />

          <EnablePoweredTipQuik
            settings={settings}
            shopPlan={shopPlan}
            updateSettings={updateSettings}
          />

          <TipModalTitle settings={settings} updateSettings={updateSettings} />

          <TipModalDescription
            settings={settings}
            updateSettings={updateSettings}
          />

          <TipModalBgColor
            settings={settings}
            updateSettings={updateSettings}
          />

          <TipModalTextColor
            settings={settings}
            updateSettings={updateSettings}
          />

          <Layout.Section></Layout.Section>
        </Layout>
      )}

      <PageActions
        primaryAction={
          newSettings &&
          JSON.stringify(newSettings) != JSON.stringify(originalSettings)
            ? {
                content: "Update settings",
                onAction: handleUpdateSettings,
                loading: updateMetafieldIsLoading,
              }
            : null
        }
      />
    </Page>
  );
};

Index.getInitialProps = async (ctx) => {
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
  console.log("shop Origin in index page: ", shopOrigin);
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

  return { shopSettings: settings };
};

export default Index;
