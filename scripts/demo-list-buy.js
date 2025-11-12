const { ethers } = require('hardhat');

async function main() {
  const [owner, seller, buyer] = await ethers.getSigners();

  const TestNFT = await ethers.getContractFactory('TestNFT');
  const nft = await TestNFT.deploy();
  await nft.deployed();

  const TestERC20 = await ethers.getContractFactory('TestERC20');
  const erc20 = await TestERC20.deploy(ethers.utils.parseEther('100000'));
  await erc20.deployed();

  const Marketplace = await ethers.getContractFactory('Marketplace');
  const marketplace = await Marketplace.deploy(owner.address);
  await marketplace.deployed();

  // mint NFT to seller
  await nft.connect(owner).mint(seller.address);
  const tokenId = 0;

  // seller approves marketplace
  await nft.connect(seller).setApprovalForAll(marketplace.address, true);

  // seller creates listing for ETH
  const listingId = (await marketplace.connect(seller).list(nft.address, tokenId, ethers.constants.AddressZero, ethers.utils.parseEther('1'))).value;
  // Note: list() returns listingId in contract but JS needs to parse event or call transaction wait

  // simpler: call and then read nextListingId - 1
  const tx = await marketplace.connect(seller).list(nft.address, tokenId, ethers.constants.AddressZero, ethers.utils.parseEther('1'));
  const receipt = await tx.wait();
  // find Listed event
  const listedEvent = receipt.events.find((e) => e.event === 'Listed');
  const listedId = listedEvent.args.listingId;
  console.log('listedId', listedId.toString());

  // buyer buys with ETH
  await marketplace.connect(buyer).buy(listedId, { value: ethers.utils.parseEther('1') });
  console.log('Bought NFT with ETH');

  // Now test ERC20 flow: mint another NFT and list price in ERC20
  await nft.connect(owner).mint(seller.address);
  const tokenId2 = 1;
  await nft.connect(seller).setApprovalForAll(marketplace.address, true);

  const tx2 = await marketplace.connect(seller).list(nft.address, tokenId2, erc20.address, ethers.utils.parseEther('10'));
  const receipt2 = await tx2.wait();
  const listed2 = receipt2.events.find((e) => e.event === 'Listed');
  const listedId2 = listed2.args.listingId;

  // buyer needs ERC20 tokens: owner transferred earlier; transfer some to buyer
  await erc20.transfer(buyer.address, ethers.utils.parseEther('100'));
  // buyer approve marketplace
  await erc20.connect(buyer).approve(marketplace.address, ethers.utils.parseEther('1000'));

  await marketplace.connect(buyer).buy(listedId2);
  console.log('Bought NFT with ERC20');
}

main().catch(console.error);