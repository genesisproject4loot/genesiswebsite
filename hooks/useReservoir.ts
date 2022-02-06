import { useMemo, useState } from "react";

const RESERVOIR_COLLECTION_API =
  "https://mainnet-api-v4.reservoir.tools/tokens/floor?collection=";
const PRICE_POLLING_INTERVAL = 60000;

export function useCollectionPricing(collection) {
  const [priceByTokenId, setPriceByTokenId] = useState({});
  const [refresh, setRefresh] = useState(0);

  useMemo(async () => {
    const resp = await fetch(RESERVOIR_COLLECTION_API + collection);
    const result = await resp.json();
    if (result?.tokens) {
      setPriceByTokenId(result?.tokens);
    }
    setTimeout(() => setRefresh(refresh + 1), PRICE_POLLING_INTERVAL);
  }, [collection, refresh]);

  return { priceByTokenId };
}
