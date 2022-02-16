import {
  NFTX_MANA_ADDRESS,
  NFTX_LOOT_ADDRESS,
  OS_LOOT_URL,
  OS_MANA_URL
} from "./constants";
import { Mana } from "./manaFinderTypes";

export function shortenAddress(address) {
  if (!address) return "";
  return address.slice(0, 6) + "..." + address.slice(-4);
}

export function formatOpenseaUrl(mana: Mana) {
  const isMinted = mana.id > 0;
  return isMinted
    ? `https://opensea.io/assets/${OS_MANA_URL}/${mana.id}`
    : `https://opensea.io/assets/${OS_LOOT_URL}/${mana.lootTokenId}`;
}

export function formatNFTXUrl(mana: Mana) {
  const owner = mana.currentOwner?.id?.toLowerCase();
  if (owner === NFTX_MANA_ADDRESS) {
    return `https://nftx.io/vault/${owner}/${mana.id}`;
  } else if (owner === NFTX_LOOT_ADDRESS) {
    return `https://nftx.io/vault/${owner}/${mana?.lootTokenId}`;
  }
  return "";
}
