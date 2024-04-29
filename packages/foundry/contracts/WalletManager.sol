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
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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

    bytes32 constant zeroByte = bytes32(uint256(0));
    bytes32 constant oneByte = bytes32(uint256(1));
    bytes constant emptyBytes = "";

    error UnauthorizedToken(address token);
    error CommitmentAlreadyUsed(bytes32 commitment);
    error NullifierAlreadyUsed(bytes32 nullifier);
    error InvalidProof(bytes proof);
    error AmountTooLow(uint256);
    error InvalidRoot(bytes32 root);

    enum ActionType {
        // match is deposit 0 for withdraw, 1 for deposit
        Withdraw,
        Deposit        
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
        address _owner
    ) MerkleTreeWithHistory(16) Ownable(_owner) {
        verifier = new UltraVerifier();
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
        bytes32 _root,
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
        if (!isKnownRoot(_root)) {
            revert InvalidRoot(_root);
        }
        if (msg.value < _amountRelayer) {
            revert AmountTooLow(msg.value);
        }

        nullifiers[_nullifier] = true;
        commitments[_commitment] = true;
        ProofData memory proofData = ProofData(
            _commitment,
            _nullifier,
            _root,
            address(0),
            address(this),
            _relayer,
            msg.value,
            _amountRelayer,
            false,
            _proof,
            emptyBytes
        );

        _deposit(proofData);
    }

    function depositErc20(
        bytes32 _commitment,
        bytes32 _nullifier,
        bytes32 _root,
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
        if (!isKnownRoot(_root)) {
            revert InvalidRoot(_root);
        }
        // we block token only on deposit, the user can withdraw previously authorized tokens
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

        ProofData memory proofData = ProofData(
            _commitment,
            _nullifier,
            _root,
            _token,
            address(this),
            _relayer,
            _amount,
            _amountRelayer,
            false,
            _proof,
            emptyBytes
        );

        _deposit(proofData);
    }

    function transfer(ProofData calldata _proofData) external nonReentrant {
        if (nullifiers[_proofData.nullifier]) {
            revert NullifierAlreadyUsed(_proofData.nullifier);
        }
        if (commitments[_proofData.commitment]) {
            revert CommitmentAlreadyUsed(_proofData.nullifier);
        }
        if (!isKnownRoot(_proofData.root)) {
            revert InvalidRoot(_proofData.root);
        }

        nullifiers[_proofData.nullifier] = true;
        commitments[_proofData.commitment] = true;

        _withdraw(_proofData);
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
        if (!isKnownRoot(_proofDataBack.root)) {
            revert InvalidRoot(_proofData.root);
        }
        if (!isKnownRoot(_proofDataBack.root)) {
            revert InvalidRoot(_proofData.root);
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

        // swap make 2 actions withdraw and after deposit, so an user can make swap and receive token in this private balance
        uint256 balanceBefore = IERC20(_proofDataBack.token).balanceOf(
            address(this)
        );
        _withdraw(_proofData);
        uint256 balanceAfter = IERC20(_proofDataBack.token).balanceOf(
            address(this)
        );
        // todo manage extra tokens, a swap is never perfect
        uint256 received = balanceAfter - balanceBefore;
        // we need to received equal or more than deposited
        if (received < (_proofDataBack.amount + _proofDataBack.amountRelayer)) {
            revert AmountTooLow(received);
        }
        _deposit(_proofData);
    }

    function _deposit(ProofData memory _proofData) private {
        // first pay the relayer if we have one
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

    function _withdraw(ProofData memory _proofData) private {
        // first pay the relayer
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

        // transfer with call parameter (usefull if user interract with other contract)
        if (_proofData.token == address(0)) {
            (bool success, ) = _proofData.receiver.call{
                value: _proofData.amount
            }(_proofData.call);
            require(success, "STE");
        } else {
            if (_proofData.approve) {
                // approve so the smartcontract receiver will transfer from himself
                IERC20(_proofData.token).approve(
                    _proofData.receiver,
                    _proofData.amount
                );
            } else {
                // pretransfer and call
                TransferHelper.safeTransfer(
                    _proofData.token,
                    _proofData.receiver,
                    _proofData.amount
                );
            }
            (bool success, ) = _proofData.receiver.call(_proofData.call);
            require(success, "STE");
            if (_proofData.approve) {
                // remove allowance
                IERC20(_proofData.token).approve(_proofData.receiver, 0);
            }
        }

        _verifyProof(_proofData, false);

        uint256 insertedIndex = _insert(_proofData.commitment);
        emit AddAction(
            _proofData.nullifier,
            insertedIndex,
            _proofData,
            ActionType.Withdraw
        );
    }

    function _verifyProof(
        ProofData memory _proofData,
        bool _isDeposit
    ) private view {
        bytes32[] memory _publicInputs = new bytes32[](135);
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
        _publicInputs[101] = _isDeposit ? oneByte : zeroByte;
        _publicInputs[102] = _proofData.approve ? oneByte : zeroByte;
        bytes32 hashCall = _isDeposit ? zeroByte : sha256(_proofData.call);
        for (uint i = 0; i < 32; i++) {
            uint256 index = i + 103;
            _publicInputs[index] = bytes32(uint256(uint8(hashCall[i])));
        }

        if (!verifier.verify(_proofData.proof, _publicInputs)) {
            revert InvalidProof(_proofData.proof);
        }
    }
}
