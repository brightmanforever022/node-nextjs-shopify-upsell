import { FooterHelp, Link } from "@shopify/polaris";

function FooterHelpDiv() {
  return (
    <FooterHelp>
      Need help? Get in touch via live chat or email us at
      <span className="install-email">
        <Link external url="mailto:support@aesymmetric.xyz">
          support@aesymmetric.xyz
        </Link>
      </span>
    </FooterHelp>
  );
}

export default FooterHelpDiv;
