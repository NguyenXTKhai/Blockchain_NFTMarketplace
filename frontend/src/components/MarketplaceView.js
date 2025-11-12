import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getMarketplaceContract } from "../utils/marketplace";

export default function MarketplaceView({ contractAddress, account }) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!account) return;

    async function fetchListings() {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketplace = await getMarketplaceContract(provider, contractAddress);

      const listingCount = await marketplace.listingCount();
      const temp = [];

      for (let i = 1; i <= listingCount; i++) {
        const l = await marketplace.listings(i);
        if (l.active) {
          temp.push({ ...l, id: i });
        }
      }

      setListings(temp);
    }

    fetchListings();
  }, [account, contractAddress]);

  async function buyNFT(listingId, price, paymentToken) {
    if (!account) return alert("Kết nối ví trước!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const marketplace = await getMarketplaceContract(signer, contractAddress);

    const overrides = paymentToken === ethers.ZeroAddress ? { value: price } : {};
    const tx = await marketplace.buyNFT(listingId, overrides);
    await tx.wait();

    alert("Mua NFT thành công!");
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">Marketplace Listings</h2>
      {listings.length === 0 && <p>Không có NFT nào đang list.</p>}
      <ul>
        {listings.map((l) => (
          <li key={l.id} className="border p-2 mb-2 flex justify-between items-center">
            <div>
              <p>NFT ID: {l.tokenId}</p>
              <p>Price: {ethers.formatEther(l.price)} {l.paymentToken === ethers.ZeroAddress ? "ETH" : "Token"}</p>
              <p>Seller: {l.seller}</p>
            </div>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => buyNFT(l.id, l.price, l.paymentToken)}
            >
              Buy
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
