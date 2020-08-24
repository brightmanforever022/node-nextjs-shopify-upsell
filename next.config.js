const { parsed: localEnv } = require("dotenv").config();
const withCSS = require("@zeit/next-css");

const webpack = require("webpack");

const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
const appUrl = JSON.stringify(process.env.APP_URL);
const analyticKey = JSON.stringify(process.env.GOOGLE_ANALYTICS_TRACKING_ID);
const hotjarId = JSON.stringify(process.env.HJID);
const hotjarSnippetVersion = JSON.stringify(process.env.HJSV);

const intercomAppId = JSON.stringify(process.env.INTERCOM_APP_ID);
const intercomUserId = JSON.stringify(process.env.INTERCOM_USER_ID);
const intercomEmail = JSON.stringify(process.env.INTERCOM_EMAIL);
const intercomAppName = JSON.stringify(process.env.INTERCOM_APP_NAME);

module.exports = withCSS({
  webpack: (config) => {
    const env = {
      API_KEY: apiKey,
      ANALYTIC_KEY: analyticKey,
      HJID: hotjarId,
      HJSV: hotjarSnippetVersion,
      INTERCOM_APP_ID: intercomAppId,
      INTERCOM_USER_ID: intercomUserId,
      INTERCOM_EMAIL: intercomEmail,
      INTERCOM_APP_NAME: intercomAppName,
      APP_URL: appUrl,
    };
    config.plugins.push(new webpack.DefinePlugin(env));
    config.plugins.push(
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
      })
    );
    return config;
  },
});
