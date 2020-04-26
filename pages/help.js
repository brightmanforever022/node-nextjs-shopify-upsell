import { Page, Layout, Card } from '@shopify/polaris';

const Help = () => {
  return (
    <Page title="Help Center. We are here for you.">
      <Layout>
        <Layout.Section>
          <Card title="We are here for you. Connect with us." sectioned>
            <p>Send in your ticket and we will solve it in blazing fast speed.</p>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export default Help;
