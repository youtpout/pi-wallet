"use client";

import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { JsonRpcProvider, Signature, SigningKey, Wallet, ZeroHash, ethers, getBytes, parseEther, toBeArray, zeroPadBytes } from "ethers";
import { AccountContext } from "./Body";
import circuit from '../../foundry/noir/target/circuits.json';
import { blake3 } from '@noble/hashes/blake3';
import { sha256 } from '@noble/hashes/sha256';
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { amountToBytes, bigintToArray, bigintToBytes32, getBytesSign, numberToArray, numberToBytes32, pubKeyFromWallet } from "~~/utils/converter";
import { WalletManager__factory } from "~~/typechain";
import { toHex, zeroAddress, zeroHash } from "viem";
import { MerkleTree } from 'merkletreejs';
import { Exception } from "sass";
import { bytesToBigInt } from "viem";
import { generateProofInput } from "~~/utils/prove";
import { IWalletManager } from "~~/typechain/WalletManager";

export const TransferLink = ({ eventList }) => {
    const [input, setInput] = useState({ amount: 0.01, server: true, receiver: "" });
    const [depositing, setDepositing] = useState<boolean>(false);
    const [noir, setNoir] = useState<Noir | null>(null);
    const [backend, setBackend] = useState<BarretenbergBackend | null>(null);
    const [relayer, setRelayer] = useState({ relayer: "", feeEther: "", feeDai: "", feeLink: "" });
    const provider = new JsonRpcProvider("https://rpc.ankr.com/scroll_sepolia_testnet");
    const [message, setMessage] = useState<string>("");

    const addressLink = "0x231d45b53C905c3d6201318156BDC725c9c3B9B1";

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
        getRelayer().then(r => setRelayer(r));
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
        return result;
    }



    const transferEth = async () => {
        try {
            setDepositing(true);
            setMessage("Generate Proof");
            const amountWei = parseEther(input.amount.toString());

            const contractAddress = "0xE9e734AB5215BcBff64838878d0cAA2483ED679c";
            const contract = WalletManager__factory.connect(contractAddress, provider);
            const root = await contract.getLastRoot();
            const token = addressLink;
            const call = Array.from(sha256(new Uint8Array(32)));
            const addrRelayer = relayer.relayer;
            console.log("relayer", relayer);
            console.log("addr", addrRelayer);
            const data = await generateProofInput(account, eventList, amountWei, token, root, input.receiver, false, false, call, addrRelayer, BigInt(relayer.feeLink));

            const callData = {
                useRelayer: true,
                data,
                contractData: {
                    amount: toHex(amountWei),
                    call: zeroHash,
                    root: root
                }
            }

            console.log("input", JSON.stringify(data));

            const generateProof = await fetch("/api/sindri", {
                body: JSON.stringify(callData),
                method: 'POST',
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json",
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const resultProof = await generateProof.json();
            if (resultProof?.proof?.proof) {
                setMessage("Transaction sent");
            }
            else {
                throw resultProof;
            }

            //console.log("resultProof", resultProof);
        } catch (error) {
            setMessage("Error check console");
            console.error("error proof", error);
        }
        finally {
            await delay(2000);
            setDepositing(false);
        }

    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    return (
        <div className="tab-content">
            <div className='tab-form'>
                <span>Amount (Link) + 0.1 fee</span>
                <input className='input' name="amount" type={'number'} onChange={handleChange} value={input.amount} />
            </div>
            <div className='tab-form'>
                <span>Receiver</span>
                <input className='input' name="receiver" type={'text'} onChange={handleChange} value={input.receiver} />
            </div>
            {depositing ?
                <button className='btn btn-secondary'><span className="loading loading-spinner loading-xs"></span>{message}</button>
                :
                <button className='btn btn-secondary' onClick={transferEth}>transfer</button>}

        </div>
    );
};
