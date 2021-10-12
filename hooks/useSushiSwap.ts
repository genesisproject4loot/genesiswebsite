import { useQuery, gql } from "@apollo/client";

export function useSushiSwap() {
  const GET_SUSHI_SWAP_DATA = gql`
    query GetSushiSwapData {
      token(id: "0x2d77f5b3efa51821ad6483adaf38ea4cb1824cc5") {
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
