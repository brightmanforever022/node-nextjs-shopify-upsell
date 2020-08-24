import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import App from "next/app";
import Router from "next/router";
import withGA from "next-ga";
import { hotjar } from "react-hotjar";
import Intercom from "react-intercom";
import { AppProvider } from "@shopify/polaris";
import { Provider } from "@shopify/app-bridge-react";
// import Cookies from "js-cookie";
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

  componentDidMount() {
    hotjar.initialize(HJID, HJSV);
  }

  render(ctx) {
    const { Component, pageProps } = this.props;
    const config = {
      apiKey: API_KEY,
      shopOrigin: this.state.shopOrigin,
      forceRedirect: true,
    };

    // const intercomUser = {
    //   user_id: INTERCOM_USER_ID,
    //   email: INTERCOM_EMAIL,
    //   name: INTERCOM_APP_NAME,
    // };

    return (
      <AppProvider i18n={translations}>
        <Provider config={config}>
          <ApolloProvider client={client}>
            <Component {...pageProps} />
            {/* <Intercom appID={INTERCOM_APP_ID} { ...intercomUser } /> */}
          </ApolloProvider>
        </Provider>
      </AppProvider>
    );
  }
}

export default withGA(ANALYTIC_KEY, Router)(MyApp);
