import SUFFICES from "data/suffices.json";
import INVENTORY from "data/inventory.json";

export const OS_MANA_URL = "0xf4b6040a4b1b30f1d1691699a8f3bf957b03e463";
export const OS_LOOT_URL = "0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7";
export const NFTX_ADDRESS = "0x2d77f5b3efa51821ad6483adaf38ea4cb1824cc5";
export const GM_ALL_ADDRESS = "All";
export const DAO_ADDRESSES = [
  "0x1884d71487bfd7f595061221801e783efcd0bf6a",
  "0x9bbda2777c8623d8894b21120bed1fff72b024f8",
  "0xb6b3eb3ec30bd8979df60d7f47b173a389310dd9",
  "0xc3e33b881aea922bce6df56bc2c6f0686a3a421a",
  "0xdcab536df6dd9ad5d332180edf1ba1ec71669ae2",
  "0x4cf7e239f5bc882e007d9790a7b49b4abdfeb510",
  "0x338aef050ac689246490aa75b691ac03fe0a81c8",
  "0xea0a3aae1dda17d0a17a488196801f59ca96854c",
  "0x1f5fe23574d5aec1660a8c6b209135da5723042f",
  "0xd431a116a7d0eca9371614d5652cdfffb7c5b6eb",
  "0x0780529f0ecfac1048d2faae5007fe62ce318c79",
  "0xf935c944a8e03181ae3229774d4b93d7bba816d4",
  "0xaba619a78032abcfe0346c1592835df563ba3bfa",
  "0xe1e5072fc1ff1a419d17bf9b5c5b6ddd12c19f08",
  "0x17498d27433849a510165cc1fc618582ac54229b",
  "0xb1dea25cb8b997913f86076b372aa75f06c53c99"
];
export const GM_SORT_OPTIONS = [
  {
    value: "price_asc",
    key: "price",
    direction: "ascending",
    label: "Price: Low to High"
  },
  {
    value: "price_desc",
    key: "price",
    direction: "descending",
    label: "Price: High to Low"
  },
  {
    value: "rarity_desc",
    key: "rarity",
    direction: "descending",
    label: "Rarity: High to Low"
  }
];

export const GM_VIEW_OPTIONS = [
  {
    value: "grid",
    label: "Grid"
  },
  {
    value: "list",
    label: "List"
  }
];

export { SUFFICES, INVENTORY };
