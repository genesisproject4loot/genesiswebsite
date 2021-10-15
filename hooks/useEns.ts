import { useMemo, useState } from "react";
import { useWalletContext } from "./useWalletContext";

export function useEnsLookup(address) {
  const [ensCache, setEnsCache] = useState<any>({});
  const { provider } = useWalletContext();
  useMemo(() => {
    if (!address || !provider || typeof ensCache[address] !== "undefined") {
      return;
    }
    async function doLookup() {
      try {
        const ensName = await provider.lookupAddress(address).catch(() => {
          setEnsCache({ ...ensCache, address: "" });
        });
        setEnsCache({ ...ensCache, [address]: ensName });
      } catch (e) {
        setEnsCache({ ...ensCache, address: "" });
      }
    }
    doLookup();
  }, [provider, address]);
  return {
    address: ensCache[address]
  };
}
