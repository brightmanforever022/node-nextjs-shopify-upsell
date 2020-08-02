import dotenv from "dotenv";
import "isomorphic-fetch";

dotenv.config();

async function getShopSettings(client, ctx) {
  const shopInfo = await client.query(
    "SELECT * FROM shops WHERE shop_domain=$1",
    [ctx.request.body.shop_domain]
  );

  if (shopInfo.rows.length == 1) {
    console.log("successfully got the shop data");
    ctx.status = 200;
    ctx.res.end(
      JSON.stringify({
        shopInformation: shopInfo.rows[0],
      })
    );
  } else {
    ctx.status = 400;
    ctx.res.end(
      JSON.stringify({
        error: `couldn't fetch shop details for ${ctx.request.body.shop_domain}`,
      })
    );
  }

  return;
}

async function requestHelp(client, ctx) {
  const helpRequest = ctx.request.body.storedata;
  try {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.send({
      to: process.env.SUPPORT_EMAIL,
      from: process.env.SUPPORT_EMAIL,
      subject:
        "TipQuik - installation help request - " + helpRequest.shop_domain,
      text:
        "TipQuik app installation help has been requested.\n Store URL: " +
        helpRequest.shop_domain +
        "\n Store owner email: " +
        helpRequest.shop_owner,
      html:
        "<p>TipQuik app installation help has been requested.</p><p>Store URL: " +
        helpRequest.shop_domain +
        "</p><p> Store owner email: " +
        helpRequest.shop_owner +
        "</p>",
    });
  } catch (error) {
    console.log("sendgrid error: ", error);
  }

  // Change installation_help_status in shop table (psql)
  const updateShop = await client.query(
    "UPDATE shops SET installation_help_status=true WHERE shop_domain=$1 RETURNING *",
    [helpRequest.shop_domain]
  );
  ctx.body = { storedata: updateShop.rows[0] };
  // ctx.body = {storedata: {a: 'b'}};
}

async function updateSettingsMetafield(client, ctx) {
  const updateMetafield = await fetch(
    `https://${ctx.session.shop}/admin/api/2020-04/metafields.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ctx.session.accessToken,
      },
      body: JSON.stringify({
        metafield: {
          namespace: "tipquik",
          key: "settings",
          value: ctx.request.body.metafieldValue,
          value_type: "json_string",
        },
      }),
    }
  );

  const updateMetafieldJson = await updateMetafield.json();
  console.log(
    "Shopify updateMetafield response:",
    JSON.stringify(updateMetafieldJson)
  );

  ctx.body = updateMetafieldJson;
}

module.exports = {
  getShopSettings,
  requestHelp,
  updateSettingsMetafield,
};
