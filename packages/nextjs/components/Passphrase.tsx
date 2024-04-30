"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { HDNodeWallet, Mnemonic, Wallet, ethers } from "ethers";
import secureLocalStorage from "react-secure-storage";

export const Passphrase = ({ onClose }) => {
    const provider = useEthersProvider();
    const [mnemonic, setMnemonic] = useState<Mnemonic>();
    const [showImport, setShowImport] = useState<boolean>(false);
    const [oldMnemonic, setOldMnemonic] = useState();
    useEffect(() => {
        const mneno = Wallet.createRandom().mnemonic;
        setMnemonic(mneno);
    }, []);


    const save = () => {
        if (showImport) {
            const wallet = Wallet.fromPhrase(oldMnemonic);
            console.log("wallet", wallet);
            secureLocalStorage.setItem("wallet", wallet.privateKey);
        } else {
            const wallet = Wallet.fromPhrase(mnemonic?.phrase);
            console.log("wallet", wallet);
            secureLocalStorage.setItem("wallet", wallet.privateKey);
        }
        document?.getElementById('pass-modal').close();
        // reload page to setaccount
        location.reload();
        onClose();
    }


    const retrieve = (
        <>
            <h3 className="text-center text-xl  font-bold ">Import a wallet</h3>
            <textarea onChange={(e) => setOldMnemonic(e.target.value)} placeholder="copy here" className="bg-base-300 text-lg mnemonic" />

            <div className="flex flex-row justify-between">
                <button className="btn btn-secondary btn-sm px-2 rounded mr-10" onClick={() => setShowImport(false)} > New</button>
                <button className="btn btn-secondary btn-sm px-2 rounded" onClick={save} >Save</button>
            </div>
        </>
    );

    const newMenmonic = (
        <>
            <h3 className="text-center text-xl  font-bold ">Create a wallet</h3>
            <div className="bg-base-300 text-lg mnemonic">{mnemonic?.phrase}</div>

            <div className="flex flex-row justify-between">
                <button className="btn btn-secondary btn-sm px-2 rounded mr-10" onClick={() => setShowImport(true)}>Import</button>
                <button className="btn btn-secondary btn-sm px-2 rounded" onClick={save} >Save</button>
            </div>
        </>
    );

    return (
        <div className="passphrase">
            {showImport ? retrieve : newMenmonic}
        </div>
    );
};
