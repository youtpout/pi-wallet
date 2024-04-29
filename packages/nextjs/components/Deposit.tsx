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
import { amountToBytes, bigintToArray, bigintToBytes32, getBytesSign, numberToArray, numberToBytes32, pubKeyFromWallet, toHex } from "~~/utils/converter";
import { WalletManager__factory } from "~~/typechain";
import { MerkleTree } from 'merkletreejs';
import { Exception } from "sass";
import { bytesToBigInt } from "viem";

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

    const getLeaves = async () => {
        const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
        const contract = WalletManager__factory.connect(contractAddress, provider);
        const filter = contract.filters.AddAction();
        const addAction = await contract.queryFilter(filter);
        let result = [];
        if (addAction?.length > 0) {
            for (let i = 0; i < addAction.length; i++) {
                const element = addAction[i];
                result.push(element.args);
            }
        }
        return result;
    };

    function bufferToBigInt(buffer: Buffer, start = 0, end = buffer.length) {
        const bufferAsHexString = buffer.slice(start, end).toString("hex");
        return BigInt(`0x${bufferAsHexString}`);
    }

    const fnConc = (x: Buffer[]) => {
        const hexa = x.map(z => {
            if (z.indexOf('0x') > -1) {
                return z;
            }
            return bufferToBigInt(z);
        })
        return hexa;
    };

    const fnHash = (x: Buffer[]) => {
        console.log("x", x);
        let data = [];
        for (let index = 0; index < x.length; index++) {
            const element = x[index];
            data = data.concat(bigintToArray(element));
        }
        const hash = sha256(Uint8Array.from(data));
        //const res = "0x" + BigInt(hash).toString(16).padStart(64, 0);
        //console.log("res", res);
        return bytesToBigInt(hash);
    };

    const depositEth = async () => {
        try {
            setDepositing(true);
            setMessage("Generate Proof");
            const amountWei = parseEther(input.amount.toString());

            const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
            const contract = WalletManager__factory.connect(contractAddress, signer);

            const wallet = new ethers.Wallet(account);
            const { x: datax, y: datay } = pubKeyFromWallet(wallet);
            const amount = bigintToBytes32(amountWei);
            const amountByte = bigintToArray(amountWei);
            let actionIndex = 1;
            let old_amount = BigInt(0);
            const token = numberToArray(0);
            if (eventList?.length > 0) {
                actionIndex = actionIndex + eventList.length;
                for (let i = 0; i < eventList.length; i++) {
                    const element = eventList[i].args;
                    const proofData = element.proofData;
                    if (element.actionType === BigInt(1)) {
                        // deposit
                        old_amount = old_amount + proofData.amount - proofData.amountRelayer;
                    } else {
                        //withdraw
                        old_amount = old_amount - proofData.amount - proofData.amountRelayer;
                    }
                }
            }

            let newAmount = amountWei + old_amount;

            let index = numberToArray(actionIndex);
            const arrayToHash = datax.concat(datay).concat(index).concat(token).concat(Array.from(bigintToArray(newAmount)));
            const unique_array = datax.concat(datay).concat(index).concat(token);
            const hash = blake3(Uint8Array.from(arrayToHash));
            const unique_hash = blake3(Uint8Array.from(unique_array));
            const signature = wallet.signingKey.sign(hash);
            const bytes_sign = getBytesSign(signature);
            const new_leaf = blake3(Uint8Array.from(bytes_sign));
            const signature_unique = wallet.signingKey.sign(unique_hash);
            const bytes_sign_unique = getBytesSign(signature_unique);
            const unique = blake3(Uint8Array.from(bytes_sign_unique));
            const root = await contract.getLastRoot();

            let witnesses = Array(16).fill(Array(32).fill(0));

            let old_signature = bytes_sign_unique;
            let oldLeaf: any;
            let leafIndex = ethers.ZeroHash;
            if (actionIndex > 1) {
                const oldAmountByte = bigintToArray(old_amount);
                const oldIndex = numberToArray(actionIndex - 1);
                const oldArray = datax.concat(datay).concat(oldIndex).concat(token).concat(Array.from(oldAmountByte));
                const oldHash = blake3(Uint8Array.from(oldArray));
                const oldSignature = wallet.signingKey.sign(oldHash);
                old_signature = getBytesSign(oldSignature);
                oldLeaf = blake3(Uint8Array.from(getBytesSign(oldSignature)));

                let hexOldLeaf = toHex(oldLeaf);

                var leafs = await getLeaves();
                console.log("leafs", leafs);
                var arrayLeafs = Array(65536).fill(ethers.ZeroHash);
                for (let j = 0; j < leafs.length; j++) {
                    const element = leafs[j].proofData;
                    console.log("element", element);
                    arrayLeafs[j] = element.commitment;
                }
                var leafInfo = leafs.find(x => x.commitment.toLowerCase().indexOf(hexOldLeaf.toLowerCase()) > -1);
                if (!leafInfo) {
                    throw Error("No commitment found for this secret/amount pair");
                }
                leafIndex = "0x" + BigInt(leafInfo.leafIndex).toString(16);

                const merkleTree = new MerkleTree(arrayLeafs, sha256, {
                    sort: false,
                    hashLeaves: false,
                    sortPairs: false,
                    sortLeaves: false
                });
                witnesses = merkleTree.getHexProof(hexOldLeaf).map(x => Array.from(getBytes(x)));

                const rootJs = merkleTree.getHexRoot();
                console.log("rootJs", rootJs);
                console.log("root contract", root);
            }


            const data = {
                signature: bytes_sign,
                signature_unique: bytes_sign_unique,
                old_signature: old_signature,
                pub_key_x: Array.from(datax),
                pub_key_y: Array.from(datay),
                old_amount: bigintToBytes32(old_amount),
                // size 16 bigger 
                witnesses: witnesses,
                leaf_index: leafIndex,
                action_index: actionIndex,
                token: 0,
                // unique need to store stoken, action by token, to retrieve data from wallet
                unique: Array.from(unique),
                // new leaf act as nullifer
                new_leaf: Array.from(new_leaf),
                merkle_root: Array.from(getBytes(root)),
                amount,
                amount_relayer: 0,
                receiver: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
                relayer: ethers.ZeroAddress,
                is_deposit: [1],
                approve: [0],
                // call is a sha256 hash of calldata
                call: Array(32).fill(0)
            };

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
                const tx = await contract.deposit(new_leaf, unique, root, ethers.ZeroAddress, BigInt(0), proof, { value: amountWei });
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
