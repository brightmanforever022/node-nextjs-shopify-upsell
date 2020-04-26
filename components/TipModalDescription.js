import { useState, useCallback } from 'react';
import { Layout, Card, FormLayout, TextField } from '@shopify/polaris';

function TipModalDescription() {
  const [value, setValue] = useState('All tips go towards our hard-working delivery drivers.');
  const handleChange = useCallback((newValue) => setValue(newValue), []);

  return (
    <Layout.AnnotatedSection
      title="Tip Modal Description"
      description="Short description that will be displayed to the users on the Tip Modal."
    >
      <Card sectioned>
        <FormLayout>
          <TextField
            label="Title Text"
            value={value}
            onChange={handleChange}
            multiline={true}
          />
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  )
}

export default TipModalDescription;
