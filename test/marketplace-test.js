const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace (Solidity ^0.8.28 / OZ v5)", function () {
  let marketplace, nft, erc20;
  let owner, seller, buyer, feeRecipient;

  beforeEach(async function () {
    [owner, seller, buyer, feeRecipient, other] = await ethers.getSigners();

    // Deploy mock NFT (ERC721)
    const NFT = await ethers.getContractFactory("MockNFT");
    nft = await NFT.deploy();
    await nft.waitForDeployment();

    // Mint NFT cho seller
    await nft.connect(seller).mint(seller.address, 1);

    // Deploy mock ERC20 token
    const Token = await ethers.getContractFactory("MockERC20");
    erc20 = await Token.deploy();
    await erc20.waitForDeployment();

    // Mint ERC20 cho buyer
    await erc20.connect(owner).transfer(buyer.address, ethers.parseEther("1000"));

    // Deploy marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(feeRecipient.address, 2); // 2%
    await marketplace.waitForDeployment();
  });

  it("should allow seller to list NFT", async function () {
    await nft.connect(seller).approve(marketplace.target, 1);
    await expect(
      marketplace.connect(seller).listNFT(nft.target, 1, ethers.parseEther("1"), ethers.ZeroAddress)
    )
      .to.emit(marketplace, "Listed")
      .withArgs(1, seller.address, nft.target, 1, ethers.parseEther("1"), ethers.ZeroAddress);

    const listing = await marketplace.listings(1);
    expect(listing.active).to.be.true;
    expect(listing.price).to.equal(ethers.parseEther("1"));
  });

  it("should allow buyer to purchase NFT with ETH", async function () {
    await nft.connect(seller).approve(marketplace.target, 1);
    await marketplace.connect(seller).listNFT(nft.target, 1, ethers.parseEther("1"), ethers.ZeroAddress);

    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
    const feeRecipientBefore = await ethers.provider.getBalance(feeRecipient.address);

    await expect(
      marketplace.connect(buyer).buyNFT(1, { value: ethers.parseEther("1") })
    )
      .to.emit(marketplace, "Bought")
      .withArgs(1, buyer.address, ethers.parseEther("1"), ethers.ZeroAddress);

    const listing = await marketplace.listings(1);
    expect(listing.active).to.be.false;
    expect(await nft.ownerOf(1)).to.equal(buyer.address);

    const fee = ethers.parseEther("0.02");
    const sellerAmount = ethers.parseEther("0.98");

    const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
    const feeRecipientAfter = await ethers.provider.getBalance(feeRecipient.address);

    expect(sellerBalanceAfter).to.be.closeTo(sellerBalanceBefore + sellerAmount, ethers.parseEther("0.001"));
    expect(feeRecipientAfter).to.be.closeTo(feeRecipientBefore + fee, ethers.parseEther("0.001"));
  });

  it("should allow buyer to purchase NFT with ERC20", async function () {
    await nft.connect(seller).approve(marketplace.target, 1);
    await marketplace.connect(seller).listNFT(nft.target, 1, ethers.parseEther("10"), erc20.target);

    await erc20.connect(buyer).approve(marketplace.target, ethers.parseEther("10"));

    await expect(marketplace.connect(buyer).buyNFT(1))
      .to.emit(marketplace, "Bought")
      .withArgs(1, buyer.address, ethers.parseEther("10"), erc20.target);

    const fee = ethers.parseEther("0.2");
    const sellerAmount = ethers.parseEther("9.8");

    expect(await erc20.balanceOf(seller.address)).to.equal(sellerAmount);
    expect(await erc20.balanceOf(feeRecipient.address)).to.equal(fee);
    expect(await nft.ownerOf(1)).to.equal(buyer.address);
  });

  it("should allow seller to cancel listing", async function () {
    await nft.connect(seller).approve(marketplace.target, 1);
    await marketplace.connect(seller).listNFT(nft.target, 1, ethers.parseEther("1"), ethers.ZeroAddress);

    await expect(marketplace.connect(seller).cancelListing(1))
      .to.emit(marketplace, "Cancelled")
      .withArgs(1);

    const listing = await marketplace.listings(1);
    expect(listing.active).to.be.false;
    expect(await nft.ownerOf(1)).to.equal(seller.address);
  });

  it("should allow owner to update fee and recipient", async function () {
    await expect(marketplace.connect(owner).updateFee(5))
      .to.emit(marketplace, "FeeUpdated")
      .withArgs(5);

    await expect(marketplace.connect(owner).updateFeeRecipient(other.address))
      .to.emit(marketplace, "FeeRecipientUpdated")
      .withArgs(other.address);

    expect(await marketplace.feePercent()).to.equal(5);
    expect(await marketplace.feeRecipient()).to.equal(other.address);
  });

  it("should revert if non-owner tries to update fee", async function () {
    await expect(marketplace.connect(buyer).updateFee(5)).to.be.revertedWithCustomError(
      marketplace,
      "OwnableUnauthorizedAccount"
    );
  });
});
