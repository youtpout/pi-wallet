"use client";

import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { JsonRpcProvider, Signature, SigningKey, Wallet, ethers, formatEther, getBytes, parseEther, toBeArray, zeroPadBytes } from "ethers";
import { AccountContext } from "./Body";
import circuit from '../../foundry/noir/target/circuits.json';
import { blake3 } from '@noble/hashes/blake3';
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { amountToBytes, bigintToArray, bigintToBytes32, getBytesSign, numberToArray, numberToBytes32, pubKeyFromWallet, toHex } from "~~/utils/converter";
import { WalletManager__factory } from "~~/typechain";
import { gql } from "@apollo/client";
import client from "~~/utils/apollo";

export const AccountInfo = ({ setEvenList, setEvenListLink }) => {
    const [input, setInput] = useState({ amount: 0.01, server: true });
    const [amountEth, setAmountEth] = useState("0");
    const [amountLink, setAmountLink] = useState("0");
    const [address, setAddress] = useState("");
    const [nbEvent, setNbEvent] = useState(0);
    const signer = useEthersSigner();
    const provider = new JsonRpcProvider("https://rpc.ankr.com/scroll_sepolia_testnet");
    const account = useContext(AccountContext);

    useEffect(() => {
        getAmount().then();
        getAmountLink().then();
    }, [account, nbEvent]);

    useEffect(() => {
        listenEvent().then();
    }, [account]);

    const listenEvent = async () => {
        try {
            const contractAddress = "0xE9e734AB5215BcBff64838878d0cAA2483ED679c";
            const contract = WalletManager__factory.connect(contractAddress, provider);

            contract.on(contract.getEvent("AddAction"), () => {
                let nb = nbEvent + 1;
                console.log("new event");
                setNbEvent(nb);
            });
        } catch (error) {
            console.log(error);
        }
    };

    const getAmount = async () => {
        try {
            if (account) {

                const wallet = new ethers.Wallet(account);
                setAddress(wallet.address);
                const { x: datax, y: datay } = pubKeyFromWallet(wallet);
                const token = numberToArray(0);
                let amount = BigInt(0);
                const eventList = [];

                // dumb search for the hackathon
                const { data } = await client.query({
                    query: gql`
                                        query MyQuery {
                                            transferETHs(first: 500, orderBy: leafIndex) {
                                            id
                                            leafIndex
                                            amountRelayer
                                            amount
                                            actionType
                                            }
                                        }
                                    `, fetchPolicy: "no-cache"
                });

                const transfers = data?.transferETHs;
                console.log("get transfer", data?.transferETHs);

                if (transfers?.length > 0) {
                    // we search only for the last 50 action for the moment 
                    for (let index = 0; index < 50; index++) {
                        const num = index + 1;
                        const actionIndex = numberToArray(num);

                        const unique_array = datax.concat(datay).concat(actionIndex).concat(token);
                        const unique_hash = blake3(Uint8Array.from(unique_array));
                        const signature_unique = wallet.signingKey.sign(unique_hash);
                        const bytes_sign_unique = getBytesSign(signature_unique);
                        const unique = blake3(Uint8Array.from(bytes_sign_unique));
                        const hexUnique = "0x" + toHex(unique).toLowerCase();
                        const addAction = transfers.find(x => x.id.toLowerCase() === hexUnique);
                        if (!addAction) {
                            console.log("break", index);
                            break;
                        } else {
                            eventList.push(addAction);
                            if (addAction.actionType === 1) {
                                // deposit
                                amount = amount + BigInt(addAction.amount) - BigInt(addAction.amountRelayer);
                            } else {
                                // withdraw
                                amount = amount - BigInt(addAction.amount) - BigInt(addAction.amountRelayer);
                            }
                            console.log("action", addAction);
                        }
                    }

                }

                setAmountEth(formatEther(amount));
                setEvenList(eventList);
            }

        } catch (error) {
            console.error("error get amount", error);
        }

    };

    const getAmountLink = async () => {
        try {
            if (account) {

                const wallet = new ethers.Wallet(account);
                setAddress(wallet.address);
                const { x: datax, y: datay } = pubKeyFromWallet(wallet);
                const token = BigInt("0x231d45b53C905c3d6201318156BDC725c9c3B9B1");
                let amount = BigInt(0);
                const eventList = [];

                // dumb search for the hackathon
                const { data } = await client.query({
                    query: gql`
                                        query MyQuery {
                                            transferLinks(first: 500, orderBy: leafIndex) {
                                            id
                                            leafIndex
                                            amountRelayer
                                            amount
                                            actionType
                                            }
                                        }
                                    `, fetchPolicy: "no-cache"
                });

                const transfers = data?.transferLinks;
                console.log("get transfer link", data?.transferLinks);

                if (transfers?.length > 0) {
                    // we search only for the last 50 action for the moment 
                    for (let index = 0; index < 50; index++) {
                        const num = index + 1;
                        const actionIndex = numberToArray(num);

                        const unique_array = datax.concat(datay).concat(actionIndex).concat(bigintToArray(token));
                        const unique_hash = blake3(Uint8Array.from(unique_array));
                        const signature_unique = wallet.signingKey.sign(unique_hash);
                        const bytes_sign_unique = getBytesSign(signature_unique);
                        const unique = blake3(Uint8Array.from(bytes_sign_unique));
                        const hexUnique = "0x" + toHex(unique).toLowerCase();
                        const addAction = transfers.find(x => x.id.toLowerCase() === hexUnique);
                        if (!addAction) {
                            console.log("break", index);
                            break;
                        } else {
                            eventList.push(addAction);
                            if (addAction.actionType === 1) {
                                // deposit
                                amount = amount + BigInt(addAction.amount) - BigInt(addAction.amountRelayer);
                            } else {
                                // withdraw
                                amount = amount - BigInt(addAction.amount) - BigInt(addAction.amountRelayer);
                            }
                            console.log("action", addAction);
                        }
                    }

                }

                setAmountLink(formatEther(amount));
                setEvenListLink(eventList);
            }

        } catch (error) {
            console.error("error get amount", error);
        }

    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    return (
        <div className="flex flex-col">
            <div>
                <span className="text-sm">Private address : {address}</span>
            </div>
            <div className="flex flex-row items-center justify-start">
                <img src="/eth.png" height={"16px"} width={"16px"}></img><span className="text-lg ml-5">{amountEth} <span className="text-sm font-bold ml-1">ETH</span></span>
            </div>
            <div className="flex flex-row items-center justify-start mt-3">
                <img src="/chainlink.png" height={"20px"} width={"20px"}></img><span className="text-lg ml-4">{amountLink} <span className="text-sm font-bold ml-1">LINK</span></span>
            </div>

        </div>
    );
};
