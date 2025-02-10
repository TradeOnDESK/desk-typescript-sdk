import "dotenv/config";
import { DeskExchange } from "../src";

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is required in .env file");
  }

  const sdk = new DeskExchange(
    "testnet",
    process.env.PRIVATE_KEY,
    0 // subAccountId
  );

  try {
    await sdk.authenticate();
    await sdk.wsClient.connect();
    await sdk.subscriptions.subscribeToMarkPrices((data) => {
      console.log("Received mark price data:", data);
    });
    await sdk.subscriptions.subscribeToOrderbook("BTCUSD", (data) => {
      console.log("Received BTCUSD orderbook data:", data);
    });
    await new Promise(() => {});
  } catch (error) {
    console.log("error", error);
  }
}

main().catch(console.error);
