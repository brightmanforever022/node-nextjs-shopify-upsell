import { useState, useEffect } from "react";
import Head from "next/head";
import { Page, Layout, Card, Link } from "@shopify/polaris";
import FooterHelpDiv from "../components/FooterHelp";
import $ from "jquery";
import "../components/custom.css";

const Plan = (shopSettings) => {
  const shopPlan = shopSettings.shopInformation
    ? shopSettings.shopInformation.subscription_plan
    : 0;
  const [currentPlan, setCurrentPlan] = useState(shopPlan);
  const planList = ["Free", "Standard", "Premium"];
  let currentPlanString;
  currentPlanString =
    "Plan List (Your current plan is " + planList[currentPlan] + ")";
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

          gtag('config', "${ANALYTIC_KEY}", {'page_title': 'Account', 'page_path': '/plan'});
        `,
          }}
        />
      </Head>
    );
  }, []);

  /*const joinStandard = async () => {
    console.log("arrive standard");
    const joinStandardRes = await fetch("/joinStandard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shop_owner: shopSettings.shopInformation.store_owner_email,
        shop_domain: shopSettings.shopInformation.shop_domain,
      }),
    });

    const joinStandardJson = await joinStandardRes.json();
    console.log("joinStandardJson: ", joinStandardJson);
    setCurrentPlan(1);
    window.top.location.replace(joinStandardJson.storeData.confirmationUrl);
  };*/

  const joinPremium = async () => {
    const joinPremiumRes = await fetch("/joinPremium", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shop_owner: shopSettings.shopInformation.store_owner_email,
        shop_domain: shopSettings.shopInformation.shop_domain,
      }),
    });

    const joinPremiumJson = await joinPremiumRes.json();
    setCurrentPlan(2);
    window.top.location.replace(joinPremiumJson.storeData.confirmationUrl);
  };

  const downGrade = async () => {
    const downGradeRes = await fetch("/downGrade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chargeId: shopSettings.shopInformation.charge_id,
      }),
    });

    const downGradeJson = await downGradeRes.json();
    setCurrentPlan(0);
  };

  const triggerIntercom = () => {
    $(".intercom-launcher").trigger("click");

    const frame = $("#intercom-container iframe");
    $(".intercom-launcher", frame.contents()).trigger("click");
  };

  return (
    <div>
      {/* {headJS} */}
      <Page title="Your Subscription Plan">
        <Layout>
          <Layout.Section>
            <Card title={currentPlanString}>
              <Card.Section title="Free">
                <p>
                  Collect tips from your customers before checkout. Completely
                  free to use!
                </p>
              </Card.Section>

              {/* <Card.Section
                title="Standard"
                actions={[
                  {
                    content: currentPlan == 1 ? "Unsubscribe" : "Subscribe",
                    onAction: currentPlan == 1 ? downGrade : joinStandard,
                    disabled: currentPlan == 2,
                  },
                ]}
              >
                <p>You have no limitations.</p>
              </Card.Section> */}
              <Card.Section
                title="Premium ($9.99/month)"
                actions={[
                  {
                    content: currentPlan == 2 ? "Unsubscribe" : "Subscribe",
                    onAction: currentPlan == 2 ? downGrade : joinPremium,
                    disabled: currentPlan == 1,
                  },
                ]}
              >
                <div>
                  <p>Includes more ways to customize the tip modal:</p>
                  <ul>
                    <li>Show a custom tip amount option</li>
                    <li>Hide the 'Powered by TipQuik' text</li>
                    <li>Customized tip modal design implementation help</li>
                    <li>Access to more premium options as they are released</li>
                  </ul>
                </div>
              </Card.Section>
            </Card>
            <Card sectioned title="Need help? Questions? Comments?">
              <p>
                Don't hesitate to get in touch with us! We will be happy to
                assist you with anything TipQuik related. Get in touch with us
                via
                <span
                  className="install-email live-chat"
                  onClick={triggerIntercom}
                >
                  live chat
                </span>
                or send an email to
                <span className="install-email">
                  <Link external url="mailto:support@aesymmetric.xyz">
                    support@aesymmetric.xyz
                  </Link>
                </span>
                . We’ll get back to you quickly!
              </p>
            </Card>
            <FooterHelpDiv />
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
};

Plan.getInitialProps = async (ctx) => {
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

export default Plan;
