const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // địa chỉ contract của bạn
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = MyNFT.attach(contractAddress);

  const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // ví người nhận (account[0])
  const tokenURI = "https://ipfs.io/ipfs/QmExampleMetadata123"; // URL metadata NFT

  const tx = await myNFT.mintNFT(recipient, tokenURI);
  await tx.wait();

  console.log(`✅ Minted NFT to ${recipient}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
