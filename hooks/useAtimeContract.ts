import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import atimeABI from "data/atime-abi.json";
import { useWalletContext } from "./useWalletContext";

export const ATIME_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ATIME_CONTRACT_ADDRESS ??
  "0x810f86eb43ccaacd401ef50dfab87945a514f9cf";
export function useAtimeContract() {
  const wallet = useWalletContext();
  const [atimeContract, setAtimeContract] = useState<ethers.Contract>();
  useEffect(() => {
    if (!wallet?.signer) {
      return;
    }
    const contract = new ethers.Contract(
      ATIME_CONTRACT_ADDRESS,
      atimeABI,
      wallet?.signer
    );
    setAtimeContract(contract);
  }, [wallet?.signer]);

  async function claimAllForOwner() {
    const transaction = await atimeContract.claimAllForOwner();
    return transaction;
  }
  return {
    atimeContract,
    claimAllForOwner
  };
}
