import dotenv from "dotenv";
import "isomorphic-fetch";
import { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import * as helpers from "./helper";
dotenv.config();

async function fetchShopDetails(ctx) {
  const shopOrigin = ctx.session.shop;
  const accessToken = ctx.session.accessToken;
  const apiVersion = "2020-04";
  // console.debug(`fetching shop info for: ${JSON.stringify(shopOrigin)}`)
  if (!shopOrigin || !accessToken) {
    console.log(
      `Can't fetch shop information because shopOrigin/accessToken params are missing/bad`
    );
    ctx.status = 401;
    return;
  }
  try {
    // console.debug(`>fetchShopDetails: Shop origin: ${shopOrigin}`)
    let response = await fetch(
      `https://${shopOrigin}/admin/api/${apiVersion}/shop.json`,
      {
        credentials: "include",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    let jsonData = await response.json();
    if (!jsonData) {
      // console.debug(`no data was received for: ${shopOrigin}`);
      ctx.status = 401;
      return;
    } else {
      // console.debug(`recieved the following shop information: ${JSON.stringify(jsonData)}`)
      ctx.status = 200;
      return jsonData.shop;
    }
  } catch (error) {
    ctx.status = 400;
    reportEvent(ctx.shop, "error", {
      value: "error when fetching for shop details",
    });
    console.debug(
      `error when fetching for shop: ${shopOrigin}. error information: ${error}`
    );
  }
}

async function getShopSettings(client, ctx) {
  const shopInfo = await client.query(
    "SELECT * FROM shops WHERE shop_domain=$1",
    [ctx.request.body.shop_domain]
  );

  if (shopInfo.rows.length == 1) {
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
  // Send help request mail to support email (support@aesymmetric.xyz)
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
        "<p>TipQuik app installation help has been requested.</p><p>Store URL: <a href='" +
        helpRequest.shop_domain +
        "'>" +
        helpRequest.shop_domain +
        "</a>" +
        "</a></p><p> Store owner email: " +
        helpRequest.shop_owner +
        "</p>",
    });
  } catch (error) {
    console.log("sendgrid error: ", error);
  }

  // Change installation_help_status in shop table (psql)
  const updateShop = await client.query(
    "UPDATE shops SET installation_help_status=true, updated_at=$1 WHERE shop_domain=$2 RETURNING *",
    [helpers.getCurrentDate(), helpRequest.shop_domain]
  );
  ctx.body = { storedata: updateShop.rows[0] };
}

async function createSettingsMetafield(client, ctx) {
  const createMetafield = await fetch(
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

  const createMetafieldJson = await createMetafield.json();

  // Update database
  const updateShops = await client.query(
    "UPDATE shops SET metafield_id=$1 WHERE shop_domain=$2",
    [createMetafieldJson.metafield.id, ctx.session.shop]
  );

  ctx.body = createMetafieldJson;
}

async function updateSettingsMetafield(client, ctx) {
  const updateMetafield = await fetch(
    `https://${ctx.session.shop}/admin/api/2020-04/metafields/${ctx.request.body.metafieldId}.json`,
    {
      method: "PUT",
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
  console.log("metafiled value:", updateMetafieldJson);
  const settingValues = JSON.parse(ctx.request.body.metafieldValue);

  // Update database
  const shopData = await client.query(
    "SELECT id FROM shops WHERE shop_domain=$1",
    [ctx.session.shop]
  );
  const shopId = shopData.rows[0].id;
  const updateSettings = await client.query(
    "UPDATE settings SET tip_percent1=$1, tip_percent2=$2, tip_percent3=$3, enable_tip_quik=$4, enable_custom_tip_option=$5" +
      ", tip_modal_title=$6, tip_modal_description=$7, tip_modal_text_color=$8, tip_modal_bg_color=$9, enable_powered_tip_quik=$10 WHERE shop_id=$11",
    [
      settingValues.defaultTipping1,
      settingValues.defaultTipping2,
      settingValues.defaultTipping3,
      settingValues.enableTipQuik,
      settingValues.enableCustomTipOption,
      settingValues.tipModalTitle,
      settingValues.tipModalDescription,
      settingValues.tipModalTextColor,
      settingValues.tipModalBgColor,
      settingValues.enablePoweredTipQuik,
      shopId,
    ]
  );

  ctx.body = updateMetafieldJson;
}

async function createSnippet(client, ctx) {
  // Get published theme
  const getThemes = await fetch(
    `https://${ctx.session.shop}/admin/api/2020-04/themes.json`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ctx.session.accessToken,
      },
    }
  );

  const getThemesJson = await getThemes.json();

  const publishedTheme = getThemesJson.themes.find(
    (theme) => theme.role == "main"
  );
  const publishedThemeId = publishedTheme.id;

  // Return message if no snippet value provided
  if (!ctx.request.body.asset) {
    ctx.body = "No asset value or themeId provided.";
  }

  const createSnippet = await fetch(
    `https://${ctx.session.shop}/admin/api/2020-04/themes/${publishedThemeId}/assets.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ctx.session.accessToken,
      },
      body: JSON.stringify({
        asset: ctx.request.body.asset,
      }),
    }
  );

  const createSnippetJson = await createSnippet.json();

  const snippetDbUpdate = await client.query(
    "UPDATE shops SET snippet_installation_status=$1, updated_at=$2 WHERE shop_domain=$3",
    [true, helpers.getCurrentDate(), ctx.session.shop]
  );

  ctx.body = getThemesJson;
}

async function createProduct(client, ctx) {
  const createProduct = await fetch(
    `https://${ctx.session.shop}/admin/api/2020-04/products.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ctx.session.accessToken,
      },
      body: JSON.stringify({
        product: ctx.request.body.product,
      }),
    }
  );

  const createProductJson = await createProduct.json();

  const productDbUpdate = await client.query(
    "UPDATE shops SET product_installation_status=$1, updated_at=$2 WHERE shop_domain=$3",
    [true, helpers.getCurrentDate(), ctx.session.shop]
  );

  ctx.body = createProductJson;
}

async function uninstallShop(client, ctx) {
  const updateShop = await client.query(
    "UPDATE shops SET app_uninstalled_at=$1 WHERE shop_domain=$2 RETURNING *",
    [helpers.getCurrentDate(), ctx.state.webhook.domain]
  );
  ctx.body = { storedata: updateShop.rows[0] };
}

async function updateShopWithSubscription(client, ctx) {
  const subscriptionData = ctx.body.subData;
  const updateShop = await client.query(
    "UPDATE shops SET payment_confirmation_url=$1, charge_id=$2, updated_at=$3 WHERE shop_domain=$4 RETURNING *",
    [
      subscriptionData.confirmationUrl,
      subscriptionData.appSubscription.id.split("/").slice(-1)[0],
      helpers.getCurrentDate(),
      ctx.session.shop,
    ]
  );
  ctx.body = { subData: subscriptionData };
}

async function updateSubscription(client, ctx) {
  const wh = ctx.state.webhook;
  const planList = ["Free", "Standard", "Premium"];
  if (wh.payload.app_subscription.status == "ACTIVE") {
    const updateShop = await client.query(
      "UPDATE shops SET subscription_plan=$1, subscription_updated_at=$2, last_billed_at=$3, updated_at=$4, subscription_status=$5 WHERE shop_domain=$6 RETURNING *",
      [
        planList.indexOf(wh.payload.app_subscription.name),
        helpers.getCurrentDate(),
        helpers.getCurrentDate(),
        helpers.getCurrentDate(),
        true,
        wh.domain,
      ]
    );
    ctx.body = { storedata: updateShop.rows[0] };
  } else if (wh.payload.app_subscription.status == "CANCELLED") {
    const updateShop = await client.query(
      "UPDATE shops SET subscription_plan=$1, subscription_updated_at=$2, updated_at=$3, subscription_status=$4 WHERE shop_domain=$5 RETURNING *",
      [0, helpers.getCurrentDate(), helpers.getCurrentDate(), false, wh.domain]
    );
    ctx.body = { storedata: updateShop.rows[0] };
  } else {
    ctx.body = { storedata: { active: false } };
  }
}

module.exports = {
  fetchShopDetails,
  getShopSettings,
  requestHelp,
  createSettingsMetafield,
  updateSettingsMetafield,
  createSnippet,
  createProduct,
  uninstallShop,
  updateShopWithSubscription,
  updateSubscription,
};
