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

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [tabName, setTabName] = useState("deposit");

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
      <div className='tab-block'>
          <div className='tab-header'>
            <span className={tabName === 'deposit' ? 'active' : ''} onClick={() => setTabName('deposit')}>Deposit</span>
            {/* <span className={tabName === 'withdraw' ? 'active' : ''} onClick={() => setTabName('withdraw')}>Withdraw</span> */}
            {/* <span className={tabName === 'swap' ? 'active' : ''} onClick={() => setTabName('swap')}>Swap</span> */}
          </div>
          <div className='tab-container'>

            {tabName === "deposit" && <Deposit></Deposit>}
            {/* {tabName === "withdraw" &&
              <Withdraw></Withdraw>} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
