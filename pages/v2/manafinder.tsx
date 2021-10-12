import React, { ReactElement, useState, useEffect, useMemo } from "react";
import GenesisManaChart from "@components/charts/GenesisManaChart";
import Layout_V2 from "@components/Layout_V2";
import { useManaBagsByOwner, useClaimedManaRawQuery } from "hooks/useMana";
import {
  DAO_ADDRESSES,
  NFTX_ADDRESS,
  OPENSEA_ADDRESS,
  SUFFICES,
  INVENTORY
} from "utils/constants";
import { useWalletContext } from "hooks/useWalletContext";
import { Modal } from "components/Modal";
import Select from "react-select";
import PlusIcon from "components/icons/PlusIcon";
import { Mana, Wallet } from "@utils/manaFinderTypes";
import { rarityColor, rarityDescription } from "loot-rarity";
import {
  formatNFTXUrl,
  formatOpenseaUrl,
  shortenAddress
} from "@utils/formatters";
import { useDebounce } from "usehooks-ts";
import { CheckIcon } from "@components/icons";
import { useNFTXFloorPrice } from "hooks/useNTFX";
import { useOpenseaBagsData, useOpenseaManaData } from "hooks/useOpensea";
import styles from "@styles/pages/ManafinderV2.module.scss"; // Styles

export default function Home_V2(): ReactElement {
  const { account } = useWalletContext();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMana, setSelectedMana] = useState<Mana[]>([]);
  const [wallets, setWallets] = useState<String[]>([]);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [adventureCardTop, setAdventureCardTop] = useState(60);
  const debouncedAdventureCardTop = useDebounce<number>(adventureCardTop, 1);

  useEffect(() => {
    if (!account) return;

    setWallets([account.toLowerCase(), NFTX_ADDRESS, OPENSEA_ADDRESS]);
  }, [account]);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setAdventureCardTop(position > 500 ? position - 500 + 20 : 20);
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setSelectedMana([]);
  }, [selectedOrder]);

  function onSelectManaCard(mana: Mana) {
    const foundIdx = selectedMana.findIndex(
      (selected) => selected.inventoryId === mana.inventoryId
    );

    if (foundIdx === -1) {
      setSelectedMana([...selectedMana, mana]);
    } else {
      const found = selectedMana[foundIdx];
      const newSelectedMana = [...selectedMana];
      newSelectedMana.splice(foundIdx, 1);
      if (
        found.lootTokenId?.id === mana.lootTokenId?.id &&
        found.id === mana.id
      ) {
        setSelectedMana(newSelectedMana);
      } else {
        setSelectedMana([...newSelectedMana, mana]);
      }
    }
  }

  function onAddWallet(wallet: string) {
    if (!wallet) {
      alert("Invalid Wallet");
    } else if (wallets.includes(wallet)) {
      setTabIdx(wallets.findIndex((item) => wallet === item));
    } else {
      const updated = [...wallets, wallet];
      setWallets(updated);
      setTabIdx(updated.length - 1);
    }
    setIsAddWalletModalOpen(false);
  }

  function onRemoveWallet(wallet: string) {
    const updated = [
      account.toLowerCase(),
      NFTX_ADDRESS,
      OPENSEA_ADDRESS,
      ...wallets
        .slice(2)
        .filter((item) => item?.toLowerCase() !== wallet?.toLowerCase())
    ];
    setWallets(updated);
    if (updated.length >= tabIdx) {
      setTimeout(() => {
        setTabIdx(updated.length - 1);
      }, 100);
    }
  }

  return (
    <Layout_V2>
      <div className={styles.manafinder__app}>
        <GenesisManaHeader />
        <div className={styles.main}>
          <GenesisManaFilters
            onOrderSelect={setSelectedOrder}
            selectedOrder={selectedOrder}
          />
          <div className={styles.builder}>
            <div className={styles.finder}>
              <div className={styles.gm_tabs}>
                <QueryTabs
                  wallets={wallets}
                  tabIdx={tabIdx}
                  onChange={setTabIdx}
                  onAddWalletClick={() => {
                    setIsAddWalletModalOpen(true);
                  }}
                  onRemoveWallet={onRemoveWallet}
                />
              </div>
              <div className={styles.gm_results}>
                <GenesisManaCards
                  address={wallets[tabIdx] as string}
                  orderId={selectedOrder?.value}
                  onSelect={onSelectManaCard}
                  wallets={
                    wallets.filter(
                      (wallet) => wallet !== OPENSEA_ADDRESS
                    ) as string[]
                  }
                />
              </div>
            </div>
            <GenesisAdventurerCard
              className={styles.ga}
              style={{ top: debouncedAdventureCardTop }}
              orderId={selectedOrder?.value}
              selectedManas={selectedMana}
            />
          </div>
        </div>
        <AddWalletModal
          key={new Date().getTime()}
          isOpen={isAddWalletModalOpen}
          onClose={() => {
            setIsAddWalletModalOpen(false);
          }}
          onAdd={onAddWallet}
        />
      </div>
    </Layout_V2>
  );
}

function GenesisManaHeader() {
  return (
    <div className={styles.hdr}>
      <h1>Genesis Mana Finder</h1>
      <div className={styles.chart}>
        <GenesisManaChart />
      </div>
    </div>
  );
}

function GenesisManaFilters({ onOrderSelect, selectedOrder }) {
  return (
    <div className={styles.filters}>
      <label>Select an Order: </label>
      <Select
        placeholder="Choose an Order"
        value={selectedOrder}
        isClearable={true}
        onChange={onOrderSelect}
        className="w-60"
        options={[...SUFFICES]}
      />
    </div>
  );
}

function QueryTabs({
  tabIdx,
  onChange,
  wallets,
  onAddWalletClick,
  onRemoveWallet
}) {
  const { account } = useWalletContext();

  function displayTab(wallet) {
    if (wallet?.toLowerCase() === account?.toLowerCase()) {
      return "My Wallet";
    } else if (wallet?.toLowerCase() === NFTX_ADDRESS?.toLowerCase()) {
      return "NFTx";
    } else if (wallet == OPENSEA_ADDRESS) {
      return OPENSEA_ADDRESS;
    }
    return (
      <span>
        {shortenAddress(wallet)}{" "}
        <span
          className="cursor-pointer"
          onClick={() => {
            onRemoveWallet(wallet);
          }}
        >
          (x)
        </span>
      </span>
    );
  }

  return (
    <ul className={styles.wallets}>
      {wallets.map((wallet, idx) => (
        <li
          key={wallet as string}
          className={idx === tabIdx ? "border-b text-black" : "text-gray-300"}
          onClick={() => onChange(idx)}
        >
          {displayTab(wallet)}
        </li>
      ))}
      <li>
        <button className="flex items-center" onClick={onAddWalletClick}>
          <PlusIcon />
        </button>
      </li>
    </ul>
  );
}

function useManaWithPricing({ address, orderId, wallets }) {
  const { floorPrice: nftxFloorPrice } = useNFTXFloorPrice();
  const isOpenseaQuery = OPENSEA_ADDRESS === address;
  const { data: bagData } = useManaBagsByOwner(address);
  const { data: openSeaBagData } = useOpenseaBagsData(
    bagData?.bags?.map((bag) => String(bag.id)) ?? []
  );
  const claimedQuery: any = {
    suffixId: orderId,
    lootTokenId_gt: "0",
    currentOwner_not_in: [
      ...DAO_ADDRESSES,
      ...(isOpenseaQuery && wallets ? wallets : [])
    ]
  };
  if (!isOpenseaQuery) {
    claimedQuery.currentOwner = address;
  }
  const { data: claimedData } = useClaimedManaRawQuery(claimedQuery);
  const { data: openSeaManaData } = useOpenseaManaData(
    claimedData?.manas?.map((mana) => String(mana.id)) ?? []
  );
  const applyFilters = (mana) => {
    if (!orderId) {
      return false;
    }
    return mana?.suffixId?.id == orderId;
  };

  const mapOpenseaManaPricing = (mana) => {
    return {
      ...mana,
      price: isNFTX(mana)
        ? nftxFloorPrice
        : openSeaManaData?.queryManas?.manas?.find(
            (item) => item.id == mana?.id
          )?.price || undefined
    };
  };

  const mapOpenseaBagPricing = (mana) => {
    return {
      ...mana,
      price:
        openSeaBagData?.queryBags?.bags?.find(
          (bag) => bag.id == mana?.lootTokenId?.id
        )?.price || undefined
    };
  };

  const manas = (claimedData?.manas ?? [])
    .map(mapOpenseaManaPricing)
    .concat(
      (bagData?.bags ?? [])
        .map(transformUnclaimedMana)
        .flat()
        .map(mapOpenseaBagPricing)
    )
    .filter(applyFilters);

  const {
    items: sortedMana
    // requestSort,
    // sortConfig
  } = useSortableData(manas, { key: "price", direction: "ascending" });
  return { manas: sortedMana };
}

type GenesisManaCardsProps = {
  address: string;
  orderId: string;
  onSelect: (mana: Mana) => void;
  wallets?: string[];
};
function GenesisManaCards({
  address,
  orderId,
  onSelect,
  wallets
}: GenesisManaCardsProps): ReactElement {
  const { account } = useWalletContext();
  const canMint = (owner) => account?.toLowerCase() === owner?.toLowerCase();
  const { manas } = useManaWithPricing({ address, orderId, wallets });
  const truthy = [true, true, true, true, true, true, true, true];
  const falsy = [false, false, false, false, false, false, false, false];

  const [collapsed, setCollapsed] = useState([...falsy]);
  const onCollapseAll = () => setCollapsed([...truthy]);
  const onExpandAll = () => setCollapsed([...falsy]);

  const onToggleExpand = (selectedIdx) =>
    setCollapsed([
      ...collapsed.map((val, idx) => (idx === selectedIdx ? !val : val))
    ]);

  return (
    <div className={styles.ctr}>
      <div className={styles.controls}>
        <span onClick={onExpandAll}>Expand All (+)</span>{" "}
        <span onClick={onCollapseAll}>Collapse All (-)</span>
      </div>
      {INVENTORY.map((item, idx) => {
        const row = manas.filter(
          (mana) => mana.inventoryId == parseInt(item.value)
        );
        return (
          <div key={item.value} className={styles.inventory_row}>
            <h1
              className={row.length == 0 ? "text-gray-400" : ""}
              onClick={() => onToggleExpand(idx)}
            >
              <span>{collapsed[idx] ? "+" : "-"}</span>
              {idx + 1}. {item.label} ({row.length}){" "}
              <span className={styles.line}></span>
            </h1>
            <div className="flex gap-4 overflow-x-scroll">
              {collapsed[idx]
                ? null
                : row.map((mana) => (
                    <GenesisManaCard
                      onClick={() => {
                        onSelect(mana);
                      }}
                      key={`${idx}-${mana.itemName}-${mana.lootTokenId?.id}}-`}
                      mana={mana}
                      canMint={canMint(mana.currentOwner?.id)}
                    />
                  ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function isNFTX(mana: Mana) {
  return mana?.currentOwner?.id?.toLowerCase() === NFTX_ADDRESS;
}

function ExternalManaLink({ mana, text }: { mana: Mana; text: String }) {
  const openseaUrl = formatOpenseaUrl(mana);
  const nftxUrl = formatNFTXUrl(mana);
  const url = nftxUrl || openseaUrl;
  return (
    <a
      className="underline text-right"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
    </a>
  );
}

interface GenesisManaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  mana: Mana;
  canMint: boolean;
}

function GenesisManaCard({
  mana,
  canMint,
  onClick,
  ...props
}: GenesisManaCardProps): ReactElement {
  const inventoryLabel = INVENTORY.find(
    (item) => String(mana.inventoryId) === item.value
  ).label;
  const isArmor = [0, 7].indexOf(mana.inventoryId) === -1;
  const isMinted = mana.id > 0;
  const showMint = canMint && !isMinted;
  const order = SUFFICES.find(
    (suffix) => suffix.value === String(mana.suffixId.id)
  ).label;

  const openseaUrl = formatOpenseaUrl(mana);
  const nftxUrl = formatNFTXUrl(mana);
  return (
    <div {...props} className={styles.gm_card_ctr}>
      <div className={[styles.card, `bg-gm-${mana.suffixId.id}`].join(" ")}>
        <div className="flex-1 cursor-pointer" onClick={onClick}>
          <div>Order: {order}</div>
          <div>
            Equipment Type: {inventoryLabel} {isArmor ? "Armor" : ""}
          </div>
        </div>
        <div>
          <div>Distilled from Loot Bag #{mana?.lootTokenId?.id}</div>
          <div>{mana.itemName}</div>
        </div>
      </div>
      <div className="pt-2">
        {showMint && <button className={styles.mint}>mint</button>}
        <div className={styles.details}>
          {isMinted && (
            <>
              <label>Id </label>
              <span className="text-right">#{mana.id}</span>
            </>
          )}
          <label>Order </label>
          <span className="text-right">{order}</span>
          <label>{rarityDescription(mana.itemName)} </label>
          <span className={styles.rarity_indicator}>
            <span style={{ backgroundColor: rarityColor(mana.itemName) }} />
          </span>

          <label>{mana.price > 0 ? `${mana.price.toFixed(3)} ♦` : ""}</label>
          <div className="flex gap-2">
            {nftxUrl?.length > 0 && (
              <a
                className="underline text-right"
                href={nftxUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                NTFx
              </a>
            )}
            <a
              className="underline text-right"
              href={openseaUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Opensea
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function transformUnclaimedMana(bag) {
  const unclaimedInventory = INVENTORY.filter(
    (item) =>
      bag[`${item.label.toLowerCase()}SuffixId`] > 0 &&
      !bag.manas.find((mana) => mana.inventoryId == parseInt(item.value))
  );
  const inventoryToMana = (item) =>
    ({
      id: 0,
      itemName: bag[item.label.toLowerCase()] as string,
      inventoryId: parseInt(item.value) as number,
      suffixId: {
        id: bag[item.label.toLowerCase() + "SuffixId"] as string
      },
      lootTokenId: { id: bag.id },
      currentOwner: bag.currentOwner as Wallet
    } as any);

  return unclaimedInventory.map(inventoryToMana);
}

interface GenesisAdventurerCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orderId?: string;
  selectedManas: Mana[];
}
function GenesisAdventurerCard({
  selectedManas,
  orderId,
  ...props
}: GenesisAdventurerCardProps): React.ReactElement {
  const { account } = useWalletContext();
  let manas = INVENTORY.map((item) =>
    selectedManas.find((mana) => mana.inventoryId === parseInt(item.value))
  );

  function AccessoryItem({ mana }: { mana: Mana }) {
    //Owned By Current Wallet
    if (mana.currentOwner?.id?.toLowerCase() === account?.toLowerCase()) {
      //Already Minted
      if (mana.id > 0) {
        return <CheckIcon className="text-green-200" />;
      }
      //Allow mint
      else {
        return <button>Mint</button>;
      }
    }
    //Don't own
    return (
      <ExternalManaLink
        mana={mana}
        text={mana.price > 0 ? `${mana.price.toFixed(3)} ♦` : "buy"}
      />
    );
  }
  return (
    <div {...props}>
      <ul className={styles.card}>
        {manas.map((mana, idx) => (
          <li className={styles.item} key={idx}>
            {mana?.itemName ? (
              <>
                <span className="flex-1">
                  <span>{idx + 1}.</span> {mana.itemName}
                </span>{" "}
                <span>
                  <AccessoryItem mana={mana} />
                </span>
              </>
            ) : (
              <>
                <span>{idx + 1}.</span>
                <span className={styles.line}></span>
              </>
            )}
          </li>
        ))}
        <li className={[styles.footer, `bg-gm-${orderId}`].join(" ")}>
          Genesis Adventurer of{" "}
          {SUFFICES.find((order) => order.value === orderId)?.label}
        </li>
      </ul>
    </div>
  );
}

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (wallet: string) => void;
}
function AddWalletModal({ isOpen, onClose, onAdd }: AddWalletModalProps) {
  const [address, setAddress] = useState("");
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Wallet">
      <div>
        <div className="mt-2">
          <input
            className={[
              styles.manafinder__app_input_text,
              "focus:outline-none focus:shadow-outline"
            ].join(" ")}
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
            }}
            placeholder="Enter Address e.g. 0x..."
          />
        </div>

        <div className="mt-4">
          <button
            type="button"
            className={[
              styles.manafinder__app_btn,
              "hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            ].join(" ")}
            onClick={() => onAdd(address)}
          >
            Add Wallet
          </button>
        </div>
      </div>
    </Modal>
  );
}

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);
  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (
          typeof a[sortConfig.key] === "undefined" &&
          typeof b[sortConfig.key] !== "undefined"
        ) {
          return 1;
        }
        if (
          typeof a[sortConfig.key] !== "undefined" &&
          typeof b[sortConfig.key] === "undefined"
        ) {
          return -1;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  return { items: sortedItems, requestSort, sortConfig };
};
