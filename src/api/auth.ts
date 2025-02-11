import { randomBytes } from "crypto";
import { ethers } from "ethers";
import axios, { AxiosInstance } from "axios";
import { BASE_URLS } from "../types/constants";
import { Network } from "../types";

export class Auth {
  private readonly privateKey: string;
  private readonly wallet: ethers.Wallet;
  private readonly subAccountId: number;
  public client: AxiosInstance;

  constructor(
    network: Network,
    privateKey: string = process.env.PRIVATE_KEY!,
    subAccountId: number
  ) {
    this.privateKey = privateKey;
    this.wallet = new ethers.Wallet(privateKey);
    this.subAccountId = subAccountId;
    this.client = axios.create({
      baseURL: BASE_URLS[network],
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public generateNonce(): string {
    const expiredAt = BigInt(Date.now() + 1000 * 60) * BigInt(1 << 20);
    const random = parseInt(randomBytes(3).toString("hex"), 16) % (1 << 20);
    return (expiredAt + BigInt(random)).toString();
  }

  public async generateJwt() {
    const nonce = this.generateNonce();
    const message = `generate jwt for ${this.wallet.address?.toLowerCase()} and subaccount id ${
      this.subAccountId
    } to trade on happytrading.global with nonce: ${nonce}`;
    const signature = await this.wallet.signMessage(message);

    const response = await this.client.post(`/v2/auth/evm`, {
      account: this.wallet.address,
      subaccount_id: this.subAccountId.toString(),
      nonce,
      signature,
    });

    if (response.status === 200) {
      const jwt = response.data.data.jwt;
      this.client.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    } else {
      throw new Error("Could not generate JWT");
    }
  }
  
  public getSubaccount = (): string => {
    // pad address with subaccountId to be 32 bytes (64 hex characters)
    //  0x + 40 hex characters (address) + 24 hex characters (subaccountId)
    const subaccountIdHex = BigInt(this.subAccountId)
      .toString(16)
      .padStart(24, "0");
    return this.wallet.address.concat(subaccountIdHex);
  };
}
