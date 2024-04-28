//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";
import "./interfaces/IWalletManager.sol";
import "../noir/contract/circuits/plonk_vk.sol";
import "./MerkleTreeWithHistory.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {TransferHelper} from "./libraries/TransferHelper.sol";
// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract WalletManager is
    MerkleTreeWithHistory,
    IWalletManager,
    Ownable,
    ReentrancyGuard
{
    mapping(address => bool) public isAuthorizedToken;
    mapping(bytes32 => bool) public nullifiers;
    mapping(bytes32 => bool) public commitments;
    UltraVerifier public immutable verifier;

    error UnauthorizedToken(address token);
    error CommitmentAlreadyUsed(bytes32 commitment);
    error NullifierAlreadyUsed(bytes32 nullifier);
    error InvalidProof(bytes proof);
    error AmountTooLow(uint256);

    enum ActionType {
        Deposit,
        Withdraw
    }

    event AddAction(
        bytes32 indexed nullifier,
        uint256 indexed leafIndex,
        ProofData ProofData,
        ActionType actionType
    );

    // Constructor: Called once on contract deployment
    // Check packages/foundry/deploy/Deploy.s.sol
    constructor(
        address _owner,
        UltraVerifier _verifier
    ) MerkleTreeWithHistory(16) Ownable(_owner) {
        verifier = _verifier;
    }

    function setAuthorizedToken(
        address _token,
        bool _authorized
    ) external onlyOwner {
        isAuthorizedToken[_token] = _authorized;
    }

    function deposit(
        bytes32 _commitment,
        bytes32 _nullifier,
        address _relayer,
        uint256 _amountRelayer,
        bytes calldata _proof
    ) external payable nonReentrant {
        if (nullifiers[_nullifier]) {
            revert NullifierAlreadyUsed(_nullifier);
        }
        if (commitments[_commitment]) {
            revert CommitmentAlreadyUsed(_nullifier);
        }

        if (msg.value < _amountRelayer) {
            revert AmountTooLow(msg.value);
        }

        nullifiers[_nullifier] = true;
        commitments[_commitment] = true;
    }

    function depositErc20(
        bytes32 _commitment,
        bytes32 _nullifier,
        address _token,
        address _relayer,
        uint256 _amount,
        uint256 _amountRelayer,
        bytes calldata _proof
    ) external nonReentrant {
        if (nullifiers[_nullifier]) {
            revert NullifierAlreadyUsed(_nullifier);
        }
        if (commitments[_commitment]) {
            revert CommitmentAlreadyUsed(_nullifier);
        }
        if (!isAuthorizedToken[_token]) {
            revert UnauthorizedToken(_token);
        }
        nullifiers[_nullifier] = true;
        commitments[_commitment] = true;

        if (_amount < _amountRelayer) {
            revert AmountTooLow(_amount);
        }

        // transfer from user to contract
        TransferHelper.safeTransferFrom(
            _token,
            msg.sender,
            address(this),
            _amount
        );
    }

    function transfer(ProofData calldata _proofData) external nonReentrant {
        if (nullifiers[_proofData.nullifier]) {
            revert NullifierAlreadyUsed(_proofData.nullifier);
        }
        if (commitments[_proofData.commitment]) {
            revert CommitmentAlreadyUsed(_proofData.nullifier);
        }
        nullifiers[_proofData.nullifier] = true;
        commitments[_proofData.commitment] = true;
    }

    function swap(
        ProofData calldata _proofData,
        ProofData calldata _proofDataBack
    ) external nonReentrant {
        if (nullifiers[_proofData.nullifier]) {
            revert NullifierAlreadyUsed(_proofData.nullifier);
        }
        if (nullifiers[_proofDataBack.nullifier]) {
            revert NullifierAlreadyUsed(_proofDataBack.nullifier);
        }
        if (commitments[_proofData.commitment]) {
            revert CommitmentAlreadyUsed(_proofData.commitment);
        }
        if (commitments[_proofDataBack.commitment]) {
            revert CommitmentAlreadyUsed(_proofDataBack.commitment);
        }
        nullifiers[_proofData.nullifier] = true;
        commitments[_proofData.commitment] = true;
        nullifiers[_proofDataBack.nullifier] = true;
        commitments[_proofDataBack.commitment] = true;

        if (_proofData.amount < _proofData.amountRelayer) {
            revert AmountTooLow(_proofData.amount);
        }

        if (_proofDataBack.amount < _proofDataBack.amountRelayer) {
            revert AmountTooLow(_proofDataBack.amount);
        }
    }

    function _deposit(ProofData calldata _proofData) private {
        if (_proofData.amountRelayer > 0 && _proofData.relayer != address(0)) {
            if (_proofData.token == address(0)) {
                TransferHelper.safeTransferETH(
                    _proofData.relayer,
                    _proofData.amountRelayer
                );
            } else {
                TransferHelper.safeTransfer(
                    _proofData.token,
                    _proofData.relayer,
                    _proofData.amountRelayer
                );
            }
        }

        _verifyProof(_proofData, true);

        uint256 insertedIndex = _insert(_proofData.commitment);
        emit AddAction(
            _proofData.nullifier,
            insertedIndex,
            _proofData,
            ActionType.Deposit
        );
    }

    function _verifyProof(
        ProofData calldata _proofData,
        bool _isDeposit
    ) private view {
        bytes32[] memory _publicInputs = new bytes32[](134);
        _publicInputs[0] = bytes32(uint256(uint160(_proofData.token)));
        for (uint i = 0; i < 32; i++) {
            uint256 index = i + 1;
            _publicInputs[index] = bytes32(
                uint256(uint8(_proofData.nullifier[i]))
            );
        }
        for (uint i = 0; i < 32; i++) {
            uint256 index = i + 33;
            _publicInputs[index] = bytes32(
                uint256(uint8(_proofData.commitment[i]))
            );
        }
        for (uint i = 0; i < 32; i++) {
            uint256 index = i + 65;
            _publicInputs[index] = bytes32(uint256(uint8(_proofData.root[i])));
        }
        _publicInputs[97] = bytes32(_proofData.amount);
        _publicInputs[98] = bytes32(_proofData.amountRelayer);
        _publicInputs[99] = bytes32(uint256(uint160(_proofData.receiver)));
        _publicInputs[100] = bytes32(uint256(uint160(_proofData.relayer)));
        _publicInputs[101] = _isDeposit
            ? bytes32(uint256(1))
            : bytes32(uint256(0));
        for (uint i = 0; i < 32; i++) {
            uint256 index = i + 65;
            _publicInputs[index] = bytes32(uint256(uint8(_proofData.call[i])));
        }

        if (!verifier.verify(_proofData.proof, _publicInputs)) {
            revert InvalidProof(_proofData.proof);
        }
    }
}
