import { useState } from 'react';
import { Layout, Card, FormLayout, TextField } from '@shopify/polaris';

function TipModalTitle({ settings, updateSettings }) {
  const [tipModalTitle, setTipModalTitle] = useState(settings.tipModalTitle);

  const handleChange = (newTipModalTitle) => {
    let newSettings = {...settings};
    newSettings.tipModalTitle = newTipModalTitle;
    updateSettings(newSettings);
    setTipModalTitle(newTipModalTitle);
  };

  return (
    <Layout.AnnotatedSection
      title="Tip Modal Title"
      description="Choose the text that will be displayed ot the users on the Tip Modal."
    >
      <Card sectioned>
        <FormLayout>
          <TextField
            label="Title Text"
            value={tipModalTitle}
            onChange={handleChange}
          />
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  )
}

export default TipModalTitle;
