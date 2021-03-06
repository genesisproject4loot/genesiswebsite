import { useState, useEffect } from "react";
import { ethers } from "ethers";
import manaABI from "data/genesismana-abi.json";
import { useWalletContext } from "./useWalletContext";
import { Mana } from "@utils/manaFinderTypes";

export const GM_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GM_CONTRACT_ADDRESS ??
  "0xf4B6040A4b1B30f1d1691699a8F3BF957b03e463";
export function useManaContract() {
  const wallet = useWalletContext();
  const [manaContract, setManaContract] = useState<ethers.Contract>();
  useEffect(() => {
    if (!wallet?.signer) {
      return;
    }
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

export type ManaContractMinter = {
  mintMana: (mana: Mana) => void;
  isManaMintSuccessful: (mana: Mana) => boolean;
  isManaMintInProgress: (mana: Mana) => boolean;
  getTokenId: (mana: Mana) => number;
};

export function useManaContractMinter(): ManaContractMinter {
  const { mintMana } = useManaContract();
  const [mintsInProgress, setMintsInProgress] = useState<any[]>([]);
  const [successFulMints, setSuccessFulMints] = useState<any>({});

  function isManaMintInProgress(mana) {
    return mintsInProgress.includes(getManaMintKey(mana));
  }

  function isManaMintSuccessful(mana) {
    return !!successFulMints[getManaMintKey(mana)];
  }
  function getManaMintKey(mana) {
    return [mana.lootTokenId, mana.inventoryId].join("-");
  }

  async function onMintMana(mana): Promise<any> {
    if (isManaMintInProgress(getManaMintKey(mana))) {
      return;
    }
    setMintsInProgress([...mintsInProgress, getManaMintKey(mana)]);
    try {
      const transaction = await mintMana(
        mana.lootTokenId,
        mana.inventoryId + 1
      );
      const done = await transaction.wait();
      const tokenId = done?.events[0]?.topics[3];
      setTimeout(async () => {
        setSuccessFulMints({
          ...successFulMints,
          [getManaMintKey(mana)]: Number(tokenId)
        });
        setMintsInProgress(
          mintsInProgress.filter((id) => id !== getManaMintKey(mana))
        );
        //TODO add success callback
      }, 1000);
      return tokenId;
    } catch (e) {
      e = e?.error ?? e;
      setMintsInProgress(
        mintsInProgress.filter((id) => id !== getManaMintKey(mana))
      );
      //TODO add error callback
      alert(e?.data?.message ?? e?.message ?? "Error");
    }
  }

  function getTokenId(mana: Mana) {
    return successFulMints[getManaMintKey(mana)] ?? mana?.id;
  }

  return {
    mintMana: onMintMana,
    isManaMintSuccessful,
    isManaMintInProgress,
    getTokenId
  };
}
