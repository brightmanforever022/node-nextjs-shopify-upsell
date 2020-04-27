import '@babel/polyfill';
import dotenv from 'dotenv';
import 'isomorphic-fetch';
import createShopifyAuth, { verifyRequest } from '@shopify/koa-shopify-auth';
import graphQLProxy, { ApiVersion } from '@shopify/koa-shopify-graphql-proxy';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import next from 'next';
import Router from 'koa-router';
import session from 'koa-session';
import * as handlers from './handlers/index';
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES } = process.env;
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(
    session(
      {
        sameSite: 'none',
        secure: true
      },
      server
    )
  );
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],

      async afterAuth(ctx) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set('shopOrigin', shop, {
          httpOnly: false,
          secure: true,
          sameSite: 'none'
        });
        ctx.redirect('/');
      }
    })
  );
  server.use(
    graphQLProxy({
      version: ApiVersion.April20
    })
  );

  server.use(bodyParser());

  // Create/update the shop metafield
  router.post('/updateSettingsMetafield', async ctx => {
    console.log('ctx.request.body', ctx.request.body);
    // Return message if no metafield value provided
    if (!ctx.request.body.metafieldValue) {
      ctx.body = 'No metafield value provided.';
    };

    const updateMetafield = await fetch(`https://${ctx.session.shop}/admin/api/2020-04/metafields.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ctx.session.accessToken,
      },
      body: JSON.stringify({
        'metafield': {
          'namespace': 'tipjar',
          'key': 'settings',
          'value': ctx.request.body.metafieldValue,
          'value_type': 'string'
        }
      })
    });

    const updateMetafieldJson = await updateMetafield.json();
    console.log('Shopify updateMetafield response:', JSON.stringify(updateMetafieldJson));
    
    ctx.body = updateMetafieldJson;
  });

  router.get('*', verifyRequest(), async ctx => {
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
