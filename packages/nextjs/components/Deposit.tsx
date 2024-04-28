"use client";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { Signature, SigningKey, Wallet, ethers } from "ethers";
import { AccountContext } from "./Body";
import circuit from '../../../packages/foundry/noir/target/circuits.json';
import { blake3 } from '@noble/hashes/blake3';
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

export const Deposit = () => {
    const [noir, setNoir] = useState<Noir | null>(null);
    const [backend, setBackend] = useState<BarretenbergBackend | null>(null);

    const signer = useEthersSigner();
    const provider = useEthersProvider();
    const account = useContext(AccountContext);


    useEffect(() => {
        initNoir();
    }, []);

    const initNoir = async () => {
        // @ts-ignore
        const backend = new BarretenbergBackend(circuit, { threads: 8 });
        setBackend(backend);

        // @ts-ignore
        const noir = new Noir(circuit, backend);
        setNoir(noir);
    };


    const depositEth = async () => {
        const wallet = new ethers.Wallet(account);
        const pubKey_uncompressed = SigningKey.computePublicKey(account);
        let pubKey = pubKey_uncompressed.slice(4);
        let pub_key_x = pubKey.substring(0, 64);
        let datax = Array.from(ethers.getBytes(ethers.zeroPadValue("0x" + pub_key_x, 32)));
        let pub_key_y = pubKey.substring(64);
        let datay = Array.from(ethers.getBytes(ethers.zeroPadValue("0x" + pub_key_y, 32)));
        const amount = Array.from(numToUint8Array(1000));
        const token = Array.from(numToUint8Array(1));
        const index = Array.from(numToUint8Array(1));
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
        const addr = ethers.recoverAddress(hash, signature);

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
            token: 1,
            // unique need to store stoken, action by token, to retrieve data from wallet
            unique: Array.from(unique),
            // new leaf act as nullifer
            new_leaf: Array.from(new_leaf),
            merkle_root: Array(32).fill(0),
            amount: 1000,
            amount_relayer: 0,
            receiver: 15,
            relayer: 0,
            is_deposit: [1],
            approve: [0],
            // call is a sha256 hash of calldata
            call: Array(32).fill(0)
        };

        try {
            console.log('logs', 'Generating proof... ✅');
            console.time("prove");
            const proof = await noir?.generateProof(input);
            console.timeEnd("prove");
            console.log('logs', 'Verifying proof... ⌛');
            const verification = await noir?.verifyProof(proof!);
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



        function numToUint8Array(num: number) {
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

    };

    return (
        <div>
        </div>
    );
};
