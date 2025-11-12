// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Marketplace is Ownable, ReentrancyGuard {
    uint256 public feePercent;
    address public feeRecipient;

    struct Listing {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        address paymentToken; // address(0) for ETH, ERC20 otherwise
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        address paymentToken
    );
    event Bought(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price,
        address paymentToken
    );
    event Cancelled(uint256 indexed listingId);
    event FeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address _feeRecipient, uint256 _feePercent)
        Ownable(msg.sender) // ✅ Quan trọng: truyền owner hiện tại
    {
        feeRecipient = _feeRecipient;
        feePercent = _feePercent;
    }

    function listNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        address paymentToken
    ) external nonReentrant {
        require(price > 0, "Price must be > 0");
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);
        listingCount++;
        listings[listingCount] = Listing(
            msg.sender,
            nftAddress,
            tokenId,
            price,
            paymentToken,
            true
        );
        emit Listed(listingCount, msg.sender, nftAddress, tokenId, price, paymentToken);
    }

    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage item = listings[listingId];
        require(item.active, "Listing inactive");

        uint256 fee = (item.price * feePercent) / 100;
        uint256 sellerAmount = item.price - fee;

        item.active = false;

        if (item.paymentToken == address(0)) {
            // ETH
            require(msg.value == item.price, "Incorrect ETH amount");
            payable(item.seller).transfer(sellerAmount);
            payable(feeRecipient).transfer(fee);
        } else {
            // ERC20
            IERC20 token = IERC20(item.paymentToken);
            require(
                token.transferFrom(msg.sender, item.seller, sellerAmount),
                "Token payment failed"
            );
            require(
                token.transferFrom(msg.sender, feeRecipient, fee),
                "Fee transfer failed"
            );
        }

        IERC721(item.nftAddress).transferFrom(address(this), msg.sender, item.tokenId);
        emit Bought(listingId, msg.sender, item.price, item.paymentToken);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage item = listings[listingId];
        require(item.active, "Already inactive");
        require(msg.sender == item.seller || msg.sender == owner(), "Not authorized");

        item.active = false;
        IERC721(item.nftAddress).transferFrom(address(this), item.seller, item.tokenId);
        emit Cancelled(listingId);
    }

    function updateFee(uint256 newFee) external onlyOwner {
        require(newFee <= 10, "Fee too high"); // limit to 10%
        feePercent = newFee;
        emit FeeUpdated(newFee);
    }

    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
}
