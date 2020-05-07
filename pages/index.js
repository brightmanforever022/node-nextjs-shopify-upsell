import { useState } from 'react';
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

  const [updateMetafieldIsLoading, setUpdateMetafieldIsLoading] = useState(false);

  const [newSettings, updateSettings] = useState();

  const handleUpdateSettings = async () => {
    setUpdateMetafieldIsLoading(true);

    const updateMetafield = await fetch('/updateSettingsMetafield', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metafieldValue: JSON.stringify(newSettings)
      })
    });
    const updateMetafieldJson = await updateMetafield.json();
    console.log('Response for updateMetafieldJson:', JSON.stringify(updateMetafieldJson));
  
    // Refetch data to make sure everything is up to date
    setUpdateMetafieldIsLoading(false);
    refetch();
  }
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const settings = JSON.parse(data.shop.metafields.edges[0].node.value);
  
  return (
    <Page
      title="Tip Settings"
      primaryAction={newSettings && newSettings != settings ? {
        content: 'Update settings',
        onAction: handleUpdateSettings,
        loading: updateMetafieldIsLoading
      } : null}
    >
      <Layout>
        <p>Metafield value: { JSON.stringify(settings) }</p>
        <p>State: { JSON.stringify(newSettings) }</p>

        <DefaultTippingPercentage />

        <EnableTipJarApp settings={settings} updateSettings={updateSettings} />

        <EnableCustomTipOption settings={settings} />

        <TipModalTitle />

        <TipModalDescription />
      </Layout>
    </Page>
  )
}

export default Index;
