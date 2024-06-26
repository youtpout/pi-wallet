"use client";

import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { Signature, SigningKey, Wallet, ethers, getBytes, parseEther, toBeArray, zeroPadBytes } from "ethers";
import { AccountContext } from "./Body";
import circuit from '../../../packages/foundry/noir/target/circuits.json';
import { blake3 } from '@noble/hashes/blake3';
import { sha256 } from '@noble/hashes/sha256';
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { amountToBytes, bigintToArray, bigintToBytes32, getBytesSign, numberToArray, numberToBytes32, pubKeyFromWallet } from "~~/utils/converter";
import { WalletManager__factory } from "~~/typechain";
import { toHex, zeroAddress } from "viem";
import { MerkleTree } from 'merkletreejs';
import { Exception } from "sass";
import { bytesToBigInt } from "viem";
import { generateProofInput } from "~~/utils/prove";

export const Deposit = ({ eventList }) => {
    const [input, setInput] = useState({ amount: 0.01, server: true });
    const [depositing, setDepositing] = useState<boolean>(false);
    const [noir, setNoir] = useState<Noir | null>(null);
    const [backend, setBackend] = useState<BarretenbergBackend | null>(null);
    const [relayer, setRelayer] = useState({ relayer: "", feeEther: "", feeDai: "" });

    const [message, setMessage] = useState<string>("");

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
            setDepositing(true);
            setMessage("Generate Proof");
            const amountWei = parseEther(input.amount.toString());

            const contractAddress = "0xE9e734AB5215BcBff64838878d0cAA2483ED679c";
            const contract = WalletManager__factory.connect(contractAddress, signer);
            const root = await contract.getLastRoot();
            const token = zeroAddress;

            const data = await generateProofInput(account, eventList, amountWei, token, root, contractAddress, true);

            const callData = {
                useRelayer: false,
                data
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
                const proof = "0x" + resultProof.proof.proof;
                console.log("proof", proof);
                console.log("root", root);

                setMessage("Create transaction");
                const tx = await contract.deposit(toHex(data.new_leaf), toHex(data.unique), root, ethers.ZeroAddress, ethers.ZeroHash, proof, { value: amountWei });
                setMessage("Transaction sent");
                console.log("tx", tx.hash);
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
                <span>Amount (ETH)</span>
                <input className='input' name="amount" type={'number'} onChange={handleChange} value={input.amount} />
                {!signer?.address && <p className="text-sm">You need a connected wallet for deposit</p>}
            </div>
            {/* <div className='tab-check'>
                <input name="server" id='server' type={'checkbox'} onChange={handleCheck} checked={input.server} />
                <label htmlFor="server" >Sindri's server proof</label>
            </div> */}
            {depositing ?
                <button className='btn btn-secondary'><span className="loading loading-spinner loading-xs"></span>{message}</button>
                :
                <button className='btn btn-secondary' onClick={depositEth}>Deposit</button>}

        </div>
    );
};
