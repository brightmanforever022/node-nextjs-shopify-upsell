import { useState } from "react";
import { Page, Layout, Card, TextStyle } from "@shopify/polaris";

const Plan = (shopSettings) => {
  const shopPlan = shopSettings.shopInformation
    ? shopSettings.shopInformation.subscription_plan
    : 0;
  const [currentPlan, setCurrentPlan] = useState(shopPlan);
  const planList = ["Free", "Standard", "Premium"];
  let currentPlanString;
  currentPlanString =
    "Plan List (Your current plan is " + planList[currentPlan] + ")";

  const joinStandard = async () => {
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
  };

  const joinPremium = async () => {
    console.log("arrive premium");
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
    console.log("arrive downGrade");
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

  return (
    <Page title="Subscription Plans">
      <Layout>
        <Layout.Section>
          <Card title={currentPlanString}>
            <Card.Section title="Free">
              <p>You have some limitations.</p>
            </Card.Section>

            <Card.Section
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
            </Card.Section>
            <Card.Section
              title="Premium"
              actions={[
                {
                  content: currentPlan == 2 ? "Unsubscribe" : "Subscribe",
                  onAction: currentPlan == 2 ? downGrade : joinPremium,
                  disabled: currentPlan == 1,
                },
              ]}
            >
              <p>You would be benefited.</p>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
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
