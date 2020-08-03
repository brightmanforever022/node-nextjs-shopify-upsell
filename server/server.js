import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import cors from "koa2-cors";
import bodyParser from "koa-bodyparser";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
const Ctrl = require("./controllers");
import * as handlers from "./handlers/index";
import * as helpers from "./helper";

const { Client } = require("pg");

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
} = process.env;
app.prepare().then(async () => {
  const server = new Koa();
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
      },
      server
    )
  );
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      accessMode: "offline",
      scopes: [SCOPES],

      async afterAuth(ctx) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
        });

        // get shop data from db
        client
          .query("SELECT * FROM shops WHERE shop_domain='" + shop + "';")
          .then(async (res) => {
            if (res.rows.length > 0) {
              let shopData = res.rows[0];
              shopData.access_token = accessToken;
              await client.query(
                "UPDATE shops SET access_token='" +
                  accessToken +
                  "' WHERE shop_domain='" +
                  shop +
                  "';"
              );
              console.log("updated token");
            } else {
              throw new Error("There are no shop data.");
            }
          })
          .catch(async (err) => {
            const ds = new Date();
            const text =
              "INSERT INTO shops(shop_domain, access_token, store_owner_email, subscription_status, snippet_installation_status, product_installation_status, " +
              "installation_help_status, created_at, updated_at) " +
              "VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *";
            const values = [
              shop,
              accessToken,
              "asdf@asdf.com",
              false,
              false,
              false,
              false,
              "2020-07-30 00:43:30",
              "2020-07-30 00:43:30",
            ];

            try {
              const insertShop = await client.query(text, values);
              console.log(insertShop.rows[0]);
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

              // register webhooks
            } catch (insertErr) {
              console.log(insertErr);
            }
          });

        ctx.redirect("/");
      },
    })
  );
  server.use(
    graphQLProxy({
      version: ApiVersion.April20,
    })
  );

  server.use(bodyParser());

  // Get the setting of store
  router.post("/getShopSettings", async (ctx) => {
    ctx.res.setHeader("Content-Type", "application/json;charset=utf-8");
    return Ctrl.getShopSettings(client, ctx);
  });

  // Create/update the shop metafield
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

  router.get("*", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
