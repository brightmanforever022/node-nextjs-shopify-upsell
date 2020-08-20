import { useState } from "react";
import {
  Layout,
  Card,
  FormLayout,
  TextField,
  TextContainer,
} from "@shopify/polaris";

function DefaultTippingPercentage({
  settings,
  updateSettings,
  emptyError,
  updateError,
}) {
  const [defaultTipping1, setDefaultTipping1] = useState(
    settings.defaultTipping1
  );
  const [defaultTipping2, setDefaultTipping2] = useState(
    settings.defaultTipping2
  );
  const [defaultTipping3, setDefaultTipping3] = useState(
    settings.defaultTipping3
  );

  const handleChange1 = (newValue1) => {
    if (newValue1 > 100 || newValue1 < 1) {
      return settings.defaultTipping1;
    }
    let newSettings = { ...settings };
    newSettings.defaultTipping1 = newValue1;
    updateSettings(newSettings);
    setDefaultTipping1(newValue1);
  };

  const handleChange2 = (newValue2) => {
    if (newValue2 > 100 || newValue2 < 1) {
      return settings.defaultTipping2;
    }
    let newSettings = { ...settings };
    newSettings.defaultTipping2 = newValue2;
    updateSettings(newSettings);
    setDefaultTipping2(newValue2);
  };

  const handleChange3 = (newValue3) => {
    if (newValue3 > 100 || newValue3 < 1) {
      return settings.defaultTipping3;
    }
    let newSettings = { ...settings };
    newSettings.defaultTipping3 = newValue3;
    updateSettings(newSettings);
    setDefaultTipping3(newValue3);
  };

  return (
    <Layout.AnnotatedSection
      title="Default Tipping Percentage"
      description="Choose the percent amount of tip that you want your users to see on the checkout page for tipping."
    >
      <Card sectioned>
        <FormLayout>
          <FormLayout.Group condensed>
            <TextField
              label="Tip Amount #1"
              type="number"
              suffix="%"
              min={1}
              max={100}
              value={defaultTipping1}
              onChange={handleChange1}
            />
            <TextField
              label="Tip Amount #2"
              type="number"
              suffix="%"
              min={1}
              max={100}
              value={defaultTipping2}
              onChange={handleChange2}
            />
            <TextField
              label="Tip Amount #3"
              type="number"
              suffix="%"
              min={1}
              max={100}
              value={defaultTipping3}
              onChange={handleChange3}
            />
          </FormLayout.Group>
        </FormLayout>
        {emptyError && (
          <TextContainer>
            <p className="input-validation">
              You are trying with empty value. Please check and retry.
            </p>
          </TextContainer>
        )}
      </Card>
    </Layout.AnnotatedSection>
  );
}

export default DefaultTippingPercentage;
