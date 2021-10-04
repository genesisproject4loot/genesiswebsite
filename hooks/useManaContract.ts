import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import manaABI from "data/genesismana-abi.json";
import { useWalletContext } from "./useWalletContext";
import { Bag } from "@utils/manaFinderTypes";

const GM_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GM_CONTRACT_ADDRESS ?? "0xf4B6040A4b1B30f1d1691699a8F3BF957b03e463";
export function useManaContract() {
  const wallet = useWalletContext();
  const [manaContract, setManaContract] = useState<ethers.Contract>();
  useEffect(() => {
    const contract = new ethers.Contract(
      GM_CONTRACT_ADDRESS,
      manaABI,
      wallet?.signer
    );
    setManaContract(contract);
  }, [wallet?.signer]);

  async function mintMana(lootId: number, inventoryId: number) {
    const transaction = await manaContract.claimByLootId(
      ethers.BigNumber.from(lootId),
      ethers.BigNumber.from(inventoryId)
    );
    return transaction;
  }
  return {
    manaContract,
    mintMana
  };
}

async function getData(contract, tokenId) {
  const data = await contract.tokenURI(tokenId);
  return JSON.parse(atob(data.replace("data:application/json;base64,", "")));
}

export function useManaFromWallet() {
  const wallet = useWalletContext();
  const [manas, setManas] = useState<any[]>([]);
  const [retry, setRetry] = useState(0);
  const { manaContract } = useManaContract();

  async function doQuery() {
    const filterTo = manaContract.filters.Transfer(
      null,
      wallet.account.toString()
    );
    try {
      const events = await manaContract.queryFilter(filterTo);
      const manas = [];

      for (let i = 0; i < events.length; i++) {
        const tokenId = ethers.BigNumber.from(events[i].topics[3]);

        const mana = await getData(manaContract, tokenId);
        manas.push(mana);
      }
      setManas(manas);
    } catch (e) {
      console.log(e);
    }
  }

  function refresh() {
    setRetry(retry + 1);
  }

  useEffect(() => {
    if (!manaContract || !wallet?.account) {
      return;
    }
    doQuery();
  }, [manaContract, wallet.account, retry]);

  return {
    manas,
    refresh
  };
}