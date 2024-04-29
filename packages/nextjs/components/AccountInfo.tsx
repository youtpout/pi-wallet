"use client";

import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { Signature, SigningKey, Wallet, ethers, formatEther, getBytes, parseEther, toBeArray, zeroPadBytes } from "ethers";
import { AccountContext } from "./Body";
import circuit from '../../foundry/noir/target/circuits.json';
import { blake3 } from '@noble/hashes/blake3';
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { amountToBytes, bigintToArray, bigintToBytes32, getBytesSign, numberToArray, numberToBytes32, pubKeyFromWallet, toHex } from "~~/utils/converter";
import { WalletManager__factory } from "~~/typechain";

export const AccountInfo = ({ setEvenList }) => {
    const [input, setInput] = useState({ amount: 0.01, server: true });
    const [amountEth, setAmountEth] = useState("0");
    const [address, setAddress] = useState("");
    const [nbEvent, setNbEvent] = useState(0);
    const signer = useEthersSigner();
    const provider = useEthersProvider();
    const account = useContext(AccountContext);

    useEffect(() => {
        getAmount().then();
    }, [account, nbEvent]);

    useEffect(() => {
        listenEvent().then();
    }, [account]);

    const listenEvent = async () => {
        try {
            const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
            const contract = WalletManager__factory.connect(contractAddress, provider);

            contract.on(contract.getEvent("AddAction"), () => {
                let nb = nbEvent + 1;
                setNbEvent(nb);
            });
        } catch (error) {
            console.log(error);
        }
    };

    const getAmount = async () => {
        try {
            if (account) {
                const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
                const contract = WalletManager__factory.connect(contractAddress, provider);
                const wallet = new ethers.Wallet(account);
                setAddress(wallet.address);
                const { x: datax, y: datay } = pubKeyFromWallet(wallet);
                const token = numberToArray(0);
                let amount = BigInt(0);
                const eventList = [];
                // we search only for the last 50 action for the moment (implement the graph)
                for (let index = 0; index < 50; index++) {
                    const num = index + 1;
                    const actionIndex = numberToArray(num);

                    const unique_array = datax.concat(datay).concat(actionIndex).concat(token);
                    const unique_hash = blake3(Uint8Array.from(unique_array));
                    const signature_unique = wallet.signingKey.sign(unique_hash);
                    const bytes_sign_unique = getBytesSign(signature_unique);
                    const unique = blake3(Uint8Array.from(bytes_sign_unique));

                    const filter = contract.filters.AddAction(unique);
                    const addAction = await contract.queryFilter(filter);
                    if (!addAction || !addAction.length) {
                        console.log("break", index);
                        break;
                    } else {
                        const data = addAction[0];
                        eventList.push(data);
                        const proofData = data.args.ProofData;
                        if (data.args.actionType === BigInt(1)) {
                            // deposit
                            amount = amount + proofData.amount - proofData.amountRelayer;
                        } else {
                            //withdraw
                            amount = amount - proofData.amount - proofData.amountRelayer;
                        }
                        console.log("action", addAction);
                    }
                }

                setAmountEth(formatEther(amount));
                setEvenList(eventList);
            }

        } catch (error) {
            console.error("error proof", error);
        }

    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    return (
        <div className="flex flex-col">
            <div>
                <span className="text-sm">Private address : {address}</span>
            </div>
            <div className="flex flex-row items-center justify-start">
                <img src="/eth.png" height={"16px"} width={"16px"}></img>   <span className="text-lg ml-5">{amountEth} <span className="text-sm font-bold ml-1">ETH</span></span>
            </div>

        </div>
    );
};
