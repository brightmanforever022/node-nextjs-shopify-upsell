import { Page, Layout } from '@shopify/polaris';
import DefaultTippingPercentage from '../components/DefaultTippingPercentage';
import EnableTipJarApp from '../components/EnableTipJarApp';
import EnableCustomTipOption from '../components/EnableCustomTipOption';
import TipModalTitle from '../components/TipModalTitle';
import TipModalDescription from '../components/TipModalDescription';

const Index = () => {
  return (
    <Page title="Tip Settings">
      <Layout>
        <DefaultTippingPercentage />

        <EnableTipJarApp />

        <EnableCustomTipOption />

        <TipModalTitle />

        <TipModalDescription />

        {/* <Layout.AnnotatedSection
          title="Tip Modal Background Color"
          description="Default background color for Tip Modal on store checkout page."
        >
          <Card sectioned>
            <FormLayout>
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Tip Modal Text Color"
          description="Default text color for Tip Modal on store checkout page."
        >
          <Card sectioned>
            <FormLayout>
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection> */}
      </Layout>
    </Page>
  )
}

export default Index;
