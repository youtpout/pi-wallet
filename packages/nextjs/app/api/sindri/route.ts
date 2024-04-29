import { ethers, parseEther } from "ethers";
import sindri from 'sindri';

const feeEther = parseEther("0.01");
// dai get 18 decimals too
const feeDai = parseEther("1");

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
    return Response.json(response);
}