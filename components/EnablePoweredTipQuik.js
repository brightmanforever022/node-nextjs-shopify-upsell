import { useState } from "react";
import { Layout, SettingToggle } from "@shopify/polaris";

function EnablePoweredTipQuik({ settings, shopPlan, updateSettings }) {
  const [poweredTipQuikActive, setPoweredTipQuikActive] = useState(
    settings.enablePoweredTipQuik
  );

  const handleToggle = () => {
    let newSettings = { ...settings };
    newSettings.enablePoweredTipQuik = !poweredTipQuikActive;
    updateSettings(newSettings);
    setPoweredTipQuikActive((poweredTipQuikActive) => !poweredTipQuikActive);
  };

  const contentStatus = poweredTipQuikActive ? "Disable" : "Enable";
  const textStatus = poweredTipQuikActive ? "enabled" : "disabled";

  return (
    <Layout.AnnotatedSection
      title="Enable 'Powered by TipQuik' text"
      description={`Will show "Powered by TipQuik" text in tip modal on store checkout page`}
    >
      <SettingToggle
        action={{
          content: contentStatus,
          onAction: handleToggle,
          disabled: !shopPlan,
        }}
        enabled={poweredTipQuikActive}
      >
        <p>Powered by TipQuik Option is currently {textStatus}.</p>
        {!shopPlan && <p>Upgrade to a paid plan to edit this setting</p>}
      </SettingToggle>
    </Layout.AnnotatedSection>
  );
}

export default EnablePoweredTipQuik;
