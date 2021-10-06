// https://github.com/lootexchange/lootexchange/blob/main/apps/web/data/loot.json
import lootData from "data/loot-data.json";

type LootData = {
  characterImage: string;
  chest: string;
  foot: string;
  hand: string;
  head: string;
  id: string;
  image: string;
  neck: string;
  ring: string;
  waist: string;
  weapon: string;
  name: string;
  tokenId: string;
};

export function useLootById(lootId: string) {
  const lootMap = {} as { [key: string]: LootData };
  if (lootMap[lootId]) {
    return lootMap[lootId];
  }
  lootMap[lootId] = (lootData as LootData[]).find((loot) => loot.id === lootId);
  return lootMap[lootId];
}
