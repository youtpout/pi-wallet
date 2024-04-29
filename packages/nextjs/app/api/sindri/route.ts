import { JsonRpcProvider, JsonRpcSigner, ethers, parseEther } from "ethers";
import sindri from 'sindri';
import { toHex, zeroAddress, zeroHash } from "viem";
import { WalletManager__factory } from "~~/typechain";
import { IWalletManager } from "~~/typechain/WalletManager";

const feeEther = parseEther("0.003");
// dai get 18 decimals too
const feeDai = parseEther("5");

export async function GET(
    req: Request
) {
    const relayerKey = process.env.RELAYER_PRIVATE_KEY!;
    const wallet = new ethers.Wallet(relayerKey);

    return Response.json({ relayer: wallet.address, feeEther: feeEther.toString(), feeDai: feeDai.toString() });
}

export async function POST(
    req: Request
) {
    // Create an instance of the `SindriClient` class.
    const client = sindri;
    const json = await req.json();
    client.authorize({ apiKey: process.env.SINDRI_API_KEY });
    console.log("useRelayer", json.useRelayer);
    const response = await client.proveCircuit("e1e6361a-dc7a-4c6d-8ebb-ca2c5027d6df", json.data, true);
    const proof = response?.proof?.proof;
    if (json.useRelayer && proof) {
        const contractAddress = "0xE9e734AB5215BcBff64838878d0cAA2483ED679c";
        const provider = new JsonRpcProvider("https://rpc.ankr.com/scroll_sepolia_testnet");
        const relayerKey = process.env.RELAYER_PRIVATE_KEY!;
        const signer = new ethers.Wallet(relayerKey, provider);
        const contract = WalletManager__factory.connect(contractAddress, signer);

        const contractData = json.contractData;
        const data = json.data;
        const proofStruct: IWalletManager.ProofDataStruct = {
            amount: contractData.amount,
            amountRelayer: feeEther,
            approve: false,
            call: contractData.call,
            commitment: toHex(data.new_leaf),
            nullifier: toHex(data.unique),
            root: data.root,
            relayer: signer.address,
            proof: proof,
            receiver: data.receiver,
            token: zeroAddress
        };
        console.log("proofstruct", proofStruct);
        const tx = await contract.transfer(proofStruct);
        console.log("tx hash", tx.hash);

    }
    return Response.json(response);
}