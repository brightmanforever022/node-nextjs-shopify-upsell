import dotenv from "dotenv";

dotenv.config();

async function getShopSettings(client, ctx) {
  const shopInfo = await client.query(
    "SELECT * FROM shops WHERE shop_domain=$1",
    [ctx.request.body.shop_domain]
  );

  if (shopInfo.rows.length == 1) {
    console.log("successfully got the shop data");
    ctx.status = 200;
    ctx.res.end(
      JSON.stringify({
        shopInformation: shopInfo.rows[0],
      })
    );
  } else {
    ctx.status = 400;
    ctx.res.end(
      JSON.stringify({
        error: `couldn't fetch shop details for ${ctx.request.body.shop_domain}`,
      })
    );
  }

  return;
}

async function requestHelp(client, ctx) {
  const nodemailer = require("nodemailer");
  const helpRequest = ctx.request.body.storedata;

  const mailOptions = {
    to: process.env.SUPPORT_EMAIL,
    from: helpRequest.shop_owner,
    subject: "TipQuik - installation help request - " + helpRequest.shop_domain,
    text:
      "TipQuik app installation help has been requested.\n Store URL: " +
      helpRequest.shop_domain +
      "\n Store owner email: " +
      helpRequest.shop_owner,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Send help request mail to support email (support@aesymmetric.xyz)
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  // Change installation_help_status in shop table (psql)
  const updateShop = await client.query(
    "UPDATE shops SET installation_help_status=true WHERE shop_domain=$1 RETURNING *",
    [helpRequest.shop_domain]
  );
  ctx.body = { storedata: updateShop.rows[0] };
}

module.exports = {
  getShopSettings,
  requestHelp,
};
