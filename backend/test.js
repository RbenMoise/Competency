const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const API_SECRET = process.env.STANBIC_API_SECRET;
const API_CLIENT_ID = process.env.STANBIC_CLIENT_ID;
const API_KEY = process.env.STANBIC_API_KEY;

async function sendTestNotification() {
  const payload = {
    TransactionType: "ACTRANSFER",
    TransID: `FI23065PQQPF${Date.now()}`,
    TransTime: "16/05/2023 at 01:40PM",
    TransAmount: "KES 801.00",
    BusinessShortCode: "01000XXXXXXXX",
    BusinessAccountNo: "01000XXXXXXXX",
    BillRefNumber: "51112XXX",
    InvoiceNumber: "51112XXX",
    ThirdPartyTransID: `FT23065P0QPF${Date.now()}`,
    MSISDN: "254705773329",
    PaymentDetails: "Test payment details",
    CallbackUrl: "http://185.187.235.68:5000/api/stanbic/notifications",
    apiClientId: API_CLIENT_ID,
    ApiKey: "n",
    ApiSecret: "n",
  };

  // Parse TransAmount
  const transAmountParts = payload.TransAmount.split(" ");
  console.log("🔍 Test Split Result:", transAmountParts);

  if (transAmountParts.length < 2) {
    console.error("❌ Invalid test TransAmount format:", payload.TransAmount);
    return;
  }

  const currency = transAmountParts[0];
  const amount = transAmountParts[1];
  console.log("💱 Test Currency:", currency);
  console.log("💰 Test Amount:", amount);

  // Construct hash message
  const message = `${payload.apiClientId}${payload.BillRefNumber}${amount}${currency}${payload.ThirdPartyTransID}${payload.TransTime}${payload.PaymentDetails}${payload.BusinessAccountNo}${API_SECRET}`;
  console.log("🔐 Test Message:", message);

  // Generate hash
  const secureHash = crypto
    .createHmac("sha256", API_KEY)
    .update(message)
    .digest("base64");
  console.log("✅ Test secureHash:", secureHash);

  payload.secureHash = secureHash;

  try {
    const response = await axios.post(
      "https://offertory.karengatasda.org/api/stanbic2/notifications", // Corrected URL
      payload,
      {
        headers: {
          "API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Response from server:", response.data);
  } catch (err) {
    console.error(
      "❌ Error sending notification:",
      err.response?.data || err.message
    );
  }
}

sendTestNotification();
