import { Signature, ethers, Wallet, BaseWallet, SigningKey, Contract } from "ethers";
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import circuit from '../noir/target/circuits.json';

const privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";

const wallet = new ethers.Wallet(privateKey);

const prover = circuit as unknown as CompiledCircuit;
const backend = new BarretenbergBackend(prover);
const noir = new Noir(prover, backend);


const input = {
  signature: Array(64).fill(0),
  signature_unique: Array(64).fill(0),
  old_signature: Array(64).fill(0),
  pub_key_x: Array(32).fill(0),
  pub_key_y: Array(32).fill(0),
  oldAmount: 5,
  witnesses: Array(32).fill(Array(32).fill(0)),
  leafIndex: 7,
  actionIndex: 8,
  token: 9,
  // unique need to store stoken, action by token, to retrieve data from wallet
  unique: Array(32).fill(0),
  // new leaf act as nullifer
  new_leaf: Array(32).fill(0),
  merkleRoot: Array(32).fill(0),
  amount: 13,
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