import { Auth } from "./auth";
import {
  OrderRequest,
  OrderApiResponse,
  SubaccountSummary,
  CancelOrderRequest,
  CancelOrderApiResponse,
  OrderApiRequest,
  CancelOrderApiRequest,
  CancelAllOrderRequest,
  CancelAllOrderApiRequest,
} from "../types";
import { BROKER_ID, VAULT_ADDRESS } from "../types/constants";
import { DeskExchange } from "..";
import { ethers } from "ethers";
import vaultAbi from "./vault_abi.json";

const erc20ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export class Exchange {
  private auth: Auth;
  private parent: DeskExchange;

  constructor(auth: Auth, parent: DeskExchange) {
    this.auth = auth;
    this.parent = parent;
  }

  public async depositCollateral(
    tokenAddress: string,
    amount: number
  ): Promise<ethers.ContractTransactionReceipt> {
    if (!this.auth.wallet)
      throw new Error("PRIVATE_KEY is required in .env file");
    const erc20 = new ethers.Contract(tokenAddress, erc20ABI, this.auth.wallet);
    const vaultAddress = VAULT_ADDRESS[this.auth.network];
    const vaultContract = new ethers.Contract(
      vaultAddress,
      vaultAbi,
      this.auth.wallet
    );
    const minDepositAmount = await vaultContract.minDeposits(tokenAddress);
    const decimals = await erc20.decimals();
    const amountToDeposit = ethers.parseUnits(amount.toString(), decimals);
    const tokenSymbol = await erc20.symbol();
    if (amountToDeposit < minDepositAmount) {
      throw new Error(
        `Minimum deposit ${ethers.formatUnits(
          minDepositAmount,
          decimals
        )} ${tokenSymbol}`
      );
    }

    const allowance = await erc20.allowance(
      this.auth.wallet.address,
      vaultAddress
    );

    console.log(
      `Depositing ${amount} ${tokenSymbol} to DESK Exchange for ${this.auth.getSubaccount()}`
    );
    if (allowance < amountToDeposit) {
      const tx = await erc20.approve(vaultAddress, amountToDeposit);
      console.log(`Approving ${amount} ${tokenSymbol}...`);
      await tx.wait();
      console.log(`Approval success!`);
    }

    const tx = await vaultContract.deposit(
      tokenAddress,
      this.auth.getSubaccount(),
      amountToDeposit
    );
    const receipt = (await tx.wait()) as ethers.ContractTransactionReceipt;
    console.log("Deposit successful!");
    return receipt;
  }

  public async withdrawCollateral(
    tokenAddress: string,
    amount: number
  ): Promise<ethers.ContractTransactionReceipt> {
    if (!this.auth.wallet)
      throw new Error("PRIVATE_KEY is required in .env file");

    const erc20 = new ethers.Contract(tokenAddress, erc20ABI, this.auth.wallet);
    const vaultAddress = VAULT_ADDRESS[this.auth.network];
    const vaultContract = new ethers.Contract(
      vaultAddress,
      vaultAbi,
      this.auth.wallet
    );

    const decimals = await erc20.decimals();
    const amountToWithdraw = ethers.parseUnits(amount.toString(), decimals);
    const tokenSymbol = await erc20.symbol();

    console.log(
      `Withdrawing ${amount} ${tokenSymbol} from DESK Exchange from ${this.auth.getSubaccount()}`
    );

    const tx = await vaultContract.withdraw(
      tokenAddress,
      this.auth.getSubaccount(),
      amountToWithdraw
    );
    const receipt = (await tx.wait()) as ethers.ContractTransactionReceipt;
    console.log("Withdrawal successful!");
    return receipt;
  }

  public async getSubAccountSummary(): Promise<SubaccountSummary> {
    await this.parent.ensureInitialized();
    const response = await this.auth.client.get(
      `/v2/subaccount-summary/${this.auth.getSubaccount()}`
    );
    return response.data.data as SubaccountSummary;
  }

  public async placeOrder(request: OrderRequest): Promise<OrderApiResponse> {
    await this.parent.ensureInitialized();
    const response = await this.auth.client.post(`v2/place-order`, {
      symbol: request.symbol,
      subaccount: this.auth.getSubaccount(),
      amount: request.amount,
      price: request.price,
      side: request.side,
      nonce: this.auth.generateNonce(),
      broker_id: BROKER_ID,
      order_type: request.orderType,
      reduce_only: request.reduceOnly,
      time_in_force: request.timeInForce,
      wait_for_reply: request.waitForReply,
    } as OrderApiRequest);
    return response.data.data as OrderApiResponse;
  }

  public async batchPlaceOrder(
    requests: OrderRequest[]
  ): Promise<OrderApiResponse[]> {
    await this.parent.ensureInitialized();
    const response = await this.auth.client.post(
      `v2/batch-place-order`,
      requests.map(
        (request) =>
          ({
            symbol: request.symbol,
            subaccount: this.auth.getSubaccount(),
            amount: request.amount,
            price: request.price,
            side: request.side,
            nonce: this.auth.generateNonce(),
            broker_id: BROKER_ID,
            order_type: request.orderType,
            reduce_only: request.reduceOnly,
            time_in_force: request.timeInForce,
            wait_for_reply: request.waitForReply,
          } as OrderApiRequest)
      )
    );
    return response.data.data as OrderApiResponse[];
  }

  public async cancelOrder(
    request: CancelOrderRequest
  ): Promise<CancelOrderApiResponse> {
    await this.parent.ensureInitialized();
    const response = await this.auth.client.post<{
      data: CancelOrderApiResponse;
    }>(`/v2/cancel-order`, {
      symbol: request.symbol,
      subaccount: this.auth.getSubaccount(),
      nonce: this.auth.generateNonce(),
      order_digest: request.orderDigest,
      is_conditional_order: false,
      wait_for_reply: request.waitForReply ?? false,
      client_order_id: request.clientOrderId,
    } as CancelOrderApiRequest);

    return response.data.data;
  }

  public async batchCancelOrder(
    requests: CancelOrderRequest[]
  ): Promise<CancelOrderApiResponse[]> {
    await this.parent.ensureInitialized();
    const cancelRequests = requests.map((request) => this.cancelOrder(request));

    return Promise.all(cancelRequests);
  }

  public async cancelAllOrder(request: CancelAllOrderRequest) {
    await this.parent.ensureInitialized();
    const response = await this.auth.client.post(`/v2/cancel-all-orders`, {
      symbol: request.symbol,
      subaccount: this.auth.getSubaccount(),
      nonce: this.auth.generateNonce(),
      wait_for_reply: request.waitForReply ?? false,
    } as CancelAllOrderApiRequest);
  }
}
