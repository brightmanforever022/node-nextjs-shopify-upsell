import { useState, useCallback } from 'react';
import { Layout, Card, FormLayout, TextField } from '@shopify/polaris';

function TipModalTitle() {
  const [value, setValue] = useState('Leave a Tip');
  const handleChange = useCallback((newValue) => setValue(newValue), []);

  return (
    <Layout.AnnotatedSection
      title="Tip Modal Title"
      description="Choose the text that will be displayed ot the users on the Tip Modal."
    >
      <Card sectioned>
        <FormLayout>
          <TextField
            label="Title Text"
            value={value}
            onChange={handleChange}
          />
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  )
}

export default TipModalTitle;
