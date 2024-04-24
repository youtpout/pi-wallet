// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IWalletManager {
    function deposit(
        bytes32 _commitment,
        address _relayer,
        uint256 _amountRelayer,
        bytes calldata _proof
    ) external payable;
    function depositErc20(
        bytes32 _commitment,
        address _token,
        address _relayer,
        uint256 _amount,
        uint256 _amountRelayer,
        bytes calldata _proof
    ) external;
    function withdraw(
        bytes32 _nullifierHash,
        // the new leaf added not the old one executed
        bytes32 _commitment,
        bytes32 _root,
        address _token,
        address _receiver,
        address _relayer,
        uint256 _amount,
        uint256 _amountRelayer,
        bytes calldata _proof,
        bytes calldata _call
    ) external;

    function isAuthorizedToken(address _token) external returns (bool);

    function setAuthorizedToken(address _token, bool _authorized) external;
}
