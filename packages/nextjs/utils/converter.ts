import { BigNumberish, Signature, Wallet, ethers, getUint, parseEther, toBeArray } from "ethers";
import { blake3 } from '@noble/hashes/blake3';

export function ArrayFromNumber(num: number) {
    return Array.from(numToUint8Array(num));
}

export function numToUint8Array(num: number) {
    let arr = new Uint8Array(32);

    for (let i = 0; i < 32; i++) {
        arr[i] = num % 256;
        num = Math.floor(num / 256);
    }

    return arr;
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

