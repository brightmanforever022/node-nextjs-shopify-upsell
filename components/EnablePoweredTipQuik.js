import { useState } from "react";
import { Layout, SettingToggle } from "@shopify/polaris";

function EnablePoweredTipQuik({ settings, updateSettings }) {
  const [enablePoweredTipQuik, setEnablePoweredTipQuik] = useState(
    settings.enablePoweredTipQuik
  );

  const handleToggle = () => {
    let newSettings = { ...settings };
    newSettings.enablePoweredTipQuik = !enablePoweredTipQuik;
    updateSettings(newSettings);
    setEnablePoweredTipQuik((enablePoweredTipQuik) => !enablePoweredTipQuik);
  };

  const contentStatus = enablePoweredTipQuik ? "Disable" : "Enable";
  const textStatus = enablePoweredTipQuik ? "enabled" : "disabled";

  return (
    <Layout.AnnotatedSection
      title="Enable 'Powered by TipQuik' text"
      description={`Will show "Powered by TipQuik" text in tip modal on store checkout page`}
    >
      <SettingToggle
        action={{
          content: contentStatus,
          onAction: handleToggle,
        }}
        enabled={enablePoweredTipQuik}
      >
        Custom Tip Option is currently {textStatus}.
      </SettingToggle>
    </Layout.AnnotatedSection>
  );
}

export default EnablePoweredTipQuik;
