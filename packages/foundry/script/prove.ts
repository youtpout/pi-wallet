import { Signature, ethers, Wallet, BaseWallet, SigningKey, Contract } from "ethers";
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import circuit from '../noir/target/circuits.json';
import { compile, createFileManager } from '@noir-lang/noir_wasm';
import { blake3 } from '@noble/hashes/blake3';
import { join, resolve } from 'path';


async function getCircuit() {
  const basePath: any = resolve('noir');
  const fm = createFileManager(basePath);
  const compiled = await compile(fm, basePath);

  if (!('program' in compiled)) {
    throw new Error('Compilation failed');
  }
  return compiled.program;
}

const piCircuit: CompiledCircuit = await getCircuit();
const backend = new BarretenbergBackend(piCircuit, { threads: 8 });
const noir = new Noir(piCircuit, backend);

// 0x14791697260E4c9A71f18484C9f997B308e59325 
const privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";

const wallet = new ethers.Wallet(privateKey);

const pubKey_uncompressed = SigningKey.computePublicKey(privateKey);
let pubKey = pubKey_uncompressed.slice(4);

let pub_key_x = pubKey.substring(0, 64);
console.log("public key x coordinate 📊: ", pub_key_x);
let datax = Array.from(ethers.getBytes(ethers.zeroPadValue("0x" + pub_key_x, 32)));
console.log("datax", datax);

let pub_key_y = pubKey.substring(64);
console.log("public key y coordinate 📊: ", pub_key_y);
let datay = Array.from(ethers.getBytes(ethers.zeroPadValue("0x" + pub_key_y, 32)));
console.log("datay", datay);

const amount = Array.from(numToUint8Array(1000));
console.log("amount", amount);
const token = Array.from(numToUint8Array(1));

const index = Array.from(numToUint8Array(1));
console.log("index", index);

const arrayToHash = datax.concat(datay).concat(index).concat(token).concat(amount);
const unique_array = datax.concat(datay).concat(index).concat(token);

console.log("array to hash", arrayToHash);
console.dir(arrayToHash, { 'maxArrayLength': null });
const hash = blake3(Uint8Array.from(arrayToHash));
const unique_hash = blake3(Uint8Array.from(unique_array));
console.log("hash", hash);

const signature = wallet.signingKey.sign(hash);
const bytes_sign = getBytesSign(signature);
const new_leaf = blake3(Uint8Array.from(bytes_sign));
console.log("signature", bytes_sign);

const signature_unique = wallet.signingKey.sign(unique_hash);
const bytes_sign_unique = getBytesSign(signature_unique);
const unique = blake3(Uint8Array.from(bytes_sign_unique));
console.log("signature_unique", bytes_sign_unique);

console.log("new_leaf", Array.from(new_leaf));
console.log("unique", Array.from(unique));

console.log("old_signature", Array(64).fill(0));

const addr = ethers.recoverAddress(hash, signature);
console.log("addr", addr);

//console.dir(Array(32).fill(Array(32).fill(0)), { 'maxArrayLength': null });
//console.dir(Array(2048).fill(0), { 'maxArrayLength': null });

const input = {
  signature: bytes_sign,
  signature_unique: bytes_sign_unique,
  old_signature: bytes_sign_unique,
  pub_key_x: Array.from(datax),
  pub_key_y: Array.from(datay),
  oldAmount: 0,
  witnesses: Array(32).fill(Array(32).fill(0)),
  leafIndex: 0,
  actionIndex: 1,
  token: 1,
  // unique need to store stoken, action by token, to retrieve data from wallet
  unique: Array.from(unique),
  // new leaf act as nullifer
  new_leaf: Array.from(new_leaf),
  merkleRoot: Array(32).fill(0),
  amount: 1000,
  amountRelayer: 0,
  receiver: 15,
  relayer: 0,
  isDeposit: [1],
  // call can't exceed 2048 bytes
  call: Array(32).fill(0)
};

try {
  console.log('logs', 'Generating proof... ✅');
  console.time("prove");
  const proof = await noir.generateProof(input);
  console.timeEnd("prove");
  console.log('results', proof.proof);
  console.log('logs', 'Verifying proof... ⌛');
  const verification = await noir.verifyProof(proof);
  if (verification) {
    console.log('logs', 'Proof verified... ✅');
  } else {
    console.log('logs', 'Proof verification failed... 🟥');
  }
} catch (error) {
  console.error("error proof", error);
}



function numToUint8Array(num) {
  let arr = new Uint8Array(32);

  for (let i = 0; i < 32; i++) {
    arr[i] = num % 256;
    num = Math.floor(num / 256);
  }

  return arr;
}

function getBytesSign(signature: Signature) {
  return Array.from(ethers.getBytes(signature.r)).concat(Array.from(ethers.getBytes(signature.s)));
}
