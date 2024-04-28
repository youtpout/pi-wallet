"use client";

import React, { useCallback, useContext, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { Wallet, ethers } from "ethers";
import { AccountContext } from "./Body";

export const Deposit = () => {
    const signer = useEthersSigner();
    const provider = useEthersProvider();
    const account = useContext(AccountContext);
    const accountSigner = new Wallet(account, provider);

    const depositEth = () => {


    };

    return (
        <div>
        </div>
    );
};
