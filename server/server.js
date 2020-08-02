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
        console.log("accessToken: ", accessToken);
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
              // const insertSettings =
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
    console.log("ctx.request.body", ctx.request.body);

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
    console.log("Shopify getThemes response:", JSON.stringify(getThemesJson));

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
    console.log(
      "Shopify createSnippet response:",
      JSON.stringify(createSnippetJson)
    );

    ctx.body = getThemesJson;
  });

  // Create the product
  router.post("/createProduct", async (ctx) => {
    console.log("ctx.request.body", ctx.request.body);
    // Return message if no product value provided
    if (!ctx.request.body.product) {
      ctx.body = "No product value provided.";
    }

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
    console.log(
      "Shopify createProduct response:",
      JSON.stringify(createProductJson)
    );

    ctx.body = createProductJson;
  });

  router.post("/requestHelp", async (ctx) => {
    // Send help request mail to support email (support@aesymmetric.xyz)
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
