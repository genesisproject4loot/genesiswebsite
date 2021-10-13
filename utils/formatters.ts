import { NFTX_ADDRESS, OS_LOOT_URL, OS_MANA_URL } from "./constants";
import { Mana } from "./manaFinderTypes";

export function shortenAddress(address) {
  if (!address) return "";
  return address.slice(0, 3) + "..." + address.slice(-3);
}

export function formatOpenseaUrl(mana: Mana) {
  const isMinted = mana.id > 0;
  return isMinted
    ? `https://opensea.io/assets/${OS_MANA_URL}/${mana.id}`
    : `https://opensea.io/assets/${OS_LOOT_URL}/${mana.lootTokenId?.id}`;
}

export function formatNFTXUrl(mana: Mana) {
  return mana.currentOwner?.id?.toLowerCase() === NFTX_ADDRESS
    ? `https://nftx.io/vault/0x2d77f5b3efa51821ad6483adaf38ea4cb1824cc5/${mana.id}`
    : "";
}
