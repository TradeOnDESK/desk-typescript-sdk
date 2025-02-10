import axios, { AxiosInstance } from "axios";
import { Auth } from "./auth";
import {
  OrderRequest,
  OrderApiResponse,
  SubaccountSummary,
  CancelOrderRequest,
  CancelOrderApiResponse,
  OrderApiRequest,
  CancelOrderApiRequest,
} from "../types";

export class Exchange {
  private auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  public async getSubAccountSummary(): Promise<SubaccountSummary> {
    const response = await this.auth.client.get(
      `/v2/subaccount-summary/${this.auth.getSubaccount()}`
    );
    return response.data.data as SubaccountSummary;
  }

  public async placeOrder(request: OrderRequest): Promise<OrderApiResponse> {
    const response = await this.auth.client.post(`v2/place-order`, {
      symbol: request.symbol,
      subaccount: this.auth.getSubaccount(),
      amount: request.amount,
      price: request.price,
      side: request.side,
      nonce: this.auth.generateNonce(),
      broker_id: process.env.BROKER || "DESK",
      order_type: request.orderType,
      reduce_only: request.reduceOnly,
      time_in_force: request.timeInForce,
    } as OrderApiRequest);
    return response.data.data as OrderApiResponse;
  }

  public async cancelOrder(
    request: CancelOrderRequest
  ): Promise<CancelOrderApiResponse> {
    const response = await this.auth.client.post(`v2/cancel-order`, {
      symbol: request.symbol,
      subaccount: this.auth.getSubaccount(),
      nonce: this.auth.generateNonce(),
      order_digest: request.orderDigest,
      is_conditional_order: false,
      wait_for_reply: request.waitForReply,
    } as CancelOrderApiRequest);
    return response.data.data as CancelOrderApiResponse;
  }
}
