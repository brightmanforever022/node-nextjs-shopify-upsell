import { Layout, Card, FormLayout, Checkbox } from '@shopify/polaris';

function DefaultTippingPercentage() {
  return (
    <Layout.AnnotatedSection
      title="Default Tipping Percentage"
      description="Choose the percent amount of tip that you want your users to see on the checkout page for tipping."
    >
      <Card sectioned>
        <FormLayout>
          <Checkbox
            label="15%"
            checked={false}
            // onChange={handleChange}
          />
          <Checkbox
            label="20%"
            checked={true}
            // onChange={handleChange}
          />
          <Checkbox
            label="25%"
            checked={true}
            // onChange={handleChange}
          />
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  )
}

export default DefaultTippingPercentage;
