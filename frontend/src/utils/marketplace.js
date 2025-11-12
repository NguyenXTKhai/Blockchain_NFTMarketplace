import { ethers } from "ethers";
import MarketplaceABI from "../abi/Marketplace.json";

export async function getMarketplaceContract(signerOrProvider, contractAddress) {
  return new ethers.Contract(contractAddress, MarketplaceABI.abi, signerOrProvider);
}
