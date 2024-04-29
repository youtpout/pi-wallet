import { BigNumberish, Signature, Wallet, ethers, getBytes, getUint, hexlify, parseEther, toBeArray } from "ethers";
import { blake3 } from '@noble/hashes/blake3';

export function numberToBytes32(num: number) {
    return bigintToBytes32(BigInt(num));
}

export function bigintToBytes32(num: BigInt) {
    const hexNumber = num.toString(16);
    const prefix = hexNumber.length % 2 === 0 ? "0x" : "0x0";
    return ethers.zeroPadValue(prefix + hexNumber, 32);
}

export function numberToArray(num: number) {
    return bigintToArray(BigInt(num));
}

export function bigintToArray(num: BigInt) {
    let res = bigintToBytes32(num);
    return Array.from(getBytes(hexlify(res)));
}

export function toHex(buffer: any) {
    return Array.prototype.map.call(buffer, x => ('00' + x.toString(16)).slice(-2)).join('');
}


export function hashSignature(signature: Signature) {
    return blake3(Uint8Array.from(getBytesSign(signature)))
}

export function getBytesSign(signature: Signature) {
    return Array.from(ethers.getBytes(signature.r)).concat(Array.from(ethers.getBytes(signature.s)));
}

export function pubKeyFromWallet(wallet: Wallet) {
    const pubKey_uncompressed = wallet.signingKey.publicKey;
    let pubKey = pubKey_uncompressed.slice(4);
    let pub_key_x = pubKey.substring(0, 64);
    let datax = Array.from(ethers.getBytes(ethers.zeroPadValue("0x" + pub_key_x, 32)));
    let pub_key_y = pubKey.substring(64);
    let datay = Array.from(ethers.getBytes(ethers.zeroPadValue("0x" + pub_key_y, 32)));
    return { x: datax, y: datay };
}

export function amountToBytes(amount: string) {
    const amountWei = parseEther(amount);
    const array = Array.from(toBeArray(amountWei));
    const dif = 32 - array.length;
    const result = array.concat(Array(dif).fill(0));
    return result;
}

