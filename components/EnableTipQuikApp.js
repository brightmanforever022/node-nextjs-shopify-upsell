import { useState } from "react";
import { Layout, SettingToggle } from "@shopify/polaris";

function EnableTipQuikApp({ settings, updateSettings }) {
  const [tipQuikActive, setTipQuikActive] = useState(settings.enableTipQuik);

  const handleToggle = () => {
    let newSettings = { ...settings };
    newSettings.enableTipQuik = !tipQuikActive;
    updateSettings(newSettings);
    setTipQuikActive((tipQuikActive) => !tipQuikActive);
  };

  const contentStatus = tipQuikActive ? "Disable" : "Enable";
  const textStatus = tipQuikActive ? "enabled" : "disabled";

  return (
    <Layout.AnnotatedSection
      title="Enable TipQuik App"
      description="Will mandatory enable or disable the TipQuik Modal on store checkout page."
    >
      <SettingToggle
        action={{
          content: contentStatus,
          onAction: handleToggle,
        }}
        enabled={tipQuikActive}
      >
        TipQuik is currently {textStatus}.
      </SettingToggle>
    </Layout.AnnotatedSection>
  );
}

export default EnableTipQuikApp;
