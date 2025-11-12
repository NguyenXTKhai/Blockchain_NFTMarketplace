// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockNFT is ERC721 {
    uint256 public nextId;
    constructor() ERC721("MockNFT", "MNFT") {}
    function mint(address to, uint256 id) external {
        _mint(to, id);
    }
}
