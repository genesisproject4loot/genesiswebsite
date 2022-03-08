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
          setEnsCache({ ...ensCache, [address]: "" });
        });
        setEnsCache({ ...ensCache, [address]: ensName });
      } catch (e) {
        setEnsCache({ ...ensCache, [address]: "" });
      }
    }
    doLookup();
  }, [provider, address]);
  return {
    ensName: ensCache[address]
  };
}

export function useEnsResolve(ensName) {
  const [ensCache, setEnsCache] = useState<any>({});
  const { provider } = useWalletContext();
  useMemo(() => {
    if (!ensName) {
      return;
    }
    if (ensName.indexOf(".eth") < 0) {
      setEnsCache({ ...ensCache, [ensName]: ensName });
      return;
    }
    if (!provider || typeof ensCache[ensName] !== "undefined") {
      return;
    }
    async function doResolve() {
      try {
        const address = await provider.resolveName(ensName).catch(() => {
          setEnsCache({ ...ensCache, [ensName]: "" });
        });
        setEnsCache({ ...ensCache, [ensName]: address });
      } catch (e) {
        setEnsCache({ ...ensCache, [ensName]: "" });
      }
    }
    doResolve();
  }, [provider, ensName]);
  return {
    address: ensCache[ensName]
  };
}
