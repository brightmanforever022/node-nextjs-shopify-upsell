const { parsed: localEnv } = require("dotenv").config();
const withCSS = require("@zeit/next-css");

const webpack = require("webpack");
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
const analyticKey = JSON.stringify(process.env.GOOGLE_ANALYTICS_TRACKING_ID);
const hotjarId = JSON.stringify(process.env.HJID);
const hotjarSnippetVersion = JSON.stringify(process.env.HJSV);

module.exports = withCSS({
  webpack: (config) => {
    const env = {
      API_KEY: apiKey,
      ANALYTIC_KEY: analyticKey,
      HJID: hotjarId,
      HJSV: hotjarSnippetVersion,
    };
    config.plugins.push(new webpack.DefinePlugin(env));
    return config;
  },
});
