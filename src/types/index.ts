import { BASE_URLS } from "./constants";

export type Network = keyof typeof BASE_URLS;

export interface OpenOrder {
  order_digest: string;
  symbol: string;
  side: "Long" | "Short";
  price: string;
  original_quantity: string;
  remaining_quantity: string;
  order_type: "Limit" | "StopMarket" | "TakeProfitMarket";
  client_order_id: string | null;
  time_in_force: "GTC" | "IOC";
  created_at: number;
  is_reduce_only: boolean;
  is_conditional_order: boolean;
  trigger_price: string | null;
  is_trigger_above_threshold: boolean | null;
}

export interface Collateral {
  asset: string;
  collateral_id: string;
  amount: string;
}

export interface Position {
  symbol: string;
  quantity: string;
  avg_entry_price: string;
  side: "Long" | "Short";
  last_updated_funding_fee: string;
}

export interface SubaccountSummary {
  open_orders: OpenOrder[];
  collaterals: Collateral[];
  positions: Position[];
  account_margin: string;
  collateral_value: string;
  unrealized_pnl: string;
  pending_funding_fee: string;
  pending_borrowing_fee: string;
  account_imr: string;
  order_imr: string;
  position_imr: string;
  position_mmr: string;
}

export interface OrderRequest {
  symbol: string;
  amount: string;
  price: string;
  side: "Long" | "Short";
  orderType: "Limit" | "Market" | "StopMarket" | "TakeProfitMarket";
  reduceOnly: boolean;
  timeInForce?: "GTC" | "IOC" | "FOK" | undefined;
}

export interface OrderApiRequest {
  symbol: string;
  subaccount: string;
  amount: string;
  price: string;
  side: "Long" | "Short";
  nonce: string;
  broker_id: string;
  order_type: "Limit" | "Market" | "StopMarket" | "TakeProfitMarket";
  reduce_only: boolean;
  time_in_force: "GTC" | "IOC" | "FOK";
}

export interface OrderApiResponse {
  subaccount: string;
  symbol: string;
  side: "Long" | "Short";
  price: string;
  quantity: string;
  nonce: string;
  order_type: "Limit" | "Market" | "StopMarket" | "TakeProfitMarket";
  time_in_force: "GTC" | "IOC" | "FOK";
  order_digest: string;
  filled_quantity: string;
  avg_fill_price: string;
  execution_fee: string;
  client_order_id: string | null;
  trigger_price: string | null;
}

export interface CancelOrderApiRequest {
  symbol: string;
  subaccount: string;
  nonce: string;
  order_digest: string;
  is_conditional_order: boolean;
  wait_for_reply: boolean;
}

export interface CancelOrderRequest {
  symbol: string;
  orderDigest: string;
  waitForReply: boolean;
}

interface CancelledOrder {
  order_digest: string;
  status: "Success" | "Failed";
}

export interface CancelOrderApiResponse {
  orders: CancelledOrder[];
}

export interface MarkPrice {
  symbol: string;
  markPrice: string;
  indexPrice: string;
}

// Type for a single order book entry [price, quantity]
type OrderBookEntry = [string, string];

export interface OrderBook {
  bids: OrderBookEntry[]; // Array of [price, quantity] for buy orders
  asks: OrderBookEntry[]; // Array of [price, quantity] for sell orders
}
