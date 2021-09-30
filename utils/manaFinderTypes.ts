export interface Mana {
  id: number;
  itemName: string;
  suffixId: Order;
  inventoryId: number;
  currentOwner: Wallet;
}

export interface ManaData {
  manas: Mana[];
}

export interface ManaVars {
  suffixId: string;
  inventoryId: number;
}

export interface Bag {
  id: number;
  chest: string;
  foot: string;
  hand: string;
  head: string;
  neck: string;
  ring: string;
  waist: string;
  weapon: string;
  chestSuffixId: number;
  footSuffixId: number;
  handSuffixId: number;
  headSuffixId: number;
  neckSuffixId: number;
  ringSuffixId: number;
  waistSuffixId: number;
  weaponSuffixId: number;
  manasClaimed: number;
  itemName: string;
  currentOwner: Wallet;
  manas: Mana[];
}

export interface BagVars {
  suffixId: number;
}

export interface BagData {
  bags: Bag[];
}

export interface Wallet {
  id: string;
}

export interface TokenListProps {
  data?: any[];
  name: string;
  address: string;
}

export interface Order {
  id: string;
  manasHeld: number;
}

export interface ManaByOrdersData {
  orders: Order[];
}
