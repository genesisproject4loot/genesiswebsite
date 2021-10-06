import { gql, useQuery } from "@apollo/client";
import type {
  BagData,
  BagVars,
  ManaData,
  ManaVars,
  ManaByOrdersData
} from "@utils/manaFinderTypes";
import inventory from "@data/inventory.json";

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

export function useClaimedMana(suffixId, inventoryId) {
  const GET_CLAIMED_MANA = gql`
    query GetClaimedMana($suffixId: String!, $inventoryId: Int!) {
      manas(
        where: {
          suffixId: $suffixId
          inventoryId: $inventoryId
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
          ]
        }
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

export function useUnclaimedManaByOwner(currentOwner: String) {
  const GET_UNCLAIMED_MANA_BY_OWNER = gql`
    query GetUnclaimedMana($currentOwner: String!) {
      bags(where: { manasClaimed: 0, currentOwner: $currentOwner }) {
        id
        manasClaimed
        ${inventory.map((item) => item.label.toLowerCase()).join("\n")}
        ${inventory.map((item) => `${item.label.toLowerCase()}SuffixId`).join("\n")}
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
      orders (orderBy: id) {
        id
        manasHeld
      }
    }
  `;
  return useQuery<ManaByOrdersData>(
    GET_MANA_COUNT_BY_ORDERS
  );
}