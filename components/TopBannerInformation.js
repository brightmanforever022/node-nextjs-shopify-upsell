import { useState, useEffect, Fragment } from "react";
import { Banner } from "@shopify/polaris";

function TopBannerInformation({ settings }) {
  const [bannerHide, setBannerHide] = useState(
    settings.snippet_installation_status || settings.product_installation_status
  );
  const [installationUrl, setInstallationUrl] = useState("");

  useEffect(() => {
    setBannerHide(
      settings.snippet_installation_status &&
        settings.product_installation_status
    );
    const instUrl =
      "https://" + settings.shop_domain + "/admin/apps/" + APP_URL + "/install";
    setInstallationUrl(instUrl);
  }, [settings]);

  return (
    <Fragment>
      {!bannerHide && (
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
