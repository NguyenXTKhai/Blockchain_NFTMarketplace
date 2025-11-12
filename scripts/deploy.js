const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // Deploy MockNFT
  const NFT = await ethers.getContractFactory("MockNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment(); // ✅ Thay vì nft.deployed()
  console.log("MockNFT deployed to:", await nft.getAddress());

  // Deploy MockERC20
  const Token = await ethers.getContractFactory("MockERC20");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("MockERC20 deployed to:", await token.getAddress());

  // Deploy Marketplace
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const feeRecipient = deployer.address;
  const feePercent = 2;
  const marketplace = await Marketplace.deploy(feeRecipient, feePercent);
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
