import { FooterHelp, Link } from "@shopify/polaris";

function IntercomSupport() {
  window.intercomSettings = {
    app_id: "WORKSPACE_ID", // Replace this with your workspace ID
    name: "Jane Doe", // Full name
    email: "customer@example.com", // Email address
    created_at: 1312182000, // Signup date as a Unix timestamp
  };

  (function () {
    var w = window;
    var ic = w.Intercom;
    if (typeof ic === "function") {
      ic("reattach_activator");
      ic("update", w.intercomSettings);
    } else {
      var d = document;
      var i = function () {
        i.c(arguments);
      };
      i.q = [];
      i.c = function (args) {
        i.q.push(args);
      };
      w.Intercom = i;
      var l = function () {
        var s = d.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://widget.intercom.io/widget/" + APP_ID;
        var x = d.getElementsByTagName("script")[0];
        x.parentNode.insertBefore(s, x);
      };
      if (w.attachEvent) {
        w.attachEvent("onload", l);
      } else {
        w.addEventListener("load", l, false);
      }
    }
  })();
}

export default IntercomSupport;
