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
  waitForReply?: boolean;
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
  wait_for_reply?: boolean;
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
  order_digest?: string;
  is_conditional_order: boolean;
  wait_for_reply: boolean;
  client_order_id?: string;
}

export interface CancelOrderRequest {
  symbol: string;
  orderDigest?: string;
  waitForReply: boolean;
  clientOrderId?: string;
}

export interface CancelAllOrderRequest {
  symbol?: string;
  waitForReply: boolean;
}

export interface CancelAllOrderApiRequest {
  symbol?: string;
  subaccount: string;
  nonce: string;
  wait_for_reply: boolean;
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

// Market information types
export interface MarketInfo {
  id: number;
  symbol: string;
  name: string;
  base_asset: string;
  quote_asset: string;
  imf: string;
  mmf: string;
  maker_fee: string;
  taker_fee: string;
  price_feed_id: number;
  tick_size: string;
  lot_size: string;
  min_notional_size: string;
  max_conditional_orders: number;
}

export interface TokenAddress {
  chain: string;
  chain_id: number;
  address: string;
}

export interface CollateralInfo {
  asset: string;
  collateral_id: string;
  token_addresses: TokenAddress[];
  decimals: number;
  collat_factor_bps: string;
  borrow_factor_bps: string;
  price_feed_id: number;
  discount_rate_bps: string;
  withdrawal_base_fee: string;
  priority: number;
}

export interface HistorialFundingRateData {
  funding_rate: string;
  apr: string;
  avg_premium_index: string;
  created_at: number;
}

export type StreamMessage = {
  type: string;
};

export type TradeStreamMessage = StreamMessage & {
  symbol: string;
  data: {
    price: string;
    quantity: string;
    side: string;
    tradedAt: Date;
  };
};

export type CollateralPriceStreamMessage = StreamMessage & {
  collateralId: string;
  asset: string;
  price: string;
};

export enum OrderUpdateStatus {
  Open = "Open",
  Filled = "Filled",
  Canceled = "Canceled",
  Expired = "Expired",
  NotFound = "NotFound",
}

export enum OrderUpdateClientStatus {
  PartialFilled = "PartialFilled",
}

export type OrderUpdateStreamMessage = StreamMessage & {
  subaccount: string;
  data: {
    symbol: string;
    avgPrice: string;
    originalQuantity: string;
    filledQuantity: string;
    side: string;
    orderType: string;
    status: OrderUpdateStatus;
    orderUpdatedAt: Date;
    clientOrderId: string;
    orderDigest: string;
    tif: string;
  };
};

export type PositionUpdateStreamMessage = StreamMessage & {
  subaccount: string;
  data: {
    symbol: string;
    quantity: string;
    avgEntryPrice: string;
    side: string;
  };
};
