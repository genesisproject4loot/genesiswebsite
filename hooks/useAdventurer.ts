import { useQuery, gql } from "@apollo/client";
import { Order } from "@utils/manaFinderTypes";

export function useAdventurerCountByOrders() {
  return useQuery<{ orders: Order[] }>(gql`
    query AdventurersCountByOrders {
      orders(orderBy: id) {
        id
        adventurersHeld
      }
    }
  `);
}

export function useAdventurerLeaderBoard() {
  return useQuery(gql`
    query AdventurerLeaderBoard {
      wallets(orderBy: adventurersHeld, orderDirection: desc) {
        id
        adventurersHeld
        adventurers {
          suffixId {
            id
          }
        }
      }
    }
  `);
}

function getType(value) {
  let type = typeof value;
  if (type === "number") return "Int";
  else return "String";
}
function getTypeForKey(obj, key) {
  if (Array.isArray(obj[key])) return `[${getType(obj[key][0])}]!`;
  return `${getType(obj[key])}!`;
}

export function useAdventurerRawQuery(variables, skip?: boolean) {
  return useQuery<any, any>(
    gql`
    query GetAdventurer(${Object.keys(variables)
      .map((key) => `$${key}: ${getTypeForKey(variables, key)}`)
      .join(", ")}) {
          adventurers(
        where: {  ${Object.keys(variables)
          .map((key) => `${key}: $${key}`)
          .join(", ")} }
      ) {
        id
        tokenURI
      }
    }
  `,
    {
      variables,
      skip: !!skip
    }
  );
}
