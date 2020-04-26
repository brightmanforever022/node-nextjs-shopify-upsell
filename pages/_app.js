import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import App, { Container } from 'next/app';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import Cookies from 'js-cookie';
import '@shopify/polaris/styles.css';
import translations from '@shopify/polaris/locales/en.json';

const client = new ApolloClient({
  fetchOptions: {
    credentials: 'include'
  }
});

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    // const shopOrigin = Cookies.get('shopOrigin');
    const config = { apiKey: API_KEY, shopOrigin: Cookies.get("shopOrigin"), forceRedirect: true };

    return (
      <Container>
        <AppProvider i18n={translations}>
          <Provider
            config={config}
          >
            <ApolloProvider client={client}>
              <Component {...pageProps} />
            </ApolloProvider>
          </Provider>
        </AppProvider>
      </Container>
    );
  }
}

export default MyApp;
