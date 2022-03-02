import { gql, useQuery } from "@apollo/client";

export function useLostManaNames(variables, skip?: boolean) {
  const GET_UNCLAIMED_MANA = gql`
      query LostManaNames(${Object.keys(variables)
        .map((key) => `$${key}: ${getTypeForKey(variables, key)}`)
        .join(", ")}) {
        lostManaNames(
          where: {  ${Object.keys(variables)
            .map((key) => `${key}: $${key}`)
            .join(", ")} },
            orderBy: itemRating,
            orderDirection: desc
        ) {
          id
          total
          available
          lootTokenId
          inventoryId
          orderId
          itemName
          itemGreatness
          itemClass
          itemLevel
          itemRating
          orderId
        }
      }
      `;

  return useQuery<any, any>(GET_UNCLAIMED_MANA, {
    variables,
    skip: !!skip
  });
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
