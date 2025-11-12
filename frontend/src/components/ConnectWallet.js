import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function ConnectWallet({ onConnected }) {
  const [account, setAccount] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask!");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    onConnected(accounts[0]);
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => setAccount(accounts[0]));
    }
  }, []);

  return (
    <div className="p-4">
      {account ? (
        <span className="text-green-600">Đã kết nối: {account}</span>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Kết nối MetaMask
        </button>
      )}
    </div>
  );
}
