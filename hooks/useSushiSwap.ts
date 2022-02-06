import { useQuery, gql } from "@apollo/client";

export function useSushiSwap(contract) {
  const GET_SUSHI_SWAP_DATA = gql`
    query GetSushiSwapData {
      token(id: "${contract}") {
        derivedETH
      }
    }
  `;

  return useQuery(GET_SUSHI_SWAP_DATA, {
    context: {
      sushiswap: true
    }
  });
}
