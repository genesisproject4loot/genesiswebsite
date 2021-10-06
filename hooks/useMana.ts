import { gql, useQuery } from "@apollo/client";
import type {
  BagData,
  BagVars,
  ManaData,
  ManaVars,
  ManaByOrdersData
} from "@utils/manaFinderTypes";
import inventory from "@data/inventory.json";
import { useWalletContext } from "./useWalletContext";
import { useMemo, useState } from "react";
import { useLootById, useLootContract } from "./useLoot";
import { ethers } from "ethers";
import suffices from "data/suffices.json";

const EXCLUDE_OWNERS = `
currentOwner_not_in: [
  "0x1884d71487bfd7f595061221801e783efcd0bf6a"
  "0x9bbda2777c8623d8894b21120bed1fff72b024f8"
  "0xb6b3eb3ec30bd8979df60d7f47b173a389310dd9"
  "0xc3e33b881aea922bce6df56bc2c6f0686a3a421a"
  "0xdcab536df6dd9ad5d332180edf1ba1ec71669ae2"
  "0x4cf7e239f5bc882e007d9790a7b49b4abdfeb510"
  "0x338aef050ac689246490aa75b691ac03fe0a81c8"
  "0xea0a3aae1dda17d0a17a488196801f59ca96854c"
  "0x1f5fe23574d5aec1660a8c6b209135da5723042f"
  "0xd431a116a7d0eca9371614d5652cdfffb7c5b6eb"
  "0x0780529f0ecfac1048d2faae5007fe62ce318c79"
  "0xf935c944a8e03181ae3229774d4b93d7bba816d4"
  "0xaba619a78032abcfe0346c1592835df563ba3bfa"
  "0xe1e5072fc1ff1a419d17bf9b5c5b6ddd12c19f08"
  "0x17498d27433849a510165cc1fc618582ac54229b"
  "0xb1dea25cb8b997913f86076b372aa75f06c53c99"
]`;

export function useUnclaimedMana(suffixId, inventoryId) {
  const inventoryName =
    inventoryId >= 0 ? inventory[inventoryId].label.toLowerCase() : "weapon";
  const inventoryNameSuffix = inventoryName + "SuffixId";

  const GET_UNCLAIMED_MANA = gql`
    query GetUnclaimedMana($suffixId: Int!) {
      bags(where: {manasClaimed: 0, ${inventoryNameSuffix}: $suffixId}) {
        id
        itemName: ${inventoryName}
        currentOwner {
          id
        }
      }
    }
    `;

  return useQuery<BagData, BagVars>(GET_UNCLAIMED_MANA, {
    variables: { suffixId: suffixId }
  });
}

export function useClaimedManaByOwner(owner: String) {
  const GET_CLAIMED_MANA = gql`
    query GetClaimedMana($currentOwner: String!) {
      manas(where: { currentOwner: $currentOwner, ${EXCLUDE_OWNERS} }) {
        id
        itemName
        currentOwner {
          id
        }
      }
    }
  `;
  return useQuery<ManaData, { currentOwner: String }>(GET_CLAIMED_MANA, {
    variables: { currentOwner: owner }
  });
}

export function useClaimedMana(suffixId, inventoryId) {
  const GET_CLAIMED_MANA = gql`
    query GetClaimedMana($suffixId: String!, $inventoryId: Int!) {
      manas(
        where: { suffixId: $suffixId, inventoryId: $inventoryId ${EXCLUDE_OWNERS} }
      ) {
        id
        itemName
        currentOwner {
          id
        }
      }
    }
  `;
  return useQuery<ManaData, ManaVars>(GET_CLAIMED_MANA, {
    variables: { suffixId: String(suffixId), inventoryId: inventoryId }
  });
}

export function useManaBagsByOwner(currentOwner: String) {
  const GET_UNCLAIMED_MANA_BY_OWNER = gql`
    query GetUnclaimedMana($currentOwner: String!) {
      bags(where: { currentOwner: $currentOwner }) {
        id
        manasClaimed
        ${inventory.map((item) => item.label.toLowerCase()).join("\n")}
        ${inventory
          .map((item) => `${item.label.toLowerCase()}SuffixId`)
          .join("\n")}
        manas {
          id
          suffixId {
            id
          }
          itemName
          inventoryId
        }
        currentOwner {
          id
        }
      }
    }
  `;

  return useQuery<BagData, { currentOwner: String }>(
    GET_UNCLAIMED_MANA_BY_OWNER,
    {
      variables: { currentOwner: currentOwner?.toLowerCase() }
    }
  );
}

export function useManaCountByOrders() {
  const GET_MANA_COUNT_BY_ORDERS = gql`
    query GetManaCountByOrders {
      orders(orderBy: id) {
        id
        manasHeld
      }
    }
  `;
  return useQuery<ManaByOrdersData>(GET_MANA_COUNT_BY_ORDERS);
}

export function useManaFromWallet() {
  const wallet = useWalletContext();
  const [manaBags, setManaBags] = useState<any[]>([]);
  const [retry, setRetry] = useState(0);
  const { lootContract } = useLootContract();

  async function doQuery() {
    const filterTo = lootContract.filters.Transfer(
      null,
      wallet.account.toString()
    );
    try {
      const events = await lootContract.queryFilter(filterTo);
      const bags = [];
      for (let i = 0; i < events.length; i++) {
        const tokenId = ethers.BigNumber.from(events[i].topics[3]);
        const bag = useLootById(String(tokenId));
        const manaBag = transformBag(bag);
        manaBag.id = bag.id;
        manaBag.currentOwner = {id:wallet.account}
        manaBag.manas = [];
        manaBag.manasClaimed = 0;
        bags.push(manaBag);
      }
      setManaBags(bags);
    } catch (e) {
      console.log(e);
    }
  }
  function refetch() {
    setRetry(retry + 1);
  }
  useMemo(() => {
    if (!lootContract || !wallet?.account) {
      return;
    }
    doQuery();
  }, [lootContract, wallet.account, retry]);

  return {
    data: { bags: manaBags},
    refetch
  };
}



const INVENTORY = [
  "weapon",
  "chest",
  "head",
  "waist",
  "foot",
  "hand",
  "neck",
  "ring"
];

function extractOrder(text) {
  return (text.match(/.*of\s(the\s)?([a-zA-z]+).*/) ?? [])[2];
}

function findOrder(orderLabel) {
    return Number(
        (
          suffices.find(
            (order) =>
              order.label.toLowerCase().indexOf(orderLabel.toLowerCase()) > -1
          ) ?? { value: "0" }
        ).value
      )
}

function transformBag(bag) {
  const mana = { id: bag.id } as any;
  for (let i = 0; i < INVENTORY.length; i++) {
    const name = INVENTORY[i];
    const orderLabel = extractOrder(bag[name]) as String;
    mana[name] = bag[name];
    mana[`${name}SuffixId`] = orderLabel ? findOrder(orderLabel) : 0;
  }
  return mana;
}