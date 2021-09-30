import { useState, useEffect } from "react";
import { ethers } from "ethers";
import manaABI from "abi/GenesisMana.json";
import { GenesisMana } from "typechain";

const GM_CONTRACT_ADDRESS = "0xf4B6040A4b1B30f1d1691699a8F3BF957b03e463";
export function usManaContract(
  signer: ethers.Signer | ethers.providers.Provider
) {
  const [manaContract, setManaContract] = useState<GenesisMana>();
  useEffect(() => {
    const contract = new ethers.Contract(GM_CONTRACT_ADDRESS, manaABI, signer);
    setManaContract(contract as GenesisMana);
  }, [signer]);

  return {
    manaContract
  };
}
