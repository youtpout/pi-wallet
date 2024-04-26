import { Signature, ethers, Wallet, BaseWallet, SigningKey, Contract } from "ethers";
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import circuit from '../noir/target/circuits.json';


const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

const backend = new BarretenbergBackend(circuit);
const noir = new Noir(circuit, backend);

const input = { x: 1, y: 2 };


console.log('logs', 'Generating proof... ⌛');
const proof = await noir.generateProof(input);
console.log('logs', 'Generating proof... ✅');
console.log('results', proof.proof);
console.log('logs', 'Verifying proof... ⌛');
const verification = await noir.verifyProof(proof);
if (verification) console.log('logs', 'Verifying proof... ✅');