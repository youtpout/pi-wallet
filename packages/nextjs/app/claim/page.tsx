"use client";

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import client from "~~/utils/apollo";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { sepolia } from '@wagmi/core/chains';
import { useChainId, useSwitchChain } from 'wagmi';
import { formatEther, parseAbi } from "viem";
import { ethers } from "ethers";
import { format } from "path";
import { useEthersSigner } from "~~/utils/useEthers";

const Claim: NextPage = () => {

  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const [claimList, setClaimList] = useState([]);
  const signer = useEthersSigner();

  useEffect(() => {
    getWithdrawals().then();
  }, []);

  const getWithdrawals = async () => {
    const url = "https://sepolia-api-bridge-v2.scroll.io/api/l2/unclaimed/withdrawals?address=0xE9e734AB5215BcBff64838878d0cAA2483ED679c&page=1&page_size=50";
    const result = await fetch(url);
    const jsonData = await result.json();

    console.log(jsonData?.data?.results);
    setClaimList(jsonData?.data?.results || []);
    const decode = decodeMessage(jsonData?.data?.results[0]);
    console.log(decode);
  }

  const decodeMessage = (x: string) => {
    const ABI = parseAbi([
      "function finalizeWithdrawETH(address from,address to,uint256 amount,bytes calldata data) external payable",
    ]);

    const message = x?.claim_info?.message;

    if (message) {
      let iface = new ethers.Interface(ABI);
      const decoded = iface.parseTransaction({ data: message });
      return decoded?.args?.length ? decoded.args[1] : "";
    }
    return "Not claimable yet";
  }

  const claim = async (x: any) => {
    const ABI = parseAbi([
      "struct L2MessageProof {uint256 batchIndex;bytes merkleProof;}",
      "function relayMessageWithProof(address from,address to,uint256 value,uint256 nonce,bytes memory message,L2MessageProof memory proof) external",
    ]);

    // L1 gateway
    const contractAddress = "0x50c7d3e7f7c656493D1D76aaa1a836CedfCBB16A";
    const contract = new ethers.Contract(contractAddress, ABI, signer);
    const data = x.claim_info;
    const tx = await contract.relayMessageWithProof(data.from, data.to, data.value, data.nonce, data.message, {
      batchIndex: data.proof.batch_index,
      merkleProof: data.proof.merkle_proof
    });
    console.log("tx sent", tx);
  };

  const listItems = claimList.map((x) =>
    <div className="flex flex-row mt-5 items-center flex-wrap bg-blue-300 p-2" key={x?.hash}>
      <button className="btn" onClick={() => claim(x)}>Claim </button>
      <span className="ml-5" style={{ width: "100px" }}>{formatEther(x.token_amounts[0])} ETH</span>
      <span className="ml-5">To : {decodeMessage(x)}</span>
    </div>
  );

  return (
    <>
      <div className="flex flex-col flex-grow p-10">
        {chainId != sepolia.id && <div className="flex flex-row justify-start mt-5">
          <button className="btn btn-primary" onClick={() => switchChain({ chainId: sepolia.id })}>Switch to Sepolia to claim</button>
        </div>}
        <div className="text-center mt-8 bg-secondary p-10">
          <h1 className="text-4xl my-0">Claim your token Bridge from L2 to L1.</h1>
          {claimList?.length ? listItems : <p>Nothing to claim</p>}

          <p className="text-neutral">
            If you have claim refresh some second after to reload waiting list         
          </p>
        </div>
      </div>
    </>
  );
};

export default Claim;
