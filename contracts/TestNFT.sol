// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNFT is ERC721, Ownable {
    uint256 public nextId;

    constructor() ERC721("TestNFT", "TNFT") Ownable(msg.sender){}

    function mint(address to) external onlyOwner returns (uint256) {
        uint256 id = nextId++;
        _safeMint(to, id);
        return id;
    }
}