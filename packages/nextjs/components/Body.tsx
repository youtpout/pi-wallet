
"use client";

import { createContext, useEffect, useState } from "react";
import { Passphrase } from "./Passphrase";
import secureLocalStorage from "react-secure-storage";

export const AccountContext = createContext("");


const BodyApp = ({ children }: { children: React.ReactNode }) => {
    const [showModal, setShowModal] = useState(true);
    const [account, setAccount] = useState<string>("");
    useEffect(() => {
        let wallet = secureLocalStorage.getItem("wallet");
        if (!wallet) {
            document?.getElementById('pass-modal').showModal();
        } else {
            setAccount(wallet.toString());
            console.log("wallet", wallet);
        }
    }, []);

    const onClose = () => {
        let wallet = secureLocalStorage.getItem("wallet");
        if (!wallet) {
            document?.getElementById('pass-modal').showModal();
        } else {
            setAccount(wallet.toString());
            console.log("wallet", wallet);
        }
    }

    return (

        <AccountContext.Provider value={account}>
            <dialog id="pass-modal" className="modal">
                <Passphrase closeCallback={onClose}></Passphrase>
            </dialog>
            {children}
        </AccountContext.Provider>
    );
};

export default BodyApp;
