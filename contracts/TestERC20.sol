// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor(uint256 initial) ERC20("TestToken", "TST") {
        _mint(msg.sender, initial);
    }
}