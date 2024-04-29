// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/WalletManager.sol";

contract WalletManagerTest is Test {
    WalletManager public walletManager;
    UltraVerifier public verifier;

    address deployer = makeAddr("Deployer");
    address alice = makeAddr("Alice");
    address bob = makeAddr("Bob");
    address charlie = makeAddr("Charlie");
    address daniel = makeAddr("Daniel");
    bytes proofBytes;

    function setUp() public {
        walletManager = new WalletManager(bob);
        console.log("contract address %s", address(walletManager));
        string memory proofFilePath = "./noir/proofs/circuits.proof";
        string memory proof = vm.readLine(proofFilePath);
        proofBytes = vm.parseBytes(proof);
        // console.log("proof size %s", proofBytes.length);
    }

    function testDeposit() public {
        deal(alice, 1 ether);

        vm.startPrank(alice);
        bytes32 root = walletManager.getLastRoot();
        console.log("before root");
        console.logBytes32(root);

        bytes32 leaf = 0xc0ac121a19818ca8bf168bc0c16d112a14e6517975070054584a7a61e5f88ca8;
        bytes32 nullifier = 0xb14bf28bf8b32749e4e56585fef382de3e7e0c3ab620755700a9ee62e5125415;

        address relayer = address(0);
        uint256 amountRelayer = 0;
        uint256 amountDeposit = 0.01 ether;

        walletManager.deposit{value: amountDeposit}(
            leaf,
            nullifier,
            root,
            relayer,
            amountRelayer,
            proofBytes
        );

        bytes32 rootAfter = walletManager.getLastRoot();
        console.log("Last root");
        console.logBytes32(rootAfter);
        vm.stopPrank();
        // alice deposit 0.01 ether in contract
        assertEq(alice.balance, 0.99 ether);
    }

    function testSha() public {
        bytes memory data = abi.encode(0, 0);
        uint8[32] memory noirHash = [
            245,
            165,
            253,
            66,
            209,
            106,
            32,
            48,
            39,
            152,
            239,
            110,
            211,
            9,
            151,
            155,
            67,
            0,
            61,
            35,
            32,
            217,
            240,
            232,
            234,
            152,
            49,
            169,
            39,
            89,
            251,
            75
        ];
        bytes32 expected = bytes32(bytesToUint(noirHash));
        bytes32 result = sha256(data);
        assertEq(expected, result);
    }

    function testEncode() public {
        uint256 amount = 0.01 ether;
        console.log("result");
        console.logBytes32(bytes32(amount));
        amount = 100;
        console.log("hundred");
        console.logBytes32(bytes32(amount));
        console.logBytes(_toBytes(bytes32(amount)));
    }

    function _toBytes(bytes32 _data) private pure returns (bytes memory) {
        return abi.encodePacked(_data);
    }

    // https://ethereum.stackexchange.com/questions/51229/how-to-convert-bytes-to-uint-in-solidity
    function bytesToUint(uint8[32] memory b) internal pure returns (uint256) {
        uint256 number;
        for (uint i = 0; i < b.length; i++) {
            number = number + (b[i]) * (2 ** (8 * (b.length - (i + 1))));
        }
        return number;
    }

    function toBytes(bytes32 _data) public pure returns (bytes memory) {
        return abi.encodePacked(_data);
    }
}
