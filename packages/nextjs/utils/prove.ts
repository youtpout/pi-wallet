
import { JsonRpcProvider, ethers, getBytes, zeroPadValue } from "ethers";
import { blake3 } from '@noble/hashes/blake3';
import { bigintToArray, bigintToBytes32, getBytesSign, numberToArray, numberToBytes32, pubKeyFromWallet, toHex } from "~~/utils/converter";
import { WalletManager__factory } from "~~/typechain";
import MerkleTree from "merkletreejs";
import { sha256 } from "@noble/hashes/sha256";
import { gql } from "@apollo/client";
import client from "~~/utils/apollo";

export async function generateProofInput(account: any, eventList: [], amountWei: BigInt, token: string,
    root: string, receiver: string, isDeposit: boolean,
    approve: boolean = false, call: any = Array(32).fill(0), relayer = ethers.ZeroAddress, amountRelayer = BigInt(0)): Promise<any> {

    const wallet = new ethers.Wallet(account);
    const { x: datax, y: datay } = pubKeyFromWallet(wallet);
    const amount = bigintToBytes32(amountWei);
    let actionIndex = 1;
    let old_amount = BigInt(0);
    const tokenArr = Array.from(getBytes(zeroPadValue(token, 32)));
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

    let newAmount = isDeposit ? amountWei + old_amount - amountRelayer : old_amount - amountWei - amountRelayer;
    const amountByte = bigintToArray(newAmount);
    let index = numberToArray(actionIndex);
    const arrayToHash = datax.concat(datay).concat(index).concat(tokenArr).concat(Array.from(amountByte));
    const unique_array = datax.concat(datay).concat(index).concat(tokenArr);
    const hash = blake3(Uint8Array.from(arrayToHash));
    const unique_hash = blake3(Uint8Array.from(unique_array));
    const signature = wallet.signingKey.sign(hash);
    const bytes_sign = getBytesSign(signature);
    const new_leaf = blake3(Uint8Array.from(bytes_sign));
    const signature_unique = wallet.signingKey.sign(unique_hash);
    const bytes_sign_unique = getBytesSign(signature_unique);
    const unique = blake3(Uint8Array.from(bytes_sign_unique));

    let witnesses = Array(16).fill(Array(32).fill(0));

    let old_signature = bytes_sign_unique;
    let oldLeaf: any;
    let leafIndex = ethers.ZeroHash;
    if (actionIndex > 1) {
        const oldAmountByte = bigintToArray(old_amount);
        const oldIndex = numberToArray(actionIndex - 1);
        const oldArray = datax.concat(datay).concat(oldIndex).concat(tokenArr).concat(Array.from(oldAmountByte));
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
        token: token,
        // unique need to store stoken, action by token, to retrieve data from wallet
        unique: Array.from(unique),
        // new leaf act as nullifer
        new_leaf: Array.from(new_leaf),
        merkle_root: Array.from(getBytes(root)),
        amount,
        amount_relayer: bigintToBytes32(amountRelayer),
        receiver: receiver,
        relayer: relayer,
        is_deposit: isDeposit ? [1] : [0],
        approve: approve ? [1] : [0],
        // call is a sha256 hash of calldata
        call: call
    };

    return data;
}


export async function getLeaves(provider: any) {
    const { data } = await client.query({
        query: gql`
          query MyQuery {
            addActions(first: 500, orderBy: leafIndex) {
                commitment
                leafIndex
            }
          }
        `, fetchPolicy: "no-cache"
    });

    console.log("getLeaves", data?.addActions);
    let result = [];
    if (data?.addActions?.length > 0) {
        for (let i = 0; i < data.addActions.length; i++) {
            const element = data.addActions[i];
            result.push(element.args);
        }
    }
    return result;
};