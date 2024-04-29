import { ethers, parseEther } from "ethers";
import { NextApiRequest } from "next";
import { SindriClient } from 'sindri';

const feeEther = parseEther("0.01");
// dai get 18 decimals too
const feeDai = parseEther("1");

export function GET(
    req: NextApiRequest,
) {
    const relayerKey = process.env.RELAYER_PRIVATE_KEY!;
    const wallet = new ethers.Wallet(relayerKey);

    return Response.json({ relayer: wallet.address, feeEther: feeEther.toString(), feeDai: feeDai.toString() });
}

export async function POST(
    req: NextApiRequest,
) {
    // Create an instance of the `SindriClient` class.
    const client = new SindriClient({ apiKey: process.env.SINDRI_API_KEY });
    const response = await client.proveCircuit("e1e6361a-dc7a-4c6d-8ebb-ca2c5027d6df", req.body, true);
    return Response.json(response);
}