//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";
import "./interfaces/IWalletManager.sol";
import "../noir/contract/circuits/plonk_vk.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract WalletManager is IWalletManager {
    mapping(address => bool) public isAuthorizedToken;
    address public immutable owner;
    UltraVerifier public immutable verifier;

    // Constructor: Called once on contract deployment
    // Check packages/foundry/deploy/Deploy.s.sol
    constructor(address _owner, UltraVerifier _verifier) {
        owner = _owner;
        verifier = _verifier;
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    function setAuthorizedToken(address _token, bool _authorized) external {
        isAuthorizedToken[_token] = _authorized;
    }
    function deposit(
        bytes32 _commitment,
        bytes32 _nullifier,
        address _relayer,
        uint256 _amountRelayer,
        bytes calldata _proof
    ) external payable {}

    function depositErc20(
        bytes32 _commitment,
        bytes32 _nullifier,
        address _token,
        address _relayer,
        uint256 _amount,
        uint256 _amountRelayer,
        bytes calldata _proof
    ) external {}

    function transfer(ProofData calldata _proofData) external {}

    function swap(
        ProofData calldata _proofData,
        ProofData calldata _proofDataBack
    ) external {}
}
