import { Page, Layout } from '@shopify/polaris';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
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

const Index = () => {
  const { loading, error, data, refetch } = useQuery(SHOP_TIPJAR_METAFIELD_QUERY, {
    fetchPolicy: 'network-only'
  });

  const handleUpdateSettings = async () => {
    const updateMetafield = await fetch('/updateSettingsMetafield', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metafieldValue: 'This is a newly updated value again 22222.'
      })
    });
    const updateMetafieldJson = await updateMetafield.json();
    console.log('Response for updateMetafieldJson:', JSON.stringify(updateMetafieldJson));
  
    // Refetch data to make sure everything is up to date
    refetch();
  }
  
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
