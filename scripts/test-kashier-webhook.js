/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const crypto = require("node:crypto");
/* eslint-enable @typescript-eslint/no-require-imports */

const ORDER_ID = "80054afc-7c4f-4a8c-8862-bb71a98c0815";
const ENDPOINT = "http://localhost:3000/api/webhooks/kashier";

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return {};

  return Object.fromEntries(
    fs.readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].replace(/^['"]|['"]$/g, "")])
  );
}

const env = { ...process.env, ...loadEnvFile(".env"), ...loadEnvFile(".env.local") };
const signingSecret = env.KASHIER_SECRET_KEY;
if (!signingSecret) {
  throw new Error("KASHIER_SECRET_KEY is missing from .env.local");
}

const payload = {
  id: `local-test-${Date.now()}`,
  eventId: `local-test-${Date.now()}`,
  merchantOrderId: ORDER_ID,
  transactionId: `local-transaction-${Date.now()}`,
  status: "SUCCESS",
  amount: 1200,
  currency: "EGP",
  metaData: { source: "local-webhook-test" },
};

const body = JSON.stringify(payload);
async function main() {
  const signature = crypto.createHmac("sha256", signingSecret).update(body, "utf8").digest("hex");
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-kashier-signature": signature,
    },
    body,
  });

  const responseBody = await response.text();
  console.log(`HTTP ${response.status}`);
  console.log(responseBody);

  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
