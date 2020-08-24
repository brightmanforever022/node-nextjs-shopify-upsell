import { FooterHelp, Link } from "@shopify/polaris";
import $ from "jquery";

function FooterHelpDiv() {
  const triggerIntercom = () => {
    $(".intercom-launcher").trigger("click");
  };

  return (
    <FooterHelp>
      Need help? Get in touch via
      <span className="install-email live-chat" onClick={triggerIntercom}>
        live chat
      </span>
      or email us at
      <span className="install-email">
        <Link external url="mailto:support@aesymmetric.xyz">
          support@aesymmetric.xyz
        </Link>
      </span>
    </FooterHelp>
  );
}

export default FooterHelpDiv;
