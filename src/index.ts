import { ethers } from "ethers";
import * as CONSTANTS from "./types/constants";
import { Auth } from "./api/auth";
import { Network } from "./types";
import { Exchange } from "./api/exchange";
import { WebSocketClient } from "./websocket/connection";
import { WebSocketSubscriptions } from "./websocket/subscriptions";

export class DeskExchange {
  public auth: Auth;
  public exchange: Exchange;
  public wsClient: WebSocketClient;
  public subscriptions: WebSocketSubscriptions;

  constructor(network: Network, privateKey: string, subAccountId: number) {
    this.auth = new Auth(network, privateKey, subAccountId);
    this.exchange = new Exchange(this.auth);
    this.wsClient = new WebSocketClient(this.auth);
    this.subscriptions = new WebSocketSubscriptions(this.wsClient);
  }

  public async authenticate(): Promise<void> {
    await this.auth.generateJwt();
  }
}

export * from "./types";
