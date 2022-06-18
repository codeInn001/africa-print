import { useContract } from "./useContract";
import NFTMarketplaceAbi from "../contracts/NFTMarketplace.json";
import NFTMarketplace from "../contracts/NFTMarketplace-address.json";

export const useMarketplaceContract = () =>
  useContract(NFTMarketplaceAbi.abi, NFTMarketplace.NFTMarketplace);
