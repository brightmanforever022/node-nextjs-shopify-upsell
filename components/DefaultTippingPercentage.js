import { Layout, Card, FormLayout, Checkbox } from '@shopify/polaris';

function DefaultTippingPercentage({ settings, updateSettings }) {
  const [defaultTipping15, setDefaultTipping15] = useState(settings.defaultTipping15);
  const [defaultTipping20, setDefaultTipping20] = useState(settings.defaultTipping20);
  const [defaultTipping25, setDefaultTipping25] = useState(settings.defaultTipping25);

  const handleChange15 = (newValue15) => {
    let newSettings = {...settings};
    newSettings.defaultTipping15 = newValue15;
    updateSettings(newSettings);
    setDefaultTipping15(newValue15);
  };

  const handleChange20 = (newValue20) => {
    let newSettings = {...settings};
    newSettings.defaultTipping20 = newValue20;
    updateSettings(newSettings);
    setDefaultTipping20(newValue20);
  };

  const handleChange25 = (newValue25) => {
    let newSettings = {...settings};
    newSettings.defaultTipping25 = newValue25;
    updateSettings(newSettings);
    setDefaultTipping25(newValue25);
  };
  
  return (
    <Layout.AnnotatedSection
      title="Default Tipping Percentage"
      description="Choose the percent amount of tip that you want your users to see on the checkout page for tipping."
    >
      <Card sectioned>
        <FormLayout>
          <Checkbox
            label="15%"
            checked={defaultTipping15}
            onChange={handleChange15}
          />
          <Checkbox
            label="20%"
            checked={defaultTipping20}
            onChange={handleChange20}
          />
          <Checkbox
            label="25%"
            checked={defaultTipping25}
            onChange={handleChange25}
          />
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  )
}

export default DefaultTippingPercentage;
