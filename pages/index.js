import { Page, Layout } from '@shopify/polaris';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Cookies from 'js-cookie';
import DefaultTippingPercentage from '../components/DefaultTippingPercentage';
import EnableTipJarApp from '../components/EnableTipJarApp';
import EnableCustomTipOption from '../components/EnableCustomTipOption';
import TipModalTitle from '../components/TipModalTitle';
import TipModalDescription from '../components/TipModalDescription';

const SHOP_TIPJAR_METAFIELD_QUERY = gql`
  query {
    shop {
      metafields(first: 1, namespace: "tipjar") {
        edges {
          node {
            key
            value
          }
        }
      }
    }
  }
`;

const handleUpdateSettings = () => {
  // const updateMetafield = await fetch(`https://wishlist-marketing.myshopify.com/admin/api/2020-04/graphql.json`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'X-Shopify-Access-Token': Cookies.get('shopOrigin'),
  //   },
  //   body: createQuery
  // });
  // const createResponseJson = await createResponse.json();
  // console.log('createResponeJson:', JSON.stringify(createResponseJson));
}

const Index = () => {
  const { loading, error, data } = useQuery(SHOP_TIPJAR_METAFIELD_QUERY, {
    fetchPolicy: 'network-only'
  });
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Page
      title="Tip Settings"
      primaryAction={{
        content: 'Update settings',
        onAction: handleUpdateSettings,
      }}
    >
      {console.log('access token:', Cookies.get('accessToken'))}
      <Layout>
        <p>Data: { JSON.stringify(data) }</p>
        <DefaultTippingPercentage />

        <EnableTipJarApp />

        <EnableCustomTipOption />

        <TipModalTitle />

        <TipModalDescription />
      </Layout>
    </Page>
  )
}

export default Index;
