"use client";

import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { Signature, SigningKey, Wallet, ethers, getBytes, parseEther, toBeArray, zeroPadBytes } from "ethers";
import { AccountContext } from "./Body";
import circuit from '../../../packages/foundry/noir/target/circuits.json';
import { blake3 } from '@noble/hashes/blake3';
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { amountToBytes, bigintToArray, bigintToBytes32, getBytesSign, numberToArray, numberToBytes32, pubKeyFromWallet } from "~~/utils/converter";

export const Deposit = () => {
    const [input, setInput] = useState({ amount: 0.01, server: true });
    const [depositing, setDepositing] = useState<boolean>(false);
    const [noir, setNoir] = useState<Noir | null>(null);
    const [backend, setBackend] = useState<BarretenbergBackend | null>(null);
    const [relayer, setRelayer] = useState({ relayer: "", feeEther: "", feeDai: "" });

    const signer = useEthersSigner();
    const provider = useEthersProvider();
    const account = useContext(AccountContext);

    // Handles input state
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target) setInput({ ...input, [e.target.name]: e.target.value });
    };

    const handleCheck = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target) setInput({ ...input, [e.target.name]: e.target.checked });
    };



    useEffect(() => {
        initNoir();
        getRelayer();
    }, []);

    const initNoir = async () => {
        // @ts-ignore
        const backend = new BarretenbergBackend(circuit, { threads: 64 });
        setBackend(backend);

        // @ts-ignore
        const noir = new Noir(circuit, backend);
        setNoir(noir);
    };

    const getRelayer = async () => {
        const call = await fetch("/api/sindri");
        const result = await call.json();
        console.log("relayer", result);
    }


    const depositEth = async () => {
        try {
            const amountWei = parseEther(input.amount.toString());

            const wallet = new ethers.Wallet(account);
            console.log(wallet);
            const { x: datax, y: datay } = pubKeyFromWallet(wallet);
            const amount = bigintToBytes32(amountWei);
            const amountByte = bigintToArray(amountWei);
            const index = numberToArray(1);
            const token = numberToArray(0);
            const arrayToHash = datax.concat(datay).concat(index).concat(token).concat(Array.from(amountByte));
            const unique_array = datax.concat(datay).concat(index).concat(token);
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
                token: 0,
                // unique need to store stoken, action by token, to retrieve data from wallet
                unique: Array.from(unique),
                // new leaf act as nullifer
                new_leaf: Array.from(new_leaf),
                merkle_root: Array(32).fill(0),
                amount,
                amount_relayer: 0,
                receiver: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
                relayer: 0,
                is_deposit: [1],
                approve: [0],
                // call is a sha256 hash of calldata
                call: Array(32).fill(0)
            };

            const generateProof = await fetch("/api/sindri", {
                body: JSON.stringify(data),
                method: 'POST',
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json",
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const resultProof = await generateProof.json();
            const proof = resultProof.proof;
            console.log("resultProof", resultProof);
        } catch (error) {
            console.error("error proof", error);
        }

    };

    return (
        <div className="tab-content">
            <div className='tab-form'>
                <span>Amount (ETH)</span>
                <input className='input' name="amount" type={'number'} onChange={handleChange} value={input.amount} />
            </div>
            <div className='tab-check'>
                <input name="server" id='server' type={'checkbox'} onChange={handleCheck} checked={input.server} />
                <label htmlFor="server" >Sindri's server proof</label>
            </div>
            <button className='btn' onClick={depositEth}>Deposit</button>
        </div>
    );
};
