// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/WalletManager.sol";

contract YourContractTest is Test {
    WalletManager public yourContract;

    function setUp() public {
        yourContract = new WalletManager(vm.addr(1));
    }

 
}
