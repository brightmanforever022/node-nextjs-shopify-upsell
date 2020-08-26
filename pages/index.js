import { useState, useEffect, Fragment } from "react";
import Head from "next/head";
import { Page, Layout, FormLayout, Card, PageActions } from "@shopify/polaris";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import TopBannerInformation from "../components/TopBannerInformation";
import DefaultTippingPercentage from "../components/DefaultTippingPercentage";
import EnableTipQuikApp from "../components/EnableTipQuikApp";
import EnableCustomTipOption from "../components/EnableCustomTipOption";
import EnablePoweredTipQuik from "../components/EnablePoweredTipQuik";
import TipModalTitle from "../components/TipModalTitle";
import TipModalDescription from "../components/TipModalDescription";
import TipModalTextColor from "../components/TipModalTextColor";
import TipModalBgColor from "../components/TipModalBgColor";
import initialSettings from "../utils/initialSettings";
import FooterHelpDiv from "../components/FooterHelp";
import "../components/custom.css";

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
  const [customBtnClicked, setCustomBtnClicked] = useState(false);
  const [customValue, setCustomValue] = useState(0);

  const [newSettings, updateSettings] = useState();
  const [emptyError, setEmptyError] = useState(false);
  const shopPlan =
    shopSettings.shopInformation &&
    shopSettings.shopInformation.subscription_plan > 0;
  const [headJS, setHeadJS] = useState(null);
  useEffect(() => {
    setHeadJS(
      <Head>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTIC_KEY}`}
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments)}
          gtag('js', new Date());

          gtag('config', "${ANALYTIC_KEY}", {'page_title': 'Settings', 'page_path': '/'});
        `,
          }}
        />
      </Head>
    );
  }, []);

  const handleUpdateSettings = async () => {
    if (
      !(
        parseInt(newSettings.defaultTipping1) > 0 &&
        parseInt(newSettings.defaultTipping2) > 0 &&
        parseInt(newSettings.defaultTipping3) > 0
      )
    ) {
      setEmptyError(true);
    } else {
      setUpdateMetafieldIsLoading(true);
      setEmptyError(false);

      const updateMetafield = await fetch("/updateSettingsMetafield", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metafieldValue: JSON.stringify(newSettings),
          metafieldId: shopSettings.shopInformation.metafield_id,
        }),
      });
      const updateMetafieldJson = await updateMetafield.json();

      // Refetch data to make sure everything is up to date
      setUpdateMetafieldIsLoading(false);
      refetch();
    }
  };

  const handleInstallInitialSettings = async () => {
    setInstallInitialSettingsLoading(true);

    const createMetafield = await fetch("/createSettingsMetafield", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metafieldValue: JSON.stringify(initialSettings),
      }),
    });
    const createMetafieldJson = await createMetafield.json();

    // Refetch data to make sure everything is up to date
    setInstallInitialSettingsLoading(false);
    refetch();
  };

  const handleKeyPress = (event) => {
    return event.charCode >= 48 && event.charCode <= 57;
  };
  const handleCustomChange = (event) => {
    const targetValue = event.target.value;
    if (event.target.value < 1000) {
      setCustomValue(targetValue);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const originalSettings = data.shop.metafields.edges[0]
    ? JSON.parse(data.shop.metafields.edges[0].node.value)
    : null;
  const settings = newSettings ? newSettings : originalSettings;

  const tjModalContentStyle = {
    backgroundColor: settings.tipModalBgColor,
    color: settings.tipModalTextColor,
  };
  const tjModalTitleStyle = {
    color: settings.tipModalTextColor,
  };
  const tjModalDescriptionStyle = {
    color: settings.tipModalTextColor,
  };
  const tjModalSuccessContentStyle = {
    backgroundColor: settings.tipModalBgColor,
  };
  let tipQuikBtnCustomStyle = {
    display: customBtnClicked ? "none" : "block",
    color: settings.tipModalTextColor,
  };
  let tipQuikCustomInputWrapperStyle = {
    display: customBtnClicked ? "flex" : "none",
    color: settings.tipModalTextColor,
  };

  // const handleCustom = () => {
  //   setCustomBtnClicked(true);
  // };

  return (
    <Fragment>
      {headJS}
      <TopBannerInformation settings={shopSettings.shopInformation} />
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
            {/* <TopBannerInformation settings={settings} /> */}
            <EnableTipQuikApp
              settings={settings}
              updateSettings={updateSettings}
            />

            <DefaultTippingPercentage
              settings={settings}
              updateSettings={updateSettings}
              emptyError={emptyError}
              updateError={setEmptyError}
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

            <TipModalTitle
              settings={settings}
              updateSettings={updateSettings}
            />

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

            <Layout.AnnotatedSection title="Tip Modal Preview">
              <Card sectioned>
                <FormLayout>
                  <div id="tipQuikModal" className="tj-modal">
                    <div className="tj-modal-background">
                      <div className="tj-modal-background-inner"></div>
                    </div>
                    <div
                      className="tj-modal-content-wrapper"
                      style={tjModalDescriptionStyle}
                    >
                      <div
                        className="tj-modal-content"
                        style={tjModalContentStyle}
                      >
                        <div className="tj-modal-header">
                          <div className="tj-modal-header-inner">
                            <h3
                              className="tj-modal-title"
                              style={tjModalTitleStyle}
                            >
                              {settings.tipModalTitle}
                            </h3>
                            <p
                              className="tj-modal-description"
                              style={tjModalDescriptionStyle}
                            >
                              {settings.tipModalDescription}
                            </p>
                          </div>
                        </div>
                        <div
                          className="tj-modal-btns-container"
                          style={tjModalDescriptionStyle}
                        >
                          {settings.defaultTipping1 && (
                            <span className="tj-modal-btn-wrapper">
                              <button
                                id="tipQuikBtn1"
                                type="button"
                                className="tj-modal-btn"
                                style={tjModalDescriptionStyle}
                              >
                                <span className="tj-modal-btn-percentage">
                                  {settings.defaultTipping1}%
                                </span>
                                <span
                                  id="tipQuikAmt1"
                                  className="tj-modal-btn-amount"
                                >
                                  ${settings.defaultTipping1}
                                </span>
                              </button>
                            </span>
                          )}
                          {settings.defaultTipping2 && (
                            <span className="tj-modal-btn-wrapper">
                              <button
                                id="tipQuikBtn2"
                                type="button"
                                className="tj-modal-btn"
                                style={tjModalDescriptionStyle}
                              >
                                <span className="tj-modal-btn-percentage">
                                  {settings.defaultTipping2}%
                                </span>
                                <span
                                  id="tipQuikAmt2"
                                  className="tj-modal-btn-amount"
                                >
                                  ${settings.defaultTipping2}
                                </span>
                              </button>
                            </span>
                          )}
                          {settings.defaultTipping3 && (
                            <span className="tj-modal-btn-wrapper">
                              <button
                                id="tipQuikBtn3"
                                type="button"
                                className="tj-modal-btn"
                                style={tjModalDescriptionStyle}
                              >
                                <span className="tj-modal-btn-percentage">
                                  {settings.defaultTipping3}%
                                </span>
                                <span
                                  id="tipQuikAmt3"
                                  className="tj-modal-btn-amount"
                                >
                                  ${settings.defaultTipping3}
                                </span>
                              </button>
                            </span>
                          )}
                        </div>

                        {settings.enableCustomTipOption && (
                          <span className="tj-modal-btn-wrapper">
                            <button
                              id="tipQuikBtnCustom"
                              type="button"
                              className="tj-modal-btn"
                              // onClick={handleCustom}
                              style={tipQuikBtnCustomStyle}
                            >
                              <span className="tj-modal-btn-percentage">
                                Custom amount
                              </span>
                            </button>

                            <span
                              id="tipQuikCustomInputWrapper"
                              className="tj-modal-input-wrapper"
                              style={tipQuikCustomInputWrapperStyle}
                            >
                              <input
                                id="tipQuikCustomInput"
                                className="tj-modal-custom-input"
                                type="number"
                                value={customValue}
                                min="0"
                                max="1000"
                                onChange={handleCustomChange}
                                onKeyPress={handleKeyPress}
                                style={tjModalDescriptionStyle}
                              />
                              <button
                                id="tipQuikCustomInputAdd"
                                className="tj-modal-btn tj-modal-btn-percentage tj-modal-input-add"
                                type="button"
                                data-tipquik-add="0"
                                style={tjModalDescriptionStyle}
                              >
                                Add
                              </button>
                            </span>
                          </span>
                        )}

                        <span className="tj-modal-btn-none">
                          <button
                            type="button"
                            className="tj-modal-btn"
                            data-tipquik-add="0"
                            style={tipQuikBtnCustomStyle}
                          >
                            <span className="tj-modal-btn-percentage">
                              No tip
                            </span>
                          </button>
                        </span>

                        {settings.enablePoweredTipQuik && (
                          <span className="tj-modal-powered">
                            Powered by TipQuik
                          </span>
                        )}

                        <div
                          id="tipQuikSuccess"
                          className="tj-modal-success-content"
                          style={tjModalSuccessContentStyle}
                        >
                          <div>
                            <div className="tj-modal-loading-icon-container">
                              <svg
                                className="tj-modal-loading-icon"
                                viewBox="0 0 44 44"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M15.542 1.487A21.507 21.507 0 00.5 22c0 11.874 9.626 21.5 21.5 21.5 9.847 0 18.364-6.675 20.809-16.072a1.5 1.5 0 00-2.904-.756C37.803 34.755 30.473 40.5 22 40.5 11.783 40.5 3.5 32.217 3.5 22c0-8.137 5.3-15.247 12.942-17.65a1.5 1.5 0 10-.9-2.863z"></path>
                              </svg>
                            </div>
                            <p className="tj-modal-success-title">Thank you</p>
                            <p className="tj-modal-success-message">
                              You are now being directed to the checkout page.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </FormLayout>
              </Card>
            </Layout.AnnotatedSection>
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
      <FooterHelpDiv />
    </Fragment>
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

export default Index;
