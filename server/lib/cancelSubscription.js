const cancelSubscription = async (ctx, accessToken, shop, charge_id) => {
  const response = await fetch(
    `https://${shop}/admin/api/2020-04/recurring_application_charges/${charge_id}.json`,
    {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    }
  );

  ctx.body = { subData: { deleted: true } };
};

module.exports = cancelSubscription;
