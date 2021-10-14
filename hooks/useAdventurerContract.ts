import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { useWalletContext } from "./useWalletContext";

export const GA_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GA_CONTRACT_ADDRESS ??
  "0x8db687aceb92c66f013e1d614137238cc698fedb";

const gaABI = [
  {
    inputs: [],
    name: "publicPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

export function useAdventurerContract() {
  const wallet = useWalletContext();
  const [adventurerContract, setAdventurerContract] =
    useState<ethers.Contract>();
  useEffect(() => {
    const contract = new ethers.Contract(
      GA_CONTRACT_ADDRESS,
      gaABI,
      wallet?.signer
    );
    setAdventurerContract(contract);
  }, [wallet?.signer]);

  async function getPublicPrice() {
    if (!adventurerContract) {
      return 0;
    }
    const price = await adventurerContract.publicPrice();
    return parseFloat(parseFloat(ethers.utils.formatUnits(price)).toFixed(4));
  }

  return {
    adventurerContract,
    getPublicPrice
  };
}
