import { MarkPrice, OrderBook } from "../types";
import { WebSocketClient } from "./connection";

type SubscriptionType = "markPricesV2" | "l2BookV2";
type MessageHandler = (message: any) => void;

interface Subscription {
  type: SubscriptionType;
  symbol?: string;
}

interface SubscriptionCallback {
  callback: Function;
  messageHandler: MessageHandler;
}

export class WebSocketSubscriptions {
  private ws: WebSocketClient;
  private subscriptions: Map<string, Set<SubscriptionCallback>> = new Map();

  constructor(ws: WebSocketClient) {
    this.ws = ws;
  }

  private getSubscriptionKey(subscription: Subscription): string {
    return JSON.stringify(subscription);
  }

  private addSubscription(
    subscription: Subscription,
    callback: Function,
    messageHandler: MessageHandler
  ): void {
    const key = this.getSubscriptionKey(subscription);
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)?.add({ callback, messageHandler });
  }

  private async subscribe(subscription: Subscription): Promise<void> {
    await this.ws.sendMessage({
      method: "subscribe",
      subscription,
    });
  }

  private async unsubscribe(subscription: Subscription): Promise<void> {
    await this.ws.sendMessage({
      method: "unsubscribe",
      subscription,
    });
  }

  private removeSubscription(subscription: Subscription): void {
    const key = this.getSubscriptionKey(subscription);
    const callbacks = this.subscriptions.get(key);

    if (callbacks) {
      for (const { messageHandler } of callbacks) {
        this.ws.removeListener("message", messageHandler);
      }
      this.subscriptions.delete(key);
    }
  }

  async subscribeToMarkPrices(
    callback: (data: MarkPrice[]) => void
  ): Promise<void> {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    const subscription: Subscription = { type: "markPricesV2" };

    const messageHandler: MessageHandler = (message: any) => {
      if (message.type === "markPricesV2" && message.data) {
        const markPrices = message.data.map((item: any) => ({
          symbol: item.symbol,
          markPrice: item.mark_price,
          indexPrice: item.index_price,
        }));
        callback(markPrices);
      }
    };

    this.addSubscription(subscription, callback, messageHandler);
    this.ws.on("message", messageHandler);
    await this.subscribe(subscription);
  }

  async unsubscribeFromMarkPrices(): Promise<void> {
    const subscription: Subscription = { type: "markPricesV2" };
    this.removeSubscription(subscription);
    await this.unsubscribe(subscription);
  }

  async subscribeToOrderbook(
    symbol: string,
    callback: (data: OrderBook) => void
  ): Promise<void> {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    const subscription: Subscription = { type: "l2BookV2", symbol };

    const messageHandler: MessageHandler = (message: any) => {
      if (message.type === "l2BookV2" && message.data) {
        callback(message.data as OrderBook);
      }
    };

    this.addSubscription(subscription, callback, messageHandler);
    this.ws.on("message", messageHandler);
    await this.subscribe(subscription);
  }

  async unsubscribeFromOrderbook(symbol: string): Promise<void> {
    const subscription: Subscription = { type: "l2BookV2", symbol };
    this.removeSubscription(subscription);
    await this.unsubscribe(subscription);
  }
}
