import { useQuery, gql } from "@apollo/client";
import { useMemo, useState } from "react";
import { useSushiSwap } from "./useSushiSwap";

const PRICE_POLLING_INTERVAL = 60000;

export function useNFTXFloorPrice(contract) {
  const [floorPrice, setFloorPrice] = useState(0);
  const GET_NFTX_DATA = gql`
    query GetNFTxData {
      vaults(where: { id: "${contract}" }) {
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
    pollInterval: PRICE_POLLING_INTERVAL
  });

  const { data: sushiSwapData } = useSushiSwap(contract);

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
