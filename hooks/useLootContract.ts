import { useState, useEffect } from "react";
import { ethers } from "ethers";
import lootABI from "abi/Loot.json";
import { Loot } from "typechain";
import { useWalletContext } from "./useWalletContext";
import lootCache from "data/loot.json";

const LOOT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LOOT_CONTRACT_ADDRESS ?? "0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7";
export function useLootContract() {
  const wallet = useWalletContext();
  const [lootContract, setLootContract] = useState<Loot>();
  useEffect(() => {
    const contract = new ethers.Contract(
      LOOT_CONTRACT_ADDRESS,
      lootABI,
      wallet?.signer
    );
    setLootContract(contract as Loot);
  }, [wallet?.signer]);

  return {
    lootContract
  };
}

async function getData(contract, tokenId: string) {
  const data = await contract.tokenURI(tokenId);
  return JSON.parse(atob(data.replace("data:application/json;base64,", "")));
}

function getMana(bag) {
  return [
    "weapon",
    "chest",
    "head",
    "waist",
    "foot",
    "hand",
    "neck",
    "ring"
  ].map((attr) => (bag[attr].match(/.*of\s(the\s)?([a-zA-z]+).*/) ?? [])[2]);
}

export function useLootFromWallet() {
  const wallet = useWalletContext();
  const [loot, setLoot] = useState<any[]>([]);
  const [retry, setRetry] = useState(0);
  const { lootContract } = useLootContract();

  async function doQuery() {
    const filterTo = lootContract.filters.Transfer(
      null,
      wallet.account.toString()
    );
    try {
      const events = await lootContract.queryFilter(filterTo);
      const loot = [];

      for (let i = 0; i < events.length; i++) {
        const tokenId = ethers.BigNumber.from(events[i].topics[3]);
        const bag = (lootCache as any[]).find((bag) => bag.id == tokenId);
        bag.manas = getMana(bag);
        loot.push({ ...bag });
      }
      setLoot(loot);
    } catch (e) {
        console.log(e);
    }
  }

  function refresh() {
    setRetry(retry+1);
  }
  useEffect(() => {
    if (!lootContract || !wallet?.account) {
      return;
    }
    doQuery();
  }, [lootContract, wallet.account, retry]);

  return {
    loot,
    refresh
  };
}
