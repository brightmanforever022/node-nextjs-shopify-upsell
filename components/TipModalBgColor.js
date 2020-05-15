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

function TipModalBgColor({ settings, updateSettings }) {
  const [tipModalBgColor, setTipModalBgColor] = useState(hsvToHsb(colorsys.hexToHsv(settings.tipModalBgColor)));

  const handleChange = (newTipModalBgColor) => {
    let newSettings = {...settings};
    newSettings.tipModalBgColor = colorsys.hsvToHex(hsbToHsv(newTipModalBgColor));
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
