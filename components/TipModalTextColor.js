import { useState } from 'react';
import { Layout, Card, FormLayout, TextField, ColorPicker } from '@shopify/polaris';
import colorsys from 'colorsys';

const hsbToHsv = function({hue: h, brightness: v, saturation: s}) {
  const hsv = { h, s: (s * 100), v: (v * 100) };
  return hsv;
}

const hsvToHsb = function({h: hue, v: brightness, s: saturation}) {
  const hsb = { hue, brightness: (brightness / 100), saturation: (saturation / 100) };
  return hsb;
}

function TipModalTextColor({ settings, updateSettings }) {
  const [tipModalTextColor, setTipModalTextColor] = useState(hsvToHsb(colorsys.hexToHsv(settings.tipModalTextColor)));

  const handleChange = (newTipModalTextColor) => {
    let newSettings = {...settings};
    newSettings.tipModalTextColor = colorsys.hsvToHex(hsbToHsv(newTipModalTextColor));
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
          <ColorPicker onChange={handleChange} color={tipModalTextColor} />
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  )
}

export default TipModalTextColor;
