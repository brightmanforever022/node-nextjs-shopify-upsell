const { parsed: localEnv } = require("dotenv").config();
const withCSS = require("@zeit/next-css");

const webpack = require("webpack");
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
const analyticKey = JSON.stringify(process.env.GOOGLE_ANALYTICS_TRACKING_ID);

module.exports = withCSS({
  webpack: (config) => {
    const env = { API_KEY: apiKey, ANALYTIC_KEY: analyticKey };
    config.plugins.push(new webpack.DefinePlugin(env));
    return config;
  },
});
