export interface Mana {
  id: number;
  itemName: string;
  currentOwner: Wallet;
}

export interface ManaData {
  manas: Mana[];
}

export interface ManaVars {
  suffixId: number;
  inventoryId: number;
}

export interface Bag {
  id: number;
  manasClaimed: number;
  itemName: string;
  currentOwner: Wallet;
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
