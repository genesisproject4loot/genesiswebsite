import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import atimeABI from "data/atime-abi.json";
import { useWalletContext } from "./useWalletContext";

export const ATIME_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ATIME_CONTRACT_ADDRESS ??
  "0x810f86eb43ccaacd401ef50dfab87945a514f9cf";
export function useAtimeContract() {
  const wallet = useWalletContext();
  const [atimeContract, setAtimeContract] = useState<ethers.Contract>();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!wallet?.signer) {
      return;
    }
    const contract = new ethers.Contract(
      ATIME_CONTRACT_ADDRESS,
      atimeABI,
      wallet?.signer
    );
    setAtimeContract(contract);
    setLastUpdated(new Date());
  }, [wallet?.signer]);

  function updateLastUpdated() {
    setTimeout(() => {
      setLastUpdated(new Date());
    }, 1000);
  }
  async function claimAllForOwner() {
    const transaction = await atimeContract.claimAllForOwner();
    await transaction.wait();
    updateLastUpdated();
    return transaction;
  }

  async function claimById(tokenId) {
    if (!atimeContract) return;

    const transaction = await atimeContract.claimById(tokenId);
    await transaction.wait();
    updateLastUpdated();
    return transaction;
  }

  async function getBalance() {
    if (!atimeContract) return 0;
    const balance = await atimeContract.balanceOf(wallet?.account);
    return parseFloat(parseFloat(ethers.utils.formatUnits(balance)).toFixed(4));
  }

  async function getAtimePerToken() {
    if (!atimeContract) return;

    const amount = await atimeContract.adventureTimePerTokenId();
    return parseFloat(parseFloat(ethers.utils.formatUnits(amount)).toFixed(4));
  }

  async function seasonClaimed(season, tokenId) {
    if (!atimeContract) return true;

    const result = await atimeContract.seasonClaimedByTokenId(
      parseInt(season),
      parseInt(tokenId)
    );

    return result;
  }

  async function getSeason() {
    if (!atimeContract) return 0;

    const season = await atimeContract.season();
    return parseInt(season);
  }

  return {
    lastUpdated,
    atimeContract,
    getAtimePerToken,
    getSeason,
    getBalance,
    claimAllForOwner,
    claimById,
    seasonClaimed
  };
}

export function useAtime() {
  const {
    lastUpdated,
    claimAllForOwner,
    claimById,
    getBalance,
    getSeason,
    getAtimePerToken,
    seasonClaimed
  } = useAtimeContract();
  const [balance, setBalance] = useState(0);
  const [amountPerToken, setAmountPerToken] = useState(0);
  const [season, setSeason] = useState(0);

  useEffect(() => {
    getBalance().then(setBalance);
    getSeason().then(setSeason);
    getAtimePerToken().then(setAmountPerToken);
  }, [lastUpdated]);

  return {
    lastUpdated,
    claimAllForOwner,
    claimById,
    balance,
    amountPerToken,
    season,
    seasonClaimed
  };
}

export function useAtimeSeasonClaimed(tokenId) {
  const { lastUpdated, season, seasonClaimed, claimById, amountPerToken } =
    useAtime();
  const [isClaimed, setIsClaimed] = useState(true);

  useEffect(() => {
    if (!tokenId) return;
    seasonClaimed(season, tokenId).then((value) => {
      setIsClaimed(!!value);
    });
  }, [lastUpdated, season, tokenId]);

  return {
    claimById: async (tokenId) => {
      await claimById(tokenId);
      setIsClaimed(true);
    },
    isClaimed,
    amountPerToken
  };
}
