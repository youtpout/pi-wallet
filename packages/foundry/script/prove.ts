import { Signature, ethers, Wallet, BaseWallet, SigningKey, Contract, hexlify, getBytes, parseEther } from "ethers";
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { compile, createFileManager } from '@noir-lang/noir_wasm';
import { blake3 } from '@noble/hashes/blake3';
import { join, resolve } from 'path';
import { hexToBytes } from "@noble/hashes/utils";


async function getCircuit() {
  const basePath = resolve('noir');
  const fm = createFileManager(basePath);
  const compiled = await compile(fm, basePath);

  if (!('program' in compiled)) {
    throw new Error('Compilation failed');
  }
  return compiled.program;
}

getCircuit().then(piCircuit => {

  const backend = new BarretenbergBackend(piCircuit, { threads: 32 });
  const noir = new Noir(piCircuit, backend);

  // 0x14791697260E4c9A71f18484C9f997B308e59325 
  const privateKey = "0xef920b1ef122bb042a7f686a5371313a60ea8bcc63f0ed39476466b7c191311b";

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

  // amount of 0.01 eth
  const amountWei = parseEther("0.01");
  const amount = bigintToArray(amountWei);
  const token = numberToArray(0);
  const index = numberToArray(1);
  const arrayToHash = datax.concat(datay).concat(index).concat(token).concat(amount);
  const unique_array = datax.concat(datay).concat(index).concat(token);
  const hash = blake3(Uint8Array.from(arrayToHash));
  const unique_hash = blake3(Uint8Array.from(unique_array));
  const signature = wallet.signingKey.sign(hash);
  const bytes_sign = getBytesSign(signature);
  const new_leaf = blake3(Uint8Array.from(bytes_sign));
  const signature_unique = wallet.signingKey.sign(unique_hash);
  const bytes_sign_unique = getBytesSign(signature_unique);
  const unique = blake3(Uint8Array.from(bytes_sign_unique));
  const root = "0xd49a7502ffcfb0340b1d7885688500ca308161a7f96b62df9d083b71fcc8f2bb";

  const addr = ethers.recoverAddress(hash, signature);

  //console.dir(Array(32).fill(Array(32).fill(0)), { 'maxArrayLength': null });
  //console.dir(Array(2048).fill(0), { 'maxArrayLength': null });

  const input = {
    signature: bytes_sign,
    signature_unique: bytes_sign_unique,
    old_signature: bytes_sign_unique,
    pub_key_x: Array.from(datax),
    pub_key_y: Array.from(datay),
    old_amount: 0,
    // size 16 bigger 
    witnesses: Array(16).fill(Array(32).fill(0)),
    leaf_index: 0,
    action_index: 1,
    token: 0,
    // unique need to store stoken, action by token, to retrieve data from wallet
    unique: Array.from(unique),
    // new leaf act as nullifer
    new_leaf: Array.from(new_leaf),
    merkle_root: Array.from(getBytes(root)),
    amount: bigintToBytes32(amountWei),
    amount_relayer: 0,
    receiver: "0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f",
    relayer: ethers.ZeroAddress,
    is_deposit: [1],
    approve: [0],
    // call is a sha256 hash of calldata
    call: Array(32).fill(0)
  };

  console.dir(JSON.stringify(input), { 'maxArrayLength': null });

  console.log("commitment", toHex(input.new_leaf));
  console.log("nullifier", toHex(input.unique));
  console.log("root", toHex(input.merkle_root));
  console.log("relayer", input.relayer);
  console.log("amountRelayer", input.amount_relayer);
  console.log("amount eth", 0.01);

  async function prove() {
    try {
      console.log('logs', 'Generating proof... ✅');
      console.time("prove");
      const proof = await noir.generateFinalProof(input);
      console.timeEnd("prove");
      console.log('logs', 'Verifying proof... ⌛');
      const verification = await noir.verifyFinalProof(proof);
      if (verification) {
        console.log('logs', 'Proof verified... ✅');
      } else {
        console.log('logs', 'Proof verification failed... 🟥');
      }

    } catch (error) {
      console.error("error proof", error);
    }
    finally {
      process.exit();
    }
  }

  prove().then();

});


function getBytesSign(signature: Signature) {
  return Array.from(ethers.getBytes(signature.r)).concat(Array.from(ethers.getBytes(signature.s)));
}

function numberToBytes32(num: number) {
  return bigintToBytes32(BigInt(num));
}

function bigintToBytes32(num: bigint) {
  const hexNumber = num.toString(16);
  const prefix = hexNumber.length % 2 === 0 ? "0x" : "0x0";
  return ethers.zeroPadValue(prefix + hexNumber, 32);
}

function numberToArray(num: number) {
  return bigintToArray(BigInt(num));
}

function bigintToArray(num: bigint) {
  let res = bigintToBytes32(num);
  return Array.from(getBytes(hexlify(res)));
}

function toHex(buffer: any) {
  return Array.prototype.map.call(buffer, x => ('00' + x.toString(16)).slice(-2)).join('');
}