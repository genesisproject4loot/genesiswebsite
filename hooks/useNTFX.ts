import { useQuery, gql } from "@apollo/client";
import { useMemo, useState } from "react";
import { useSushiSwap } from "./useSushiSwap";

export function useNFTXFloorPrice() {
  const [floorPrice, setFloorPrice] = useState(0);
  const GET_NFTX_DATA = gql`
    query GetNFTxData {
      vaults(where: { vaultId: 209 }) {
        fees {
          targetRedeemFee
        }
      }
    }
  `;

  const { data: nftxData } = useQuery(GET_NFTX_DATA, {
    context: {
      nftx: true
    },
    pollInterval: 10000
  });

  const { data: sushiSwapData } = useSushiSwap();

  useMemo(() => {
    if (!nftxData || !sushiSwapData) {
      setFloorPrice(0);
      return;
    }
    setFloorPrice(
      (nftxData?.vaults[0].fees.targetRedeemFee / 1000000000000000000 + 1) *
        sushiSwapData?.token.derivedETH
    );
  }, [nftxData, sushiSwapData]);

  return { floorPrice };
}
