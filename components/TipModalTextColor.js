import { useState } from 'react';
import { Layout, Card, FormLayout, TextField, ColorPicker } from '@shopify/polaris';

function TipModalTextColor({ settings, updateSettings }) {
  // const [tipModalDescription, setTipModalDescription] = useState(settings.tipModalDescription);
  const [tipModalTextColor, setTipModalTextColor] = useState({
    hue: 120,
    brightness: 1,
    saturation: 1,
  });

  const handleChange = (newTipModalTextColor) => {
    let newSettings = {...settings};
    newSettings.tipModalTextColor = newTipModalTextColor;
    updateSettings(newSettings);
    setTipModalTextColor(newTipModalTextColor);
  };

  return (
    <Layout.AnnotatedSection
      title="Tip Modal Text Color"
      description="Default text color for Tip Modal on store cart page."
    >
      <Card sectioned>
        <FormLayout>
          <ColorPicker onChange={handleChange} color={color} />;
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  )
}

export default TipModalTextColor;
