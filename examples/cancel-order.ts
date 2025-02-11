import "dotenv/config";
import { DeskExchange } from "../src";

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is required in .env file");
  }

  const sdk = new DeskExchange({
    network: "testnet",
    privateKey: process.env.PRIVATE_KEY,
    subAccountId: 0,
    enableWs: false,
  });

  const placeOrderResponse = await sdk.exchange.placeOrder({
    symbol: "BTCUSD",
    amount: "0.1",
    price: "80000",
    side: "Long",
    orderType: "Limit",
    reduceOnly: false,
    timeInForce: "GTC",
  });
  console.log(placeOrderResponse);

  const cancelOrderResponse = await sdk.exchange.cancelOrder({
    symbol: placeOrderResponse.symbol,
    orderDigest: placeOrderResponse.order_digest,
    waitForReply: true,
  });
  console.log(cancelOrderResponse);
}

main().catch(console.error);
