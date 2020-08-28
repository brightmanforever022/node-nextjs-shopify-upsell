import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import { receiveWebhook } from "@shopify/koa-shopify-webhooks";
import Koa from "koa";
import cors from "koa2-cors";
import bodyParser from "koa-bodyparser";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
const Ctrl = require("./controllers");
import * as handlers from "./handlers/index";
import helper, * as helpers from "./helper";
const getSubscriptionUrl = require("./lib/getSubscriptionUrl");
const cancelSubscription = require("./lib/cancelSubscription");

const { Client } = require("pg");
const url = require("url");
const koaConnect = require("koa-connect");
const compression = require("compression");

const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
const {
  SHOPIFY_API_SECRET,
  SHOPIFY_API_KEY,
  SCOPES,
  DATABASE_URL,
  KLAVIYO_API_KEY,
  KLAVIYO_LIST,
  APP_NAME,
} = process.env;

app.prepare().then(async () => {
  const server = new Koa();
  server.use(koaConnect(compression()));
  server.use(cors());
  server.proxy = true;

  const router = new Router();
  const client = new Client({
    connectionString: DATABASE_URL,
  });
  await helpers.connectRetry(3, client);

  server.use(
    session(
      {
        sameSite: "none",
        secure: true,
        httpOnly: false,
      },
      server
    )
  );

  server.keys = [SHOPIFY_API_SECRET];

  // server.use(async (ctx) => {

  //   if (typeof ctx.cookies.get('shopOrigin') === "undefined" && typeof ctx.session.shop !== "undefined") {
  //     console.log('arrive empty shoporigin')
  //     ctx.cookies.set('shopOrigin', ctx.session.shop, { httpOnly: false, sameSite: 'none', secure: true });
  //     ctx.redirect(ctx.req.url);
  //     return
  //   }

  //   await handle(ctx.req, ctx.res);
  //   ctx.respond = false;
  //   ctx.res.statusCode = 200;
  //   console.log(`server responding: ${ctx.req.url}`);
  //   return
  // });

  server.use(async (ctx, next) => {
    if (ctx.request.header.cookie) {
      if (
        (ctx.request.url.split("?")[0] === "/" &&
          ctx.request.querystring.split("&") &&
          ctx.request.querystring.split("&")[0].split("=")[0] === "hmac" &&
          ctx.request.querystring.split("&")[1].split("=")[0] !== "locale") ||
        (ctx.request.url.split("?")[0] === "/auth/callback" &&
          ctx.request.querystring.split("&") &&
          ctx.request.querystring.split("&")[1].split("=")[0] === "hmac")
      ) {
        ctx.request.header.cookie = ctx.request.header.cookie
          .split(" ")
          .filter(
            (item) =>
              ["koa:sess", "koa:sess.sig"].indexOf(item.split("=")[0]) === -1
          )
          .join(" ");
      }
    }
    await next();
  });

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],
      accessMode: "offline",

      async afterAuth(ctx) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const { shop: shopOrigin, accessToken } = ctx.session;
        ctx.cookies.set("shopOrigin", shopOrigin, {
          httpOnly: false,
          // secure: true,
          // sameSite: "none",
        });
        const shopDetail = await Ctrl.fetchShopDetails(ctx);

        // get shop data from db
        client
          .query("SELECT * FROM shops WHERE shop_domain=$1", [shopOrigin])
          .then(async (res) => {
            if (res.rows.length > 0) {
              await client.query(
                "UPDATE shops SET access_token=$1, updated_at=$2, app_uninstalled_at=$3 WHERE shop_domain=$4",
                [accessToken, helpers.getCurrentDate(), null, shopOrigin]
              );
              // register webhook
              const uninstallWebhook = await handlers.registerWebhooks(
                shopOrigin,
                accessToken,
                "APP_UNINSTALLED",
                "webhooks/uninstall",
                ApiVersion.April20
              );
              const subscriptionWebhook = await handlers.registerWebhooks(
                shopOrigin,
                accessToken,
                "APP_SUBSCRIPTIONS_UPDATE",
                "webhooks/subscriptionUpdate",
                ApiVersion.April20
              );

              // Klaviyo Subscribe
              await Ctrl.klaviyoSubscribe(
                KLAVIYO_API_KEY,
                KLAVIYO_LIST,
                shopDetail,
                ctx
              );
            } else {
              throw new Error("There are no shop data.");
            }
          })
          .catch(async (err) => {
            const ds = new Date();
            const text =
              "INSERT INTO shops(shop_domain, access_token, store_owner_email, store_owner_full_name, subscription_status, " +
              "snippet_installation_status, product_installation_status, installation_help_status, created_at, updated_at) " +
              "VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *";
            const values = [
              shopOrigin,
              accessToken,
              shopDetail.email,
              shopDetail.shop_owner,
              false,
              false,
              false,
              false,
              helpers.getCurrentDate(),
              helpers.getCurrentDate(),
            ];

            try {
              const insertShop = await client.query(text, values);
              console.log("inserted shop data");
              const insertSettings = await client.query(
                "INSERT INTO settings(shop_id, tip_percent1, tip_percent2, tip_percent3, enable_tip_quik, enable_custom_tip_option" +
                  ", tip_modal_title, tip_modal_description, tip_modal_text_color, tip_modal_bg_color, enable_powered_tip_quik)" +
                  " VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
                [
                  insertShop.rows[0].id,
                  15,
                  20,
                  25,
                  true,
                  false,
                  "Leave a tip",
                  "Lorem ipsum",
                  "#000000",
                  "#ffffff",
                  true,
                ]
              );
              console.log("inserted shop settings");

              // register webhooks
              const uninstallWebhook = await handlers.registerWebhooks(
                shopOrigin,
                accessToken,
                "APP_UNINSTALLED",
                "webhooks/uninstall",
                ApiVersion.April20
              );
              const subscriptionWebhook = await handlers.registerWebhooks(
                shopOrigin,
                accessToken,
                "APP_SUBSCRIPTIONS_UPDATE",
                "webhooks/subscriptionUpdate",
                ApiVersion.April20
              );

              // Subscribe into Klaviyo
              await Ctrl.klaviyoSubscribe(
                KLAVIYO_API_KEY,
                KLAVIYO_LIST,
                shopDetail,
                ctx
              );
            } catch (insertErr) {
              console.log(insertErr);
            }
          });

        ctx.redirect("/");
      },
    })
  );

  server.use(async (ctx, next) => {
    const { shop: shopOrigin } = ctx.session;

    const queryData = url.parse(ctx.request.url, true);
    if (
      shopOrigin &&
      queryData.query.shop &&
      shopOrigin !== queryData.query.shop
    ) {
      console.debug("🎤 Dropping invalid session");
      ctx.session.shopOrigin = null;
      ctx.session.accessToken = null;
      ctx.redirect("/auth");
    }
    await next();
  });

  server.use(
    graphQLProxy({
      version: ApiVersion.April20,
    })
  );

  server.use(bodyParser());

  // Get the setting of store
  router.post("/getShopSettings", async (ctx) => {
    console.log("arrive getshopsettings");
    ctx.res.setHeader("Content-Type", "application/json;charset=utf-8");
    return Ctrl.getShopSettings(client, ctx);
  });

  // Create the shop initial metafield
  router.post("/createSettingsMetafield", async (ctx) => {
    // Return message if no metafield value provided
    if (!ctx.request.body.metafieldValue) {
      ctx.body = "No metafield value provided.";
    }

    return Ctrl.createSettingsMetafield(client, ctx);
  });
  // Update the shop metafield
  router.post("/updateSettingsMetafield", async (ctx) => {
    // Return message if no metafield value provided
    if (!ctx.request.body.metafieldValue) {
      ctx.body = "No metafield value provided.";
    }

    return Ctrl.updateSettingsMetafield(client, ctx);
  });

  // Create/update the theme snippet
  router.post("/createSnippet", async (ctx) => {
    return Ctrl.createSnippet(client, ctx);
  });

  // Create the product
  router.post("/createProduct", async (ctx) => {
    // Return message if no product value provided
    if (!ctx.request.body.product) {
      ctx.body = "No product value provided.";
    }
    return Ctrl.createProduct(client, ctx);
  });

  // Send help request mail to support email (support@aesymmetric.xyz)
  router.post("/requestHelp", async (ctx) => {
    return Ctrl.requestHelp(client, ctx);
  });

  router.post("/joinStandard", async (ctx) => {
    await getSubscriptionUrl(
      ctx,
      ctx.session.accessToken,
      ctx.session.shop,
      "Standard",
      4.99
    );
    await Ctrl.updateShopWithSubscription(client, ctx);
    ctx.body = { storeData: ctx.body.subData };
  });

  router.post("/joinPremium", async (ctx) => {
    await getSubscriptionUrl(
      ctx,
      ctx.session.accessToken,
      ctx.session.shop,
      "Premium",
      9.99
    );
    await Ctrl.updateShopWithSubscription(client, ctx);
    ctx.body = { storeData: ctx.body.subData };
  });

  router.post("/downGrade", async (ctx) => {
    await cancelSubscription(
      ctx,
      ctx.session.accessToken,
      ctx.session.shop,
      ctx.request.body.chargeId
    );
    ctx.body = { storeData: ctx.body.subData };
  });

  router.post("/customerrequest", async (ctx) => {
    ctx.status = 200;
    if (ctx.request && ctx.request.body) {
      const shopInfo = await Ctrl.getShopDataByDomain(client, ctx);
      return Ctrl.gdprWebhook(
        shopInfo,
        APP_NAME,
        "customers/data_request",
        ctx
      );
    } else {
      console.log("attack");
    }
  });
  router.post("/customererase", async (ctx) => {
    ctx.status = 200;
    if (ctx.request && ctx.request.body) {
      const shopInfo = await Ctrl.getShopDataByDomain(client, ctx);
      return Ctrl.gdprWebhook(shopInfo, APP_NAME, "customers/redact", ctx);
    } else {
      console.log("attack");
    }
  });
  router.post("/shoperase", async (ctx) => {
    ctx.status = 200;
    if (ctx.request && ctx.request.body) {
      const shopInfo = await Ctrl.getShopDataByDomain(client, ctx);
      return Ctrl.gdprWebhook(shopInfo, APP_NAME, "shop/redact", ctx);
    } else {
      console.log("attack");
    }
  });

  router.get("*", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(router.allowedMethods());
  server.use(router.routes());

  // webhook for uninstallation
  server.use(
    receiveWebhook({
      path: "/webhooks/uninstall",
      secret: SHOPIFY_API_SECRET,
      async onReceived(ctx) {
        console.log("received webhook related with uninstallation of app");
        return Ctrl.uninstallShop(client, ctx);
      },
    })
  );
  server.use(
    receiveWebhook({
      path: "/webhooks/subscriptionUpdate",
      secret: SHOPIFY_API_SECRET,
      async onReceived(ctx) {
        console.log(
          "received webhook related with subscriptionUpdate of app",
          ctx.state.webhook
        );
        return Ctrl.updateSubscription(client, ctx);
      },
    })
  );

  // server.use(
  //   receiveWebhook({
  //     path: "/customers/redact",
  //     secret: SHOPIFY_API_SECRET,
  //     async onReceived(ctx) {
  //       console.log("/customers/redact");
  //       return Ctrl.gdprWebhook(shopInfo, ctx);
  //     },
  //   })
  // );

  // server.use(
  //   receiveWebhook({
  //     path: "/shop/redact",
  //     secret: SHOPIFY_API_SECRET,
  //     async onReceived(ctx) {
  //       console.log("/shop/redact");
  //       return Ctrl.gdprWebhook(shopInfo, ctx);
  //     },
  //   })
  // );

  // server.use(
  //   receiveWebhook({
  //     path: "/customers/data_request",
  //     secret: SHOPIFY_API_SECRET,
  //     async onReceived(ctx) {
  //       console.log("/customers/data_request");
  //       return Ctrl.gdprWebhook(shopInfo, ctx);
  //     },
  //   })
  // );

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
