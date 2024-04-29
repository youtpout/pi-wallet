
import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { Signature, SigningKey, Wallet, ethers, getBytes, parseEther, toBeArray, zeroPadBytes } from "ethers";
import circuit from '../../../packages/foundry/noir/target/circuits.json';
import { blake3 } from '@noble/hashes/blake3';
import { amountToBytes, bigintToArray, bigintToBytes32, getBytesSign, numberToArray, numberToBytes32, pubKeyFromWallet } from "~~/utils/converter";
import { AccountContext } from "~~/components/Body";
import { Noir } from '@noir-lang/noir_js';
import { ProofData } from '@noir-lang/types';

export async function prove(noir: Noir, amount: BigInt, token: BigInt, receiver: string, isDeposit: boolean, approve: boolean = false, call: any = Array(32).fill(0)): Promise<ProofData> {
    try {
        const account = useContext(AccountContext);
        const wallet = new ethers.Wallet(account);
        const { x: datax, y: datay } = pubKeyFromWallet(wallet);
        const amountIn = bigintToBytes32(amount);
        const amountByte = bigintToArray(amount);
        const tokenIn = bigintToBytes32(token);
        const tokenByte = bigintToArray(token);
        const index = numberToArray(1);
        const arrayToHash = datax.concat(datay).concat(index).concat(tokenByte).concat(Array.from(amountByte));
        const unique_array = datax.concat(datay).concat(index).concat(tokenByte);
        const hash = blake3(Uint8Array.from(arrayToHash));
        const unique_hash = blake3(Uint8Array.from(unique_array));
        const signature = wallet.signingKey.sign(hash);
        const bytes_sign = getBytesSign(signature);
        const new_leaf = blake3(Uint8Array.from(bytes_sign));
        const signature_unique = wallet.signingKey.sign(unique_hash);
        const bytes_sign_unique = getBytesSign(signature_unique);
        const unique = blake3(Uint8Array.from(bytes_sign_unique));

        const data = {
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
            token: tokenIn,
            // unique need to store stoken, action by token, to retrieve data from wallet
            unique: Array.from(unique),
            // new leaf act as nullifer
            new_leaf: Array.from(new_leaf),
            merkle_root: Array(32).fill(0),
            amount: amountIn,
            amount_relayer: 0,
            receiver,
            relayer: 0,
            is_deposit: isDeposit ? [1] : [0],
            approve: approve ? [1] : [0],
            // call is a sha256 hash of calldata
            call: call
        };


        console.log('logs', 'Generating proof... ✅');
        console.time("prove");
        console.log(data);
        const proof = await noir?.generateFinalProof(data);
        console.timeEnd("prove");
        console.log('logs', 'Verifying proof... ⌛');
        const verification = await noir?.verifyFinalProof(proof!);
        if (verification) {
            console.log('logs', 'Proof verified... ✅');
        } else {
            console.log('logs', 'Proof verification failed... 🟥');
        }
        return proof;
    } catch (error) {
        console.error("error proof", error);
        throw error;
    }
} 