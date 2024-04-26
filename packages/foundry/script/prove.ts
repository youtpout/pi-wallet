import { Signature, ethers, Wallet, BaseWallet, SigningKey, Contract } from "ethers";
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import circuit from '../noir/target/circuits.json';
import { blake3 } from '@noble/hashes/blake3';

const privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";

const wallet = new ethers.Wallet(privateKey);

const pubKey_uncompressed = SigningKey.computePublicKey(privateKey);
let pubKey = pubKey_uncompressed.slice(4);

let pub_key_x = pubKey.substring(0, 64);
console.log("public key x coordinate 📊: ", pub_key_x);
let datax = Array.from(ethers.getBytes(ethers.zeroPadValue("0x" + pub_key_x, 32)));
let pub_key_y = pubKey.substring(64);
console.log("public key y coordinate 📊: ", pub_key_y);
let datay = Array.from(ethers.getBytes(ethers.zeroPadValue("0x" + pub_key_y, 32)));


const prover = circuit as unknown as CompiledCircuit;
const backend = new BarretenbergBackend(prover);
const noir = new Noir(prover, backend);

const amount = Array.from(numToUint8Array(1000));
const token = Array.from(numToUint8Array(1));


const arrayToHash = datax.concat(datay).concat(token).concat(amount);

console.log("array to hash", arrayToHash);
const hash = blake3(Uint8Array.from(arrayToHash));
console.log("hash", hash);

const input = {
  signature: Array(64).fill(0),
  signature_unique: Array(64).fill(0),
  old_signature: Array(64).fill(0),
  pub_key_x: Array.from(datax),
  pub_key_y: Array.from(datay),
  oldAmount: 0,
  witnesses: Array(32).fill(Array(32).fill(0)),
  leafIndex: 7,
  actionIndex: 1,
  token: 1,
  // unique need to store stoken, action by token, to retrieve data from wallet
  unique: Array(32).fill(0),
  // new leaf act as nullifer
  new_leaf: Array(32).fill(0),
  merkleRoot: Array(32).fill(0),
  amount: 1000,
  amountRelayer: 14,
  receiver: 15,
  relayer: 16,
  isDeposit: [1],
  // call can't exceed 2048 bytes
  call: Array(2048).fill(0)
};


console.log('logs', 'Generating proof... ⌛');
const proof = await noir.generateProof(input);
console.log('logs', 'Generating proof... ✅');
console.log('results', proof.proof);
console.log('logs', 'Verifying proof... ⌛');
const verification = await noir.verifyProof(proof);
if (verification) console.log('logs', 'Verifying proof... ✅');

function numToUint8Array(num) {
  let arr = new Uint8Array(8);

  for (let i = 0; i < 8; i++) {
    arr[i] = num % 256;
    num = Math.floor(num / 256);
  }

  return arr;
}
