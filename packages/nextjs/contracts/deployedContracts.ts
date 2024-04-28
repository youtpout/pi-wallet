/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    WalletManager: {
      address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_owner",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "ROOT_HISTORY_SIZE",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint32",
              internalType: "uint32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "commitments",
          inputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "currentRootIndex",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "deposit",
          inputs: [
            {
              name: "_commitment",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "_nullifier",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "_root",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "_relayer",
              type: "address",
              internalType: "address",
            },
            {
              name: "_amountRelayer",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_proof",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "depositErc20",
          inputs: [
            {
              name: "_commitment",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "_nullifier",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "_root",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "_token",
              type: "address",
              internalType: "address",
            },
            {
              name: "_relayer",
              type: "address",
              internalType: "address",
            },
            {
              name: "_amount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_amountRelayer",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_proof",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "filledSubtrees",
          inputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getLastRoot",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "isAuthorizedToken",
          inputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "isKnownRoot",
          inputs: [
            {
              name: "_root",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "levels",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint32",
              internalType: "uint32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "nextIndex",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "nullifiers",
          inputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "renounceOwnership",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "roots",
          inputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "setAuthorizedToken",
          inputs: [
            {
              name: "_token",
              type: "address",
              internalType: "address",
            },
            {
              name: "_authorized",
              type: "bool",
              internalType: "bool",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "swap",
          inputs: [
            {
              name: "_proofData",
              type: "tuple",
              internalType: "struct IWalletManager.ProofData",
              components: [
                {
                  name: "commitment",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "nullifier",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "root",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "receiver",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "relayer",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "amountRelayer",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "approve",
                  type: "bool",
                  internalType: "bool",
                },
                {
                  name: "proof",
                  type: "bytes",
                  internalType: "bytes",
                },
                {
                  name: "call",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
            },
            {
              name: "_proofDataBack",
              type: "tuple",
              internalType: "struct IWalletManager.ProofData",
              components: [
                {
                  name: "commitment",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "nullifier",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "root",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "receiver",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "relayer",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "amountRelayer",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "approve",
                  type: "bool",
                  internalType: "bool",
                },
                {
                  name: "proof",
                  type: "bytes",
                  internalType: "bytes",
                },
                {
                  name: "call",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transfer",
          inputs: [
            {
              name: "_proofData",
              type: "tuple",
              internalType: "struct IWalletManager.ProofData",
              components: [
                {
                  name: "commitment",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "nullifier",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "root",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "receiver",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "relayer",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "amountRelayer",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "approve",
                  type: "bool",
                  internalType: "bool",
                },
                {
                  name: "proof",
                  type: "bytes",
                  internalType: "bytes",
                },
                {
                  name: "call",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferOwnership",
          inputs: [
            {
              name: "newOwner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "verifier",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract UltraVerifier",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "AddAction",
          inputs: [
            {
              name: "nullifier",
              type: "bytes32",
              indexed: true,
              internalType: "bytes32",
            },
            {
              name: "leafIndex",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "ProofData",
              type: "tuple",
              indexed: false,
              internalType: "struct IWalletManager.ProofData",
              components: [
                {
                  name: "commitment",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "nullifier",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "root",
                  type: "bytes32",
                  internalType: "bytes32",
                },
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "receiver",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "relayer",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "amountRelayer",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "approve",
                  type: "bool",
                  internalType: "bool",
                },
                {
                  name: "proof",
                  type: "bytes",
                  internalType: "bytes",
                },
                {
                  name: "call",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
            },
            {
              name: "actionType",
              type: "uint8",
              indexed: false,
              internalType: "enum WalletManager.ActionType",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OwnershipTransferred",
          inputs: [
            {
              name: "previousOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "newOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AmountTooLow",
          inputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "CommitmentAlreadyUsed",
          inputs: [
            {
              name: "commitment",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
        },
        {
          type: "error",
          name: "InvalidProof",
          inputs: [
            {
              name: "proof",
              type: "bytes",
              internalType: "bytes",
            },
          ],
        },
        {
          type: "error",
          name: "InvalidRoot",
          inputs: [
            {
              name: "root",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
        },
        {
          type: "error",
          name: "NullifierAlreadyUsed",
          inputs: [
            {
              name: "nullifier",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
        },
        {
          type: "error",
          name: "OwnableInvalidOwner",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "OwnableUnauthorizedAccount",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "error",
          name: "UnauthorizedToken",
          inputs: [
            {
              name: "token",
              type: "address",
              internalType: "address",
            },
          ],
        },
      ],
      inheritedFunctions: {},
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
