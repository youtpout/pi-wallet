//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";
import "./interfaces/IWalletManager.sol";
import "../noir/contract/circuits/plonk_vk.sol";
import "./MerkleTreeWithHistory.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
    mapping(bytes32 => bool) public nullifierHashes;
    mapping(bytes32 => bool) public commitments;
    UltraVerifier public immutable verifier;

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
    ) external payable nonReentrant {}

    function depositErc20(
        bytes32 _commitment,
        bytes32 _nullifier,
        address _token,
        address _relayer,
        uint256 _amount,
        uint256 _amountRelayer,
        bytes calldata _proof
    ) external nonReentrant {}

    function transfer(ProofData calldata _proofData) external nonReentrant {}

    function swap(
        ProofData calldata _proofData,
        ProofData calldata _proofDataBack
    ) external nonReentrant {}
}
