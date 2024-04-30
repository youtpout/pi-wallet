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

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [tabName, setTabName] = useState("deposit");
  const [eventList, setEvenList] = useState();
  const [eventListLink, setEvenListLink] = useState();

  return (
    <>
      <div className="flex flex-col flex-grow p-10">
        <AccountInfo setEvenList={setEvenList} setEvenListLink={setEvenListLink}></AccountInfo>
        <div className="flex items-center justify-center  pt-10">
          <div className='tab-block'>
            <div className='tab-header'>
              <span className={tabName === 'deposit' ? 'active' : ''} onClick={() => setTabName('deposit')}>Deposit</span>
              <span className={tabName === 'depositLink' ? 'active' : ''} onClick={() => setTabName('depositLink')}>Deposit Link</span>
              <span className={tabName === 'transfer' ? 'active' : ''} onClick={() => setTabName('transfer')}>Transfer</span>
              {/* <span className={tabName === 'swap' ? 'active' : ''} onClick={() => setTabName('swap')}>Swap</span> */}
            </div>
            <div className='tab-container'>
              {tabName === "deposit" && <Deposit eventList={eventList}></Deposit>}
              {tabName === "transfer" && <Transfer eventList={eventList}></Transfer>}
              {tabName === "depositLink" && <DepositLink eventList={eventListLink}></DepositLink>}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Home;
