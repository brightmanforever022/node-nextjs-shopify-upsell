const getSubscriptionUrl = async (ctx, accessToken, shop, planName, price) => {
  const query = JSON.stringify({
    query: `mutation {
      appSubscriptionCreate(
          name: "${planName}"
          returnUrl: "${process.env.HOST}"
          test: true
          lineItems: [
          {
            plan: {
              appUsagePricingDetails: {
                  cappedAmount: { amount: ${price}, currencyCode: USD }
                  terms: "$1 for 1000 emails"
              }
            }
          }
          {
            plan: {
              appRecurringPricingDetails: {
                  price: { amount: ${price}, currencyCode: USD }
              }
            }
          }
          ]
        ) {
            userErrors {
              field
              message
            }
            confirmationUrl
            appSubscription {
              id
            }
        }
    }`,
  });

  const response = await fetch(
    `https://${shop}/admin/api/2020-04/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: query,
    }
  );

  const responseJson = await response.json();
  ctx.body = { subData: responseJson.data.appSubscriptionCreate };
  console.log(responseJson.data);
};

module.exports = getSubscriptionUrl;
