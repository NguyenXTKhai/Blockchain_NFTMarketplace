import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import ListNFT from "./components/ListNFT";
import MarketplaceView from "./components/MarketplaceView";

// Thay bằng địa chỉ contract sau khi deploy
const MARKETPLACE_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
const NFT_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

function App() {
  const [account, setAccount] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">NFT Marketplace</h1>

      {/* Connect Wallet */}
      <ConnectWallet onConnected={setAccount} />

      {account && (
        <>
          {/* List NFT */}
          <ListNFT
            contractAddress={MARKETPLACE_ADDRESS}
            nftAddress={NFT_ADDRESS}
            account={account}
          />

          {/* Marketplace View */}
          <MarketplaceView
            contractAddress={MARKETPLACE_ADDRESS}
            account={account}
          />
        </>
      )}
    </div>
  );
}

export default App;
