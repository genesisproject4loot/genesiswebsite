import { useState, useMemo } from "react";
import { ethers } from "ethers";
import lootABI from "abi/Loot.json";
import { GenesisMana, GenesisMana__factory, Loot__factory } from "typechain";

export function useLootContract(
  signer: ethers.Signer | ethers.providers.Provider
) {
  const [lootContract, setLootContract] = useState<GenesisMana>();
  useMemo(() => {
    const contract = Loot__factory.connect("", signer);
  }, [signer]);

  return {
    lootContract
  };
}
