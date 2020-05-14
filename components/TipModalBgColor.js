import { useState } from 'react';
import { Layout, Card, FormLayout, TextField, ColorPicker } from '@shopify/polaris';

function TipModalBgColor({ settings, updateSettings }) {
  // const [tipModalBgColor, setTipModalBgColor] = useState({
  //   hue: 120,
  //   brightness: 1,
  //   saturation: 1,
  // });
  const [tipModalBgColor, setTipModalBgColor] = useState(settings.tipModalBgColor);

  const handleChange = (newTipModalBgColor) => {
    let newSettings = {...settings};
    newSettings.tipModalBgColor = newTipModalBgColor;
    updateSettings(newSettings);
    setTipModalBgColor(newTipModalBgColor);
  };

  return (
    <Layout.AnnotatedSection
      title="Tip Modal Background Color"
      description="Default background color for Tip Modal on store cart page."
    >
      <Card sectioned>
        <FormLayout>
          <ColorPicker onChange={handleChange} color={tipModalBgColor} />
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  )
}

export default TipModalBgColor;
