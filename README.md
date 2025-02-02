# DESK Typescript SDK

A TypeScript client for interacting with DESK Exchange API, featuring JWT authentication and EVM wallet integration.

## Features

- EVM wallet integration
- JWT-based authentication
- Subaccount management
- Type-safe API interactions
- Real-time WebSocket support
- Comprehensive error handling

## Installation

```
npm install @desk-exchange/sdk
# or
yarn add @desk-exchange/sdk
```

## Usage

### Initialize the Client

```
import { DeskExchange } from '@desk-exchange/sdk';

const client = new DeskExchange(
    "testnet",
    process.env.PRIVATE_KEY,
    0 // subAccountId
  );

// Generate JWT for authentication
await client.authenticate();
```

### Account Management

```
// Get account information
const accountInfo = await sdk.exchange.getSubAccountSummary();
```

### Trading Operations

```
// Place a limit order
const limitOrder = await sdk.exchange.placeOrder({
    symbol: "BTCUSD",
    amount: "0.1",
    price: "99714.4",
    side: "Long",
    orderType: "Limit",
    reduceOnly: false,
    timeInForce: "GTC",
  });

// Place a market order
const marketOrder = await sdk.exchange.placeOrder({
    symbol: "BTCUSD",
    amount: "0.0001",
    price: "0",
    side: "Short",
    orderType: "Market",
    reduceOnly: false,
  });

// Cancel an order
await sdk.exchange.cancelOrder(orderId);
```

### WebSocket Streams

```
// Subscribe to order updates
client.ws.subscribeOrders((order) => {
  console.log('Order update:', order);
});

// Subscribe to trade updates
client.ws.subscribeTrades('BTC-USDT', (trade) => {
  console.log('New trade:', trade);
});

// Subscribe to market data
client.ws.subscribeMarketData('ETH-USDT', (data) => {
  console.log('Market data update:', data);
});
```

## Configuration

The client can be configured with different environments and options:

```
const client = new DeskExchange(wallet, {
  network: 'mainnet',                   // 'mainnet' or 'testnet' environment
  privateKey: process.env.PRIVATE_KEY,  // EVM wallet private key from .env file
  subAccountId: 0,                      // Sub-account Id to interact with,
                                        // for multiple sub-account, you can initialize multiple
                                        // DeskExchange
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

```

MIT License - see the [LICENSE](LICENSE) file for details.

```
