import { useState, useEffect, Fragment } from "react";
import { Banner } from "@shopify/polaris";

function TopBannerInformation({ settings }) {
  const [bannerHide, setBannerHide] = useState(
    settings.snippet_installation_status || settings.product_installation_status
  );
  const instUrl =
    "https://" + settings.shop_domain + "/admin/apps/tipquik-local/install";
  const [installationUrl, setInstallationUrl] = useState(instUrl);

  useEffect(() => {
    setBannerHide(
      settings.snippet_installation_status ||
        settings.product_installation_status
    );
    const insUrl =
      "https://" + settings.shop_domain + "/admin/apps/tipquik-local/install";
    // const insUrl = 'https://alex-test-4-22-2018.myshopify.com/admin/apps/tipquik-local/install';
    // const insUrl = 'https://tipquik.ngrok.io/install';
    setInstallationUrl(insUrl);
  }, [settings]);

  return (
    <Fragment>
      {bannerHide && (
        <Banner
          title="You need to finish installing TipQuik"
          action={{
            content: "Finish installation",
            url: installationUrl,
            external: true,
          }}
          status="info"
        >
          <p>
            Customers will not see the tip modal or be able to leave a tip until
            you finish installing the app.
          </p>
        </Banner>
      )}
    </Fragment>
  );
}

export default TopBannerInformation;
