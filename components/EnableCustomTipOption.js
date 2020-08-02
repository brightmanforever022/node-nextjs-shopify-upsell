import { useState } from "react";
import { Layout, SettingToggle } from "@shopify/polaris";

function EnableCustomTipOption({ settings, shopPlan, updateSettings }) {
  const [customTipOptionActive, setCustomTipOptionActive] = useState(
    settings.enableCustomTipOption
  );

  const handleToggle = () => {
    let newSettings = { ...settings };
    newSettings.enableCustomTipOption = !customTipOptionActive;
    updateSettings(newSettings);
    setCustomTipOptionActive((customTipOptionActive) => !customTipOptionActive);
  };

  const contentStatus = customTipOptionActive ? "Disable" : "Enable";
  const textStatus = customTipOptionActive ? "enabled" : "disabled";

  return (
    <Layout.AnnotatedSection
      title="Enable Custom Tip Option"
      description={`Will show "Custom Tip Amount" option in tip modal on store checkout page`}
    >
      <SettingToggle
        action={{
          content: contentStatus,
          onAction: handleToggle,
          disabled: !shopPlan,
        }}
        enabled={customTipOptionActive}
      >
        <p>Custom Tip Option is currently {textStatus}.</p>
        {!shopPlan && <p>Upgrade to a paid plan to edit this setting</p>}
      </SettingToggle>
    </Layout.AnnotatedSection>
  );
}

export default EnableCustomTipOption;
