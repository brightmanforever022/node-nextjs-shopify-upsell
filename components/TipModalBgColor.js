import { useState } from 'react';
import { Layout, Card, FormLayout, TextField } from '@shopify/polaris';

function TipModalBgColor({ settings, updateSettings }) {
  const [tipModalDescription, setTipModalDescription] = useState(settings.tipModalDescription);

  const handleChange = (newTipModalDescription) => {
    let newSettings = {...settings};
    newSettings.tipModalDescription = newTipModalDescription;
    updateSettings(newSettings);
    setTipModalDescription(newTipModalDescription);
  };

  return (
    <Layout.AnnotatedSection
      title="Tip Modal Background Color"
      description="Default background color for Tip Modal on store cart page."
    >
      <Card sectioned>
        <FormLayout>
          <TextField
            label="Description Text"
            value={tipModalDescription}
            onChange={handleChange}
            multiline={true}
          />
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  )
}

export default TipModalBgColor;
