import { MarkPrice, OrderBook } from "../types";
import { WebSocketClient } from "./connection";

export class WebSocketSubscriptions {
  private ws: WebSocketClient;
  private activeSubscriptions: Map<string, Set<Function>> = new Map();

  constructor(ws: WebSocketClient) {
    this.ws = ws;
  }

  private addSubscriptionCallback(key: string, callback: Function): void {
    if (!this.activeSubscriptions.has(key)) {
      this.activeSubscriptions.set(key, new Set());
    }
    this.activeSubscriptions.get(key)?.add(callback);
  }

  private async subscribe(subscription: {
    type: string;
    [key: string]: any;
  }): Promise<void> {
    await this.ws.sendMessage({
      method: "subscribe",
      subscription: subscription,
    });
  }

  private async unsubscribe(subscription: {
    type: string;
    [key: string]: any;
  }): Promise<void> {
    await this.ws.sendMessage({
      method: "unsubscribe",
      subscription: subscription,
    });
  }

  async subscribeToMarkPrices(callback: (data: any) => void): Promise<void> {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    const subscriptionType = { type: "markPricesV2" };
    const subscriptionKey = JSON.stringify(subscriptionType);

    // Remove existing subscription if any
    if (this.activeSubscriptions.has(subscriptionKey)) {
      await this.unsubscribeFromMarkPrices();
    }

    this.addSubscriptionCallback(subscriptionKey, callback);

    const messageHandler = async (message: any) => {
      if (message.type === "markPricesV2") {
        if (message.data) {
          const response = message.data.map((each: any) => {
            return {
              symbol: each.symbol,
              markPrice: each.mark_price,
              indexPrice: each.index_price,
            } as MarkPrice;
          });
          callback(response);
        }
      }
    };

    (callback as any).__messageHandler = messageHandler;
    this.ws.on("message", messageHandler);
    await this.subscribe(subscriptionType);
  }

  async unsubscribeFromMarkPrices(): Promise<void> {
    const subscriptionType = { type: "markPricesV2" };
    const subscriptionKey = JSON.stringify(subscriptionType);
    const callbacks = this.activeSubscriptions.get(subscriptionKey);

    if (callbacks) {
      for (const callback of callbacks) {
        const messageHandler = (callback as any).__messageHandler;
        if (messageHandler) {
          this.ws.removeListener("message", messageHandler);
          delete (callback as any).__messageHandler;
        }
      }
      this.activeSubscriptions.delete(subscriptionKey);
    }

    await this.unsubscribe(subscriptionType);
  }

  async subscribeToOrderbook(
    symbol: string,
    callback: (data: any) => void
  ): Promise<void> {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    const subscriptionType = { type: "l2BookV2", symbol: symbol };
    const subscriptionKey = JSON.stringify(subscriptionType);

    // Remove existing subscription if any
    if (this.activeSubscriptions.has(subscriptionKey)) {
      await this.unsubscribeFromOrderbook(symbol);
    }

    this.addSubscriptionCallback(subscriptionKey, callback);

    const messageHandler = async (message: any) => {
      if (message.type === "l2BookV2") {
        if (message.data) {
          callback(message.data as OrderBook);
        }
      }
    };

    (callback as any).__messageHandler = messageHandler;
    this.ws.on("message", messageHandler);
    await this.subscribe(subscriptionType);
  }

  async unsubscribeFromOrderbook(symbol: string): Promise<void> {
    const subscriptionType = { type: "l2BookV2", symbol: symbol };
    const subscriptionKey = JSON.stringify(subscriptionType);
    const callbacks = this.activeSubscriptions.get(subscriptionKey);

    if (callbacks) {
      for (const callback of callbacks) {
        const messageHandler = (callback as any).__messageHandler;
        if (messageHandler) {
          this.ws.removeListener("message", messageHandler);
          delete (callback as any).__messageHandler;
        }
      }
      this.activeSubscriptions.delete(subscriptionKey);
    }

    await this.unsubscribe(subscriptionType);
  }
}
