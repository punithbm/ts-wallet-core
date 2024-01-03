import { TTranx } from './types';
import * as bs58 from 'bs58';
import Long from 'long';
import { TW, WalletCore } from "@trustwallet/wallet-core";

export class Wallet {
  CoinType: WalletCore["CoinType"];
  HexCoding: WalletCore["HexCoding"];
  AnySigner: WalletCore["AnySigner"];
  HDWallet: WalletCore["HDWallet"];
  PublicKey: WalletCore["PublicKey"];
  AnyAddress: WalletCore["AnyAddress"];
  PrivateKey: WalletCore["PrivateKey"];
  Mnemonic: WalletCore["Mnemonic"];
  Curve: WalletCore["Curve"];
  TW: typeof TW;
  SolanaAddress: WalletCore["SolanaAddress"];
  StoredKey: WalletCore["StoredKey"];

  constructor(_walletCore: WalletCore, _tw = TW) {
    const { HDWallet, CoinType, AnySigner, HexCoding, PublicKey, PrivateKey, Mnemonic, Curve, AnyAddress, SolanaAddress, StoredKey } = _walletCore;
    this.CoinType = CoinType;
    this.AnySigner = AnySigner;
    this.HexCoding = HexCoding;
    this.HDWallet = HDWallet;
    this.PublicKey = PublicKey;
    this.PrivateKey = PrivateKey;
    this.Mnemonic = Mnemonic;
    this.Curve = Curve;
    this.TW = _tw;
    this.AnyAddress = AnyAddress;
    this.SolanaAddress = SolanaAddress;
    this.StoredKey = StoredKey;
  }

  importWithPrvKey = async (privatekey: string, chainId = "ethereum", curve = "secp256k1") => {
    const _privateKey = this.trimZeroHex(privatekey);
    const _curve = this.getCurve(curve);
    const coinType = this.getCoinType(chainId);
    let prvKey = this.PrivateKey.create();
    try {
      prvKey = this.PrivateKey.createWithData(this.HexCoding.decode(_privateKey));
    } catch (e) {
      console.log(e);
    }
    let pubKey = prvKey?.getPublicKeyCurve25519();
    switch (_curve) {
      case this.Curve.secp256k1:
        pubKey = prvKey.getPublicKeySecp256k1(false);
        break;
      case this.Curve.ed25519:
        pubKey = prvKey.getPublicKeyEd25519();
        break;
      case this.Curve.ed25519Blake2bNano:
        pubKey = prvKey.getPublicKeyEd25519Blake2b();
        break;
      case this.Curve.curve25519:
        pubKey = prvKey.getPublicKeyCurve25519();
        break;
      case this.Curve.nist256p1:
        pubKey = prvKey.getPublicKeyNist256p1();
        break;
      case this.Curve.ed25519ExtendedCardano:
        pubKey = prvKey.getPublicKeyEd25519Cardano();
        break;
      default:
        break;
    }
    const generatedAddress = this.AnyAddress.createWithPublicKey(pubKey, coinType).description();
    return generatedAddress;
  };

  signNearTx = async (tx: TTranx, prvKey: string) => {
    const keypair = this.PrivateKey.createWithData(this.HexCoding.decode(prvKey));
    const txDataInput = TW.NEAR.Proto.SigningInput.create({
      nonce: Long.fromString(tx.nonce.toString()),
      blockHash: bs58.decodeUnsafe(tx.blockHash ?? ""),
      signerId: tx.fromAddress,
      receiverId: tx.toAddress,
      actions: [
        {
          transfer: TW.NEAR.Proto.Transfer.create({
            deposit: toBufferLE(BigInt(tx.amount * Math.pow(10, tx.contractDecimals)), 16),
          }),
        },
      ],
      privateKey: keypair.data(),
    });
  
    const output = TW.NEAR.Proto.SigningInput.encode(txDataInput).finish();
    const outputData = this.AnySigner.sign(output, this.CoinType.near);
    const NearSigningOutput = TW.NEAR.Proto.SigningOutput.decode(outputData);
    const txHash = Buffer.from(NearSigningOutput.signedTransaction).toString("base64");
    return txHash;
  };

  trimZeroHex = (zeroHex: string) => {
    if (zeroHex.startsWith("0x")) {
      return zeroHex.slice(2, zeroHex.length);
    }
    return zeroHex;
  };

  getCurve = (curve: string) => {
    switch (curve) {
      case "secp256k1":
        return this.Curve.secp256k1;
      case "ed25519Blake2bNano":
        return this.Curve.ed25519Blake2bNano;
      case "curve25519":
        return this.Curve.curve25519;
      case "nist256p1":
        return this.Curve.nist256p1;
      case "ed25519ExtendedCardano":
        return this.Curve.ed25519ExtendedCardano;
      case "ed25519":
        return this.Curve.ed25519;
      default:
        return this.Curve.secp256k1;
    }
  };

  getCoinType = (chainId: string) => {
    const coinType = this.CoinType;
    switch (chainId) {
      case "ethereum":
        return coinType.ethereum;
      case "zkevm":
        return coinType.polygonzkEVM;
      case "zksync":
        return coinType.zksync;
      default:
        return coinType.ethereum;
    }
  };
}

export function toBufferBE(num: bigint, width: number): Buffer {
  const hex = num.toString(16);
  const buf = Buffer.from(hex.padStart(width * 2, '0'), 'hex');
  if (buf.length != width) throw Error('int too big');
  return buf;
}

export function toBufferLE(num: bigint, width: number): Buffer {
  return toBufferBE(num, width).reverse();
}

