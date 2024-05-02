"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useContext, useState } from "react";
import { AccountContext } from "~~/components/Body";
import { Deposit } from "~~/components/Deposit";
import "./page.scss";
import { AccountInfo } from "~~/components/AccountInfo";
import { Transfer } from "~~/components/Transfer";
import { DepositLink } from "~~/components/DepositLink";
import { TransferLink } from "~~/components/TransferLink";
import { Bridge } from "~~/components/Bridge";
import { scrollSepolia } from '@wagmi/core/chains';
import { useChainId, useSwitchChain } from 'wagmi';

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [tabName, setTabName] = useState("deposit");
  const [eventList, setEvenList] = useState();
  const [eventListLink, setEvenListLink] = useState();

  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();

  return (
    <>
      <div className="flex flex-col flex-grow p-10">
        <AccountInfo setEvenList={setEvenList} setEvenListLink={setEvenListLink}></AccountInfo>
        {chainId != scrollSepolia.id && <div className="flex flex-row justify-start mt-5">
          <button className="btn btn-primary" onClick={() => switchChain({ chainId: scrollSepolia.id })}>Switch to Scroll Sepolia to deposit</button>
        </div>}
        <div className="flex items-center justify-center  pt-10">
          <div className='tab-block'>
            <div className='tab-header'>
              <span className={tabName === 'deposit' ? 'active' : ''} onClick={() => setTabName('deposit')}>Deposit</span>
              <span className={tabName === 'depositLink' ? 'active' : ''} onClick={() => setTabName('depositLink')}>Deposit Link</span>
              <span className={tabName === 'transfer' ? 'active' : ''} onClick={() => setTabName('transfer')}>Transfer</span>
              <span className={tabName === 'transferLink' ? 'active' : ''} onClick={() => setTabName('transferLink')}>Transfer Link</span>
              <span className={tabName === 'bridge' ? 'active' : ''} onClick={() => setTabName('bridge')}>Bridge</span>
              {/* <span className={tabName === 'swap' ? 'active' : ''} onClick={() => setTabName('swap')}>Swap</span> */}
            </div>
            <div className='tab-container'>
              {tabName === "deposit" && <Deposit eventList={eventList}></Deposit>}
              {tabName === "transfer" && <Transfer eventList={eventList}></Transfer>}
              {tabName === "depositLink" && <DepositLink eventList={eventListLink}></DepositLink>}
              {tabName === "transferLink" && <TransferLink eventList={eventListLink}></TransferLink>}
              {tabName === "bridge" && <Bridge eventList={eventList}></Bridge>}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Home;
