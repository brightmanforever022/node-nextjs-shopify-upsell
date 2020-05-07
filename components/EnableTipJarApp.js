import { useState, useCallback } from 'react';
import { Layout, SettingToggle } from '@shopify/polaris';

function EnableTipJarApp({ settings, updateSettings }) {
  console.log('settings.enableTipJar', settings.enableTipJar);
  const [tipJarActive, setTipJarActive] = useState(settings.enableTipJar);

  const handleToggle = useCallback(() => setTipJarActive((settings) => {
    let newSettings = settings;
    newSettings.enableTipJar = tipJarActive;
    updateSettings(newSettings);
  }), []);

  const contentStatus = tipJarActive ? 'Disable' : 'Enable';
  const textStatus = tipJarActive ? 'enabled' : 'disabled';

  return (
    <Layout.AnnotatedSection
      title="Enable TipJar App"
      description="Will mandatory enable or disable the TipJar Modal on store checkout page."
    >
      <SettingToggle
        action={{
          content: contentStatus,
          onAction: handleToggle,
        }}
        enabled={tipJarActive}
      >
        TipJar is currently {textStatus}.
      </SettingToggle>
    </Layout.AnnotatedSection>
  )
}

export default EnableTipJarApp;
