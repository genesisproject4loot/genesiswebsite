export interface Mana {
  id: number;
  itemName: string;
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

export interface Order {
  id: number;
  manasHeld: number;
}

export interface ManaByOrdersData {
  orders: Order[];
}
