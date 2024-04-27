// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IWalletManager {
    struct ProofData {
        bytes32 _commitment;
        bytes32 _unique;
        bytes32 _root;
        address _token;
        address _receiver;
        address _relayer;
        uint256 _amount;
        uint256 _amountRelayer;
        bytes _proof;
        bytes _call;
    }

    function deposit(
        bytes32 _commitment,
        bytes32 _unique,
        address _relayer,
        uint256 _amountRelayer,
        bytes calldata _proof
    ) external payable;

    function depositErc20(
        bytes32 _commitment,
        bytes32 _unique,
        address _token,
        address _relayer,
        uint256 _amount,
        uint256 _amountRelayer,
        bytes calldata _proof
    ) external;

    function transfer(ProofData calldata _proofData) external;

    function swap(
        ProofData calldata _proofData,
        ProofData calldata _proofDataBack
    ) external;

    function isAuthorizedToken(address _token) external returns (bool);

    function setAuthorizedToken(address _token, bool _authorized) external;
}
