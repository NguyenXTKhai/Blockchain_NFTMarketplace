import { useState } from "react";
import { ethers } from "ethers";
import { getMarketplaceContract } from "../utils/marketplace";

export default function ListNFT({ contractAddress, nftAddress, account }) {
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [paymentToken, setPaymentToken] = useState("ETH");

  async function listNFT() {
    if (!account) return alert("Vui lòng kết nối ví");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const marketplace = await getMarketplaceContract(signer, contractAddress);

    // Gọi contract ERC721 để approve
    const nftContract = new ethers.Contract(nftAddress, [
      "function approve(address to, uint256 tokenId) external",
    ], signer);

    await nftContract.approve(contractAddress, tokenId);

    const tokenAddr = paymentToken === "ETH" ? ethers.ZeroAddress : paymentToken;

    const tx = await marketplace.listNFT(nftAddress, tokenId, ethers.parseEther(price), tokenAddr);
    await tx.wait();

    alert(`NFT ${tokenId} đã được list thành công!`);
    setTokenId("");
    setPrice("");
  }

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-2">List NFT</h2>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        className="border p-2 mr-2"
      />
      <input
        type="text"
        placeholder="Price (ETH)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-2 mr-2"
      />
      <select value={paymentToken} onChange={(e) => setPaymentToken(e.target.value)} className="border p-2 mr-2">
        <option value="ETH">ETH</option>
        {/* Có thể thêm ERC20 token address */}
      </select>
      <button onClick={listNFT} className="bg-blue-500 text-white px-4 py-2 rounded">
        List NFT
      </button>
    </div>
  );
}
