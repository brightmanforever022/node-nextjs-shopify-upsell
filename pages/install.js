import { useState } from 'react';
import { Page, Layout, Card, TextStyle } from '@shopify/polaris';
import snippetContent from '../utils/snippetContent';

const Install = () => {
  const [createSnippetLoading, setCreateSnippetLoading] = useState(false);
  const [createProductLoading, setCreateProductLoading] = useState(false);

  const handleCreateSnippet = async () => {
    setCreateSnippetLoading(true);

    const createSnippet = await fetch('/createSnippet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'snippets/tipjar.liquid',
          value: snippetContent,
        }
      })
    });
    const createSnippetJson = await createSnippet.json();
    console.log('Response for createSnippetJson:', JSON.stringify(createSnippetJson));

    setCreateSnippetLoading(false);
  }

  const handleCreateProduct = async () => {
    setCreateProductLoading(true);

    const createProduct = await fetch('/createProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'product': {
          'title': 'Tip/Gratuity',
          'variants': [{
            'price': 0.01,
            'sku': 'TIPJAR',
            'taxable': false,
            'requires_shipping': false,
          }]
        }
      })
    });
    const createProductJson = await createProduct.json();
    console.log('Response for createProductJson:', JSON.stringify(createProductJson));

    setCreateProductLoading(false);
  }

  return (
    <Page title="Steps to install">
      <Layout>
        <Layout.Section>
          <Card
            sectioned
            title="Create the snippet"
            primaryFooterAction={{
              content: 'Create theme snippet',
              loading: createSnippetLoading,
              onAction: handleCreateSnippet
            }}
          >
            <p>Click the button below to install the <TextStyle variation="code">tipjar.liquid</TextStyle> snippet on your published theme.</p>
          </Card>

          <Card title="Include the snippet on your theme" sectioned>            
            <p>Manually add the below code to your <TextStyle variation="code">theme.liquid</TextStyle> file, directly above the <TextStyle variation="code">{'</body>'}</TextStyle> tag.</p>
            <p><TextStyle variation="code">{`{% render 'tipjar' %}`}</TextStyle></p>
          </Card>

          <Card
            title="Create the product"
            sectioned
            primaryFooterAction={{
              content: 'Create tip/gratuity product',
              loading: createProductLoading,
              onAction: handleCreateProduct
            }}
          >
            <p>Click the button below to create the Tip/Gratuity product.</p>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export default Install;
