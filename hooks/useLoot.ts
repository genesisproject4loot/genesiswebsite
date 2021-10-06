import { useState, useEffect } from "react";
import { ethers } from "ethers";
import lootABI from "data/loot-abi.json";
import { useWalletContext } from "./useWalletContext";
// https://github.com/lootexchange/lootexchange/blob/main/apps/web/data/loot.json
import lootData from "data/loot-data.json";

const LOOT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_LOOT_CONTRACT_ADDRESS ??
  "0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7";
export function useLootContract() {
  const wallet = useWalletContext();
  const [lootContract, setLootContract] = useState<ethers.Contract>();
  useEffect(() => {
    const contract = new ethers.Contract(
      LOOT_CONTRACT_ADDRESS,
      lootABI,
      wallet?.signer
    );
    setLootContract(contract);
  }, [wallet?.signer]);

  return {
    lootContract
  };
}


type LootData = {
  characterImage: string;
  chest: string;
  foot: string;
  hand: string;
  head: string;
  id: string;
  image: string;
  neck: string;
  ring: string;
  waist: string;
  weapon: string;
  name: string;
  tokenId: string;
  manas?: any[];
};

export function lookupLootById(lootId: string) {
  const lootMap = {} as { [key: string]: LootData };
  if (lootMap[lootId]) {
    return lootMap[lootId];
  }
  lootMap[lootId] = (lootData as LootData[]).find((loot) => loot.id === lootId);
  return lootMap[lootId];
}
