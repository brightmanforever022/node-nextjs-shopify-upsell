import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import App, { Container } from "next/app";
import { AppProvider } from "@shopify/polaris";
import { Provider } from "@shopify/app-bridge-react";
import Cookies from "js-cookie";
import "@shopify/polaris/styles.css";
import translations from "@shopify/polaris/locales/en.json";

const client = new ApolloClient({
  fetchOptions: {
    credentials: "include",
  },
});

class MyApp extends App {
  constructor(props) {
    super(props);
    let shopDomain = props.pageProps.shopInformation
      ? props.pageProps.shopInformation.shop_domain
      : "";
    this.state = {
      shopOrigin: shopDomain,
    };
  }

  render(ctx) {
    const { Component, pageProps } = this.props;
    const config = {
      apiKey: API_KEY,
      shopOrigin: this.state.shopOrigin,
      forceRedirect: true,
    };

    return (
      <AppProvider i18n={translations}>
        <Provider config={config}>
          <ApolloProvider client={client}>
            <Component {...pageProps} />
          </ApolloProvider>
        </Provider>
      </AppProvider>
    );
  }
}

export default MyApp;
