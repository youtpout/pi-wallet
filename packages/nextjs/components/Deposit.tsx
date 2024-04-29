"use client";

import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useEthersSigner, useEthersProvider } from '../utils/useEthers';
import { Signature, SigningKey, Wallet, ethers, getBytes, parseEther, toBeArray, zeroPadBytes } from "ethers";
import { AccountContext } from "./Body";
import circuit from '../../../packages/foundry/noir/target/circuits.json';
import { blake3 } from '@noble/hashes/blake3';
import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { amountToBytes, bigintToArray, bigintToBytes32, getBytesSign, numberToArray, numberToBytes32, pubKeyFromWallet, toHex } from "~~/utils/converter";
import { WalletManager__factory } from "~~/typechain";

export const Deposit = () => {
    const [input, setInput] = useState({ amount: 0.01, server: true });
    const [depositing, setDepositing] = useState<boolean>(false);
    const [noir, setNoir] = useState<Noir | null>(null);
    const [backend, setBackend] = useState<BarretenbergBackend | null>(null);
    const [relayer, setRelayer] = useState({ relayer: "", feeEther: "", feeDai: "" });

    const signer = useEthersSigner();
    const provider = useEthersProvider();
    const account = useContext(AccountContext);

    // Handles input state
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target) setInput({ ...input, [e.target.name]: e.target.value });
    };

    const handleCheck = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target) setInput({ ...input, [e.target.name]: e.target.checked });
    };



    useEffect(() => {
        initNoir();
        getRelayer();
    }, []);

    const initNoir = async () => {
        // @ts-ignore
        const backend = new BarretenbergBackend(circuit, { threads: 64 });
        setBackend(backend);

        // @ts-ignore
        const noir = new Noir(circuit, backend);
        setNoir(noir);
    };

    const getRelayer = async () => {
        const call = await fetch("/api/sindri");
        const result = await call.json();
        console.log("relayer", result);
    }


    const depositEth = async () => {
        try {
            const amountWei = parseEther(input.amount.toString());

            const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

            const wallet = new ethers.Wallet(account);
            console.log(wallet);
            const { x: datax, y: datay } = pubKeyFromWallet(wallet);
            const amount = bigintToBytes32(amountWei);
            const amountByte = bigintToArray(amountWei);
            const index = numberToArray(1);
            const token = numberToArray(0);
            const arrayToHash = datax.concat(datay).concat(index).concat(token).concat(Array.from(amountByte));
            const unique_array = datax.concat(datay).concat(index).concat(token);
            const hash = blake3(Uint8Array.from(arrayToHash));
            const unique_hash = blake3(Uint8Array.from(unique_array));
            const signature = wallet.signingKey.sign(hash);
            const bytes_sign = getBytesSign(signature);
            const new_leaf = blake3(Uint8Array.from(bytes_sign));
            const signature_unique = wallet.signingKey.sign(unique_hash);
            const bytes_sign_unique = getBytesSign(signature_unique);
            const unique = blake3(Uint8Array.from(bytes_sign_unique));

            const data = {
                signature: bytes_sign,
                signature_unique: bytes_sign_unique,
                old_signature: bytes_sign_unique,
                pub_key_x: Array.from(datax),
                pub_key_y: Array.from(datay),
                old_amount: 0,
                // size 16 bigger 
                witnesses: Array(16).fill(Array(32).fill(0)),
                leaf_index: 0,
                action_index: 1,
                token: 0,
                // unique need to store stoken, action by token, to retrieve data from wallet
                unique: Array.from(unique),
                // new leaf act as nullifer
                new_leaf: Array.from(new_leaf),
                merkle_root: Array(32).fill(0),
                amount,
                amount_relayer: 0,
                receiver: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
                relayer: ethers.ZeroAddress,
                is_deposit: [1],
                approve: [0],
                // call is a sha256 hash of calldata
                call: Array(32).fill(0)
            };

            const callData = {
                useRelayer: false,
                data
            }

            const generateProof = await fetch("/api/sindri", {
                body: JSON.stringify(callData),
                method: 'POST',
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json",
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const resultProof = await generateProof.json();
            const proof = "0x" + resultProof.proof.proof;

            console.log("proof", proof)

            const contract = WalletManager__factory.connect(contractAddress, signer);
            const root = await contract.getLastRoot();
            console.log("root", root);;

            const testProof = "0x0f953c77128b3b376ce3941b9ab44bb47ec278560ac82a031715a2ab8a90633b268021c161ec8b296f7a2178f0db3ef20a8194cf4afe1242c6c9618f35ad9e371fdb225b3b3608232f7d8a14f341fc87b00307b9b1e1ce491dcc394514b2448d11408ced7980051effdfcfc2dd1afa15812ddc363bd57af12cd5dca5ed9aab6a075a5cb57c32c00e42e2d09c4099f510dd90d3d42f32cb694453bc8b460652e20b634c2bce9a7dfd9011c1b4645a865264d7e33342af2ff8931f37f01a39f0912304f5da5e858d22965ee61c218a5c59bfa428d743a09b65e3fe8026c1f187692611a3e22f1983e1fe290e70c28a435f69c2c1f4fcd3ed27c2b01a2458d33a331a2dbf8c7c77726d1d7c59f97cd1fe54c88542c0ba7fe76563dedde2a6d8747111866ceb7ac0c08ae7a7729780c104227a29ee512990a99d911c71e88f4286820d38667428f45f36c63e675c71cdc9340907bfb7b7916e11ff50e098bdc1fa4822faf61b3fceba2b7811004b5b7d6a2cf4187482e71da841bd1398ca9ba357102438fdac88f5bbd0a2df0c6e103c825be9353373ce0382dc25e6e1e02216e95f0754dfa348f0ed18b536ec1b79b3d4a6ddbc636504fb57cbb7283562c3cfd02023585c0cc3a97624e9ab06759e005812c5f372a83edafce8b3920dd120b4503b0aa6738814532795109204512387f6a660536f7aa20d1b039331ea6f7bfdac9c15ef4cfe9a9ecc49d5f46d30879ba81e90f25c910474d167988fe1022b0dd8d60df94484812fbef998e8da5c3fdd811ad1a799dbdf34121209dbbab2157f72a51c61498fee1b024ecc001aa0b0a498ca1dda87b038a7c1f9eed9eceef1c1733815372ba35917f403aa9afd30661b6d9c1708a72c96ab3d31fb758f432695ea4c07501967c7fc699ef7c0209c3fcb25de2e382e9e9fa7981e8a75f2998f8c6b8e275b37b4a40a7a7ee245f8f3db92fb7feefccfeac34de3f5bf5eb8f56cd8bc01233faf92f84ebabd8e5f9b73a7b903775c92157bd3923c86e2b200798826db2e037c88ea045fb313569ace1e8bef571e1e275a7969b0b7e42ac6cfcb9026e00817a2e2a7d614c6a7f3cab63424bd43c8dca249594cf32dc6f20dd1fdff256fc302c884a5d74c2a41b22617223a76a7876370aca88c7085f53d65a3cfe750485409c8041119d7e026e58ab9361802698f0bc3f846de9ed8e4b275f58d5967582b01ca779814b21094117c6b6a49c5e9fd37802cd5eff7586bf6b5a387a259c38223c0e817661be8cb08043e4fb31cd73d3b0cf05870821424c5667919f48b36762ff5742dd03efa0e2d0620df31d3d77c5d9d36571c00decfeeb4919a1573777d1f5ef72091609d52da9b023f68e9af288dbbfd0b03f24a7dde78d7b82980f1c02720396d11813a3adef4a8959b51a2b6f0f634b5c62c2af7280a3a0a3372bc211797ff6e2c51ba2083daa2a0fe397b8bea9757662b0f37fb0e2e32183b89379e2c5b63e45a86148407c3cb98aed44ee5a0f6586bf0a085dc4329950f5f2b36f92ddf1a87a9ee9df159d514eeeaba2257a7243a1212d104ff86757fb6f7f86ed12c4e8f585f407dc8bdfa36c34a70af6a4f9e1c27ec490991c101b4b8f836ecae0ca034f0bbe9726214b741e49c9e61ebdd9eee0c86efe55bef979ad08bf5397524400ae1cb77a55c077c541aad4a0c326b54bcdd2e1f60c24313daacfa91c2a41da629fd7a85ab83b9bfcff2a50b360fb6c87400f5149b2b397eda6dda335b4908695a798a25d7ffa3c1392c2d485306345d60d3443e33c9148fb2c4b21a429a1165cc47789babc665083d369116e7cc292de6975e8461ae35f756a57eb2ede80ccedca9f25bc4c7feefb3b0fe10f882aab6ab0e1d86688fe865226922774814054647f427184257523d576d693f91fad4e1035a6193e062cacd139d6597d2021342c05b51e9830b15d48c1e9f97d4c7f2c6ae25d37cbd563cf5fdf917703c5d0bfdf7045b19b8aadaf0bcf73e44b38c9d7c9897fc0ef968d25d5e69fc004cc928224075a70577b5caa12b05bbad454beb1c9d693c2b304b082679edcc94c1462a31debae84dcae79247e65ac420cd058cb10b17dccf67adc515ccd21fa514522fb0c758c5bc58c981d300039ffd8274dd62573d874aed35e8cd0ac92c262ad42892353563e9c805b22547fa79a321e5bbce7e94195142ad22cd74f600c195a6097192136e2bad797de0c710a8e546b5d65dc8a4239a7e8753ff5a0ebb3ca02728c84162ff09adcb0c662242a39a312f2dc62dc395d6aa902ffe427e9c5024362c82c6fd3c566142c30b226e94ee85081fdab02eee0cc559c5afb42637f179ed0f39278b5032ea4ad542a072f41d8b714dba390910cdc9662ecd751c674c0b011393f5f01066eefc1fef3d7b545d894bda82a55ee6f67a239b02484f93aea8e01cbcc118d105888a24cfb60f549600d8db9a9959ff029700b076fbf726dc27f414a418439120cf323266e107253a90796cbfd01d71c949e2eaf8a72aae5c6ebb0388c04bf8240fcb12ec8cecdef603b6742f1f8a14588d04df3911a10eb8736003e96fa9305aa7ac458b52c8baf5b5854f6a44363777e0ae5550d5e759dde72f1786c1977d96f4e7dd9e56b57156720123fa3b24659238abe100c59a0e170db827a60dde7186a533a157e25d36c2c1953233ba9eef2ea3000b419ad5db7e5b8f08519b5199555779488a30eb8501b6f907de33becc12e7d6179ed32a595cd1d32c1a65e228d5ecbc0222081ce813aabd282c43f59c68a6b62c28fe71d180c30607bd2dd30f3623310f6c27c2a9bded84e64b8f26bda3bf0229e978c3b2afcd72169109b559651d43e1acb769cd614ca03a72eb6cb2ee2a0c9e804df97bcd7b132012028badd1cd5e17587049a8916913016ff98788bc9f55aa54952111d759af08c3b32fa18c4051a4ab0e48de474f2736189062314342f62010c4ff8cb3ba1228e27ae37f15a1d7b29e08f96ec01ee9bb34efe73847238d7ad83111ada44705";
            const tx = await contract.deposit(new_leaf, unique, root, ethers.ZeroAddress, BigInt(0), proof, { value: amountWei });
            console.log("tx", tx.hash);
            //console.log("resultProof", resultProof);
        } catch (error) {
            console.error("error proof", error);
        }

    };

    return (
        <div className="tab-content">
            <div className='tab-form'>
                <span>Amount (ETH)</span>
                <input className='input' name="amount" type={'number'} onChange={handleChange} value={input.amount} />
            </div>
            <div className='tab-check'>
                <input name="server" id='server' type={'checkbox'} onChange={handleCheck} checked={input.server} />
                <label htmlFor="server" >Sindri's server proof</label>
            </div>
            <button className='btn' onClick={depositEth}>Deposit</button>
        </div>
    );
};
