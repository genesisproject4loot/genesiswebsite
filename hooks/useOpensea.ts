import { useQuery, gql } from "@apollo/client";

export function useOpenseaManaData(tokenIds: string[]) {
  const GET_OPENSEA_MANA_DATA = gql`
    query GetOpenSeaManaData($tokenIds: String) {
      queryManas(tokenIds: $tokenIds)
        @rest(
          type: "OpenSeaManaData"
          method: "GET"
          path: "/mana?tokenIds={args.tokenIds}"
        ) {
        manas {
          id
          url
          price
        }
        lastUpdate
      }
    }
  `;

  return useQuery(GET_OPENSEA_MANA_DATA, {
    variables: {
      tokenIds: (tokenIds ?? []).join(",")
    },
    context: {
      restful: true
    }
  });
}

export function useOpenseaBagsData(tokenIds: string[]) {
  const GET_OPENSEA_BAGS_DATA = gql`
    query GetOpenSeaBagsData($tokenIds: String) {
      queryBags(tokenIds: $tokenIds)
        @rest(
          type: "OpenSeaBagsData"
          method: "GET"
          path: "/bags?tokenIds={args.tokenIds}"
        ) {
        bags {
          id
          url
          price
        }
        lastUpdate
      }
    }
  `;

  return useQuery(GET_OPENSEA_BAGS_DATA, {
    variables: {
      tokenIds: (tokenIds ?? []).join(",")
    },
    context: {
      restful: true
    }
  });
}
