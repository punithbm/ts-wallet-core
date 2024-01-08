import { TW } from "@trustwallet/wallet-core";

export type TTranx = {
  chainId: string;
  chainIdHex?: string;
  amount: number;
  amountHex?: string;
  amountValue?: number;
  gasLimit: number;
  gasLimitHex?: string;
  gasPrice: number;
  gasPriceValue?: number;
  gasPriceHex?: string;
  contractAddress: string;
  contractDecimals: number;
  nonce: number;
  nonceHex?: string;
  toAddress: string;
  fromAddress: string;
  symbol?: string;
  blockchain?: string;
  isNative?: boolean;
  data?: string;
  denom?: string;
  blockHash?: string;
  value?: string;
  splTokenRegistered?: boolean;
  valueHex?: string;
  memo?: string;
  chainName?: string;
  accountNumber?: number;
  sequence?: number;
  dataList?: Array<string>;
  v?: "0x01";
  r?: "0x00";
  s?: "0x00";
  path?: string;
  hardwareType?: string;
  txBuff?: Buffer;
};

export enum TRANSACTION_TYPE {
  SEND = "SEND",
  SWAP = "SWAP",
  APPROVAL = "APPROVAL",
  BRIDGE = "BRIDGE",
}

export interface ISigningInput {
    /** SigningInput chainId */
    chainId?: Uint8Array | null;

    /** SigningInput nonce */
    nonce?: Uint8Array | null;

    /** SigningInput gasPrice */
    gasPrice?: Uint8Array | null;

    /** SigningInput gasLimit */
    gasLimit?: Uint8Array | null;

    /** SigningInput maxInclusionFeePerGas */
    maxInclusionFeePerGas?: Uint8Array | null;

    /** SigningInput maxFeePerGas */
    maxFeePerGas?: Uint8Array | null;

    /** SigningInput toAddress */
    toAddress?: string | null;

    /** SigningInput privateKey */
    privateKey?: Uint8Array | null;

    /** SigningInput transaction */
    transaction?: TW.Ethereum.Proto.ITransaction | null;
}
