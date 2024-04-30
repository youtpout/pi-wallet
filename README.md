# PI Wallet

This private wallet project aims to preserve the anonymity of the user when interacting on the scroll blockchain.

Ultimately, users will be able to perform the same actions as a conventional wallet, while retaining their anonymity. All users interactions will pass through the same smartcontract.

This project is scaffold with Scaffold Eth2, use noir as proof system, thegraph to index data, Sindri to generate proof faster, and the solidity smartcontract are deployed on the incredible Scroll blockchain.

Actually support ETH and Link on Scroll Sepolia, you can deposit and withdraw tokens

Will support multiple Erc20 token, contract call with data to bridge/swap/lending everything possible on blockchain

## Information

[Website demo](https://pi-wallet-rouge.vercel.app/)

[Contract on scrollscan 0xe9e734ab5215bcbff64838878d0caa2483ed679c](https://sepolia.scrollscan.com/address/0xe9e734ab5215bcbff64838878d0caa2483ed679c#code)

Noir : circuit on /packages/foundry/noir

Sindri : circuit id e1e6361a-dc7a-4c6d-8ebb-ca2c5027d6df, used on /packages/nextjs/app/api/sindri/route.ts

Graph : subgraph /packages/graph [subgraph url pi wallet v0.2](https://api.studio.thegraph.com/query/56264/pi-wallet/0.2)
used in /packages/nextjs/utils/prove and  /packages/nextjs/components/AccountInfo

## How it works

We generate a proof with the signature of the wallet created for the occasion. This ensures that your private key is never shared, and that it was you who created the proof.

By regenerating your signatures, you can retrieve the various transactions made by your wallet. Since you need your private key to sign, an outside party cannot reproduce your signature and therefore retrieve your transactions.

To generate a new proof, you need the information from the previous one, which helps avoid double spending. That's why you can make as many deposits and withdrawals as you like from the same wallet.

What's more, using signatures rather than secrets means you can use third-party services such as sindri to generate proofs more quickly without sharing your private key.

# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Foundry, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Foundry. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/foundry/foundry.toml`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/foundry/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/foundry/script` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn foundry:test`

- Edit your smart contract `YourContract.sol` in `packages/foundry/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/foundry/script`

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.