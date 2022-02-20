import React, {
  ReactElement,
  useState,
  useEffect,
  useMemo,
  createContext,
  useReducer,
  useContext,
  Dispatch
} from "react";
import GenesisManaChart from "@components/charts/GenesisManaChart";
import Layout_V2 from "@components/Layout_V2";
import { useClaimedManaRawQuery, useUnclaimedManaRaw } from "hooks/useMana";
import {
  DAO_ADDRESSES,
  GM_ALL_ADDRESS,
  SUFFICES,
  INVENTORY,
  ITEM_CLASS,
  ITEM_GREATNESS,
  ITEM_POWER,
  NFTX_MANA_ADDRESS,
  NFTX_LOOT_ADDRESS,
  GM_SORT_OPTIONS,
  GM_VIEW_OPTIONS,
  OS_ADVENTURER_URL
} from "utils/constants";
import { useWalletContext } from "hooks/useWalletContext";
import { Modal } from "components/Modal";
import Select from "react-select";
import PlusIcon from "components/icons/PlusIcon";
import { Mana } from "@utils/manaFinderTypes";
import { rarityColor, rarityDescription, itemRarity } from "loot-rarity";
import {
  formatNFTXUrl,
  formatOpenseaUrl,
  shortenAddress
} from "@utils/formatters";
import { useDebounce } from "usehooks-ts";
import { CheckIcon } from "@components/icons";
import { useNFTXFloorPrice } from "hooks/useNTFX";
import { useCollectionPricing } from "hooks/useReservoir";
import styles from "@styles/pages/Claim.module.scss"; // Styles
import {
  ManaContractMinter,
  useManaContractMinter
} from "hooks/useManaContract";
import LoadingIcon from "@components/icons/LoadingIcon";
import { useAdventurerContract } from "hooks/useAdventurerContract";
import ListIcon from "@components/icons/ListIcon";
import GridIcon from "@components/icons/GridIcon";
import { useEnsLookup } from "hooks/useEns";
import _ from "lodash";

type SelectOption = { value: string; label: string };
type SelectSortOption = SelectOption & { direction: string; key: string };

interface ManaFinderState {
  selectedOrder: SelectOption;
  selectedClass: SelectOption;
  selectedMinGreatness: SelectOption;
  selectedPower: SelectOption;
  selectedView: SelectOption;
  selectedSort: SelectSortOption;
  selectedManaBuild: Mana[];
  manaResults: Mana[];
  reclaimedMana: Mana[];
  isManaLoading: boolean;
  wallets: string[];
  isAddWalletModalOpen: boolean;
  isGenesisAdventurerResurrectModalOpen: boolean;
  selectedTabIdx: number;
  refreshCount: number;
}
const defaultManaFinderState: ManaFinderState = {
  selectedOrder: null,
  selectedClass: null,
  selectedPower: null,
  selectedMinGreatness: null,
  selectedView: GM_VIEW_OPTIONS[1],
  selectedSort: GM_SORT_OPTIONS[0],
  selectedManaBuild: [],
  manaResults: [],
  reclaimedMana: [],
  isManaLoading: false,
  wallets: [],
  isAddWalletModalOpen: false,
  isGenesisAdventurerResurrectModalOpen: false,
  selectedTabIdx: 0,
  refreshCount: 0
};

type ManaFinderAction =
  | { type: "setSelectedOrder"; payload: SelectOption }
  | { type: "setSelectedClass"; payload: SelectOption }
  | { type: "setSelectedMinGreatness"; payload: SelectOption }
  | { type: "setSelectedPower"; payload: SelectOption }
  | { type: "setSelectedView"; payload: SelectOption }
  | { type: "setSelectedSort"; payload: SelectSortOption }
  | { type: "setSelectedManaBuild"; payload: Mana[] }
  | { type: "setManaResults"; payload: Mana[] }
  | { type: "setIsManaLoading"; payload: boolean }
  | { type: "setWallets"; payload: string[] }
  | { type: "setIsAddWalletModalOpen"; payload: boolean }
  | { type: "setIsGenesisAdventurerResurrectModalOpen"; payload: boolean }
  | { type: "setSelectedTabIdx"; payload: number }
  | { type: "onSelectMana"; payload: Mana }
  | { type: "onAddWallet"; payload: string }
  | { type: "onRemoveWallet"; payload: string }
  | { type: "onReclaimMana"; payload: Mana[] };

const ManaFinderContext = createContext<{
  state: ManaFinderState;
  dispatch: Dispatch<ManaFinderAction>;
  manaMinter: ManaContractMinter;
}>({
  state: defaultManaFinderState,
  dispatch: (_: ManaFinderAction) => {},
  manaMinter: null
});

function ManaFinderReducer(state: ManaFinderState, action: ManaFinderAction) {
  switch (action.type) {
    case "setSelectedOrder":
      return {
        ...state,
        selectedOrder: action.payload,
        selectedManaBuild: [],
        isGenesisAdventurerResurrectModalOpen: false,
        isManaLoading: true
      };
    case "setSelectedClass":
      return { ...state, selectedClass: action.payload };
    case "setSelectedMinGreatness":
      return { ...state, selectedMinGreatness: action.payload };
    case "setSelectedPower":
      return { ...state, selectedPower: action.payload };
    case "setSelectedView":
      return { ...state, selectedView: action.payload };
    case "setSelectedSort":
      return { ...state, selectedSort: action.payload };
    case "setSelectedManaBuild":
      return { ...state, selectedManaBuild: [...action.payload] };
    case "setManaResults":
      const newState = {
        ...state,
        manaResults: [...action.payload],
        isManaLoading: false
      };

      if (!state.selectedOrder) {
        return {
          ...newState,
          selectedManaBuild: []
        };
      }
      const selectCards = [];
      for (let i = 0; i < INVENTORY.length; i++) {
        const mana = state.selectedManaBuild.find(
          (mana) => mana.inventoryId === i
        );
        if (!mana) {
          const row = newState.manaResults?.filter(
            (mana) => mana.inventoryId == i
          );
          if (row[0]) {
            selectCards.push(row[0]);
          }
        }
      }
      newState.selectedManaBuild = [
        ...newState.selectedManaBuild,
        ...selectCards
      ];
      return newState;
    case "setIsManaLoading":
      return { ...state, isManaLoading: action.payload };
    case "setWallets":
      return { ...state, wallets: [...action.payload] };
    case "setIsAddWalletModalOpen":
      return { ...state, isAddWalletModalOpen: action.payload };
    case "setIsGenesisAdventurerResurrectModalOpen":
      return {
        ...state,
        isGenesisAdventurerResurrectModalOpen: action.payload
      };
    case "setSelectedTabIdx":
      if (action.payload >= state.wallets.length) {
        return state;
      }
      return { ...state, selectedTabIdx: action.payload };
    case "onReclaimMana":
      return {
        ...state,
        refreshCount: state.refreshCount + 1,
        selectedManaBuild: [],
        reclaimedMana: [...state.reclaimedMana, ...action.payload]
      };
    case "onSelectMana":
      const foundIdx = state.selectedManaBuild.findIndex(
        (selected) => selected.inventoryId === action.payload.inventoryId
      );
      if (foundIdx === -1) {
        const newState = {
          ...state,
          selectedManaBuild: [...state.selectedManaBuild, action.payload]
        };
        if (!state.selectedOrder) {
          newState.selectedOrder = SUFFICES.find(
            (item) => item.value === String(action.payload?.orderId)
          );
        }
        return newState;
      } else {
        const found = state.selectedManaBuild[foundIdx];
        let newSelectedMana = [...state.selectedManaBuild];
        newSelectedMana.splice(foundIdx, 1);
        if (found.id !== action.payload.id) {
          newSelectedMana = [...newSelectedMana, action.payload];
        }
        return { ...state, selectedManaBuild: newSelectedMana };
      }
    case "onAddWallet":
      if (!action.payload) {
        alert("Invalid Wallet");
      } else if (state.wallets.includes(action.payload)) {
        return {
          ...state,
          selectedTabIndex: state.wallets.findIndex(
            (item) => action.payload === item
          ),
          isAddWalletModalOpen: false
        };
      } else {
        const updated = [...state.wallets, action.payload];
        return {
          ...state,
          wallets: updated,
          isAddWalletModalOpen: false
        };
      }

    default:
      return state;
  }
}

export default function Manafinder_V2(): ReactElement {
  const { account } = useWalletContext();
  const manaMinter = useManaContractMinter();
  const [state, dispatch] = useReducer(
    ManaFinderReducer,
    defaultManaFinderState
  );
  const { top: genesisAdventurerCardTopPostion } =
    useGenesisAdventurerTopPosition();

  //Add connected wallet if logged in
  const onConnectedAcountUpdate = () => {
    dispatch({
      type: "setWallets",
      payload: !account
        ? [GM_ALL_ADDRESS]
        : [account.toLowerCase(), GM_ALL_ADDRESS]
    });
  };
  useEffect(onConnectedAcountUpdate, [account]);

  return (
    <ManaFinderContext.Provider value={{ state, dispatch, manaMinter }}>
      <Layout_V2>
        <div className={styles.claim__app}>
          <GenesisManaHeader />
          <div className={styles.main}>
            <GenesisManaFilters />
            <div className={styles.builder}>
              <div className={styles.finder}>
                <div className={styles.gm_tabs}>
                  <QueryTabs />
                </div>
                <div className={styles.gm_results}>
                  <GenesisManaCardsByInventory
                    key={
                      state.wallets[state.selectedTabIdx] +
                      state.selectedOrder?.value
                    }
                    address={state.wallets[state.selectedTabIdx] as string}
                  />
                  {state.isManaLoading && (
                    <div className="absolute w-full h-full top-0 left-0 bg-black bg-opacity-10 flex justify-center z-50">
                      <LoadingIcon className="mt-40 w-28 h-28" />{" "}
                    </div>
                  )}
                </div>
              </div>
              <GenesisAdventurerCard
                key={
                  state.selectedOrder?.value + state.selectedManaBuild?.length
                }
                className={styles.ga}
                style={{ top: genesisAdventurerCardTopPostion }}
                orderId={state.selectedOrder?.value}
                selectedManas={state.selectedManaBuild}
                onMint={() => {
                  dispatch({
                    type: "setIsGenesisAdventurerResurrectModalOpen",
                    payload: true
                  });
                }}
              />
            </div>
          </div>
          <AddWalletModal
            key={new Date().getTime() + "-add-modal"}
            isOpen={state.isAddWalletModalOpen}
            onClose={() => {
              dispatch({ type: "setIsAddWalletModalOpen", payload: false });
            }}
            onAdd={(val) => {
              dispatch({ type: "onAddWallet", payload: val });
              dispatch({
                type: "setSelectedTabIdx",
                payload: state.wallets.length
              });
            }}
          />
          {state.isGenesisAdventurerResurrectModalOpen && (
            <GenesisAdventurerResurrectModal
              key={new Date().getTime() + "-ga-modal"}
              isOpen={state.isGenesisAdventurerResurrectModalOpen}
              onClose={() => {
                dispatch({
                  type: "setIsGenesisAdventurerResurrectModalOpen",
                  payload: false
                });
              }}
              selectedManas={state.selectedManaBuild}
            />
          )}
        </div>
      </Layout_V2>
    </ManaFinderContext.Provider>
  );
}

function useGenesisAdventurerTopPosition() {
  // Positioning for GA Builder
  const [adventureCardTop, setAdventureCardTop] = useState(60);
  // Debounce top value for performance
  const debouncedAdventureCardTop = useDebounce<number>(adventureCardTop, 1);
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
  return {
    top: debouncedAdventureCardTop
  };
}

function GenesisManaHeader() {
  return (
    <div className={styles.hdr}>
      <h1>Genesis Mana</h1>
      <div className={styles.chart}>
        <GenesisManaChart />
      </div>
    </div>
  );
}

function GenesisManaFilters() {
  const { state, dispatch } = useContext(ManaFinderContext);
  const onOrderChange = (val) =>
    dispatch({ type: "setSelectedOrder", payload: val });
  const onClassChange = (val) =>
    dispatch({ type: "setSelectedClass", payload: val });
  const onMinGreatnessChange = (val) =>
    dispatch({ type: "setSelectedMinGreatness", payload: val });
  const onRankChange = (val) =>
    dispatch({ type: "setSelectedPower", payload: val });
  const onSortChange = (val) =>
    dispatch({ type: "setSelectedSort", payload: val });

  return (
    <div>
      <div className={styles.filters}>
        <div>
          <label>Select an Order: </label>
          <Select
            instanceId="mana-filters"
            placeholder="Choose an Order"
            value={state.selectedOrder}
            isClearable={true}
            onChange={onOrderChange}
            className="w-52"
            options={[...SUFFICES]}
          />
        </div>
        <div>
          <label>Class: </label>
          <Select
            instanceId="mana-filters"
            placeholder="Choose a Class"
            value={state.selectedClass}
            isClearable={true}
            onChange={onClassChange}
            className="w-52"
            options={[...ITEM_CLASS]}
          />
        </div>
        <div>
          <label>Level: </label>
          <Select
            instanceId="mana-filters"
            placeholder="Minimum Level"
            value={state.selectedPower}
            isClearable={true}
            onChange={onRankChange}
            className="w-52"
            options={[...ITEM_POWER]}
          />
        </div>
        <div>
          <label>Greatness: </label>
          <Select
            instanceId="mana-filters"
            placeholder="Minimum Greatness"
            value={state.selectedMinGreatness}
            isClearable={true}
            onChange={onMinGreatnessChange}
            className="w-52"
            options={[...ITEM_GREATNESS]}
          />
        </div>
      </div>{" "}
      {/* <div>
        <label>Sort</label>
        <Select
          instanceId="mana-sort"
          value={state.selectedSort}
          onChange={onSortChange}
          className="w-40 md:w-52"
          options={GM_SORT_OPTIONS}
        />
      </div> */}
    </div>
  );
}

function QueryTabs() {
  const { account, isConnected } = useWalletContext();
  const { state, dispatch } = useContext(ManaFinderContext);

  function onRemoveWallet(wallet: string) {
    const updated = [
      account.toLowerCase(),
      GM_ALL_ADDRESS,
      ...state.wallets
        .slice(isConnected ? 3 : 2)
        .filter((item) => item?.toLowerCase() !== wallet?.toLowerCase())
    ];
    dispatch({ type: "setWallets", payload: updated });

    if (updated.length >= state.selectedTabIdx) {
      setTimeout(() => {
        dispatch({ type: "setSelectedTabIdx", payload: updated.length - 1 });
      }, 100);
    }
  }

  function displayTab(wallet) {
    if (wallet?.toLowerCase() === account?.toLowerCase()) {
      return "My Wallet";
    } else if (wallet == GM_ALL_ADDRESS) {
      return GM_ALL_ADDRESS;
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
      {state.wallets.map((wallet, idx) => (
        <li
          key={wallet as string}
          className={
            idx === state.selectedTabIdx
              ? "border-b text-black"
              : "text-gray-300"
          }
          onClick={() => dispatch({ type: "setSelectedTabIdx", payload: idx })}
        >
          {displayTab(wallet)}
        </li>
      ))}
      <li>
        <button
          className="flex items-center"
          onClick={() =>
            dispatch({ type: "setIsAddWalletModalOpen", payload: true })
          }
        >
          <PlusIcon />
        </button>
      </li>
      <li className="">
        <div className="border border-gray-300 rounded-md flex items-center p-2 gap-2">
          <button
            onClick={() =>
              dispatch({ type: "setSelectedView", payload: GM_VIEW_OPTIONS[1] })
            }
          >
            <ListIcon
              className={
                state.selectedView.value === "list" ? "" : "text-gray-300"
              }
            />
          </button>
          <button
            onClick={() =>
              dispatch({ type: "setSelectedView", payload: GM_VIEW_OPTIONS[0] })
            }
          >
            <GridIcon
              className={
                state.selectedView.value === "grid" ? "" : "text-gray-300"
              }
            />
          </button>
        </div>
      </li>
    </ul>
  );
}

function useClaimedManaWithPricing({ address }) {
  const { state } = useContext(ManaFinderContext);

  const { floorPrice: nftxFloorPrice } = useNFTXFloorPrice(NFTX_MANA_ADDRESS);
  const isAllQuery = GM_ALL_ADDRESS === address;

  const queryByAddress: any = {
    currentOwner: isAllQuery ? NFTX_MANA_ADDRESS : address?.toLowerCase()
  };

  const openseaQuery: any = {
    currentOwner_not_in: [...DAO_ADDRESSES]
  };

  if (state.selectedOrder?.value) {
    queryByAddress.suffixId = state.selectedOrder?.value;
    openseaQuery.suffixId = state.selectedOrder?.value;
  }

  if (state.selectedClass?.value) {
    queryByAddress.itemClass_in = [state.selectedClass?.value, ""];
    openseaQuery.itemClass_in = [state.selectedClass?.value, ""];
  }

  if (state.selectedMinGreatness?.value) {
    queryByAddress.itemGreatness_gte = parseInt(
      state.selectedMinGreatness?.value
    );
    openseaQuery.itemGreatness_gte = parseInt(
      state.selectedMinGreatness?.value
    );
  }

  if (state.selectedPower?.value) {
    const power = parseInt(state.selectedPower?.value);
    const values = [1, 2, 3, 4, 5].filter((val) => val >= power).concat(0);
    queryByAddress.itemPower_in = values;
    openseaQuery.itemPower_in = values;
  }

  const {
    data: queryByAddressResults,
    loading: isClaimedManaLoading,
    refetch: refetchWallet
  } = useClaimedManaRawQuery(queryByAddress);

  // Currently there's a limit of 100 items per subgraph call. Query items individually
  // till we're able to include pricing data.
  const { data: openseaWeaponResults, loading: isOSClaimedWeaponManaLoading } =
    useClaimedManaRawQuery({ ...openseaQuery, inventoryId: 0 }, !isAllQuery);

  const { data: openseaChestResults, loading: isOSClaimedChestManaLoading } =
    useClaimedManaRawQuery({ ...openseaQuery, inventoryId: 1 }, !isAllQuery);

  const { data: openseaHeadResults, loading: isOSClaimedHeadManaLoading } =
    useClaimedManaRawQuery({ ...openseaQuery, inventoryId: 2 }, !isAllQuery);

  const { data: openseaWaistResults, loading: isOSClaimedWaistManaLoading } =
    useClaimedManaRawQuery({ ...openseaQuery, inventoryId: 3 }, !isAllQuery);

  const { data: openseaFootResults, loading: isOSClaimedFootManaLoading } =
    useClaimedManaRawQuery({ ...openseaQuery, inventoryId: 4 }, !isAllQuery);

  const { data: openseaHandResults, loading: isOSClaimedHandManaLoading } =
    useClaimedManaRawQuery({ ...openseaQuery, inventoryId: 5 }, !isAllQuery);

  const { data: openseaNeckResults, loading: isOSClaimedNeckManaLoading } =
    useClaimedManaRawQuery({ ...openseaQuery, inventoryId: 6 }, !isAllQuery);

  const { data: openseaRingResults, loading: isOSClaimedRingManaLoading } =
    useClaimedManaRawQuery({ ...openseaQuery, inventoryId: 7 }, !isAllQuery);

  const { priceByTokenId: manaPricingByTokenId } =
    useCollectionPricing("genesis-mana");

  const openseaResults = [
    ...(openseaWeaponResults?.manas ?? []),
    ...(openseaChestResults?.manas ?? []),
    ...(openseaHeadResults?.manas ?? []),
    ...(openseaWaistResults?.manas ?? []),
    ...(openseaFootResults?.manas ?? []),
    ...(openseaHandResults?.manas ?? []),
    ...(openseaNeckResults?.manas ?? []),
    ...(openseaRingResults?.manas ?? [])
  ];

  const claimedData = {
    manas: [...(queryByAddressResults?.manas ?? []), ...(openseaResults ?? [])]
  };

  const mapOpenseaManaPricing = (mana) => {
    return {
      ...mana,
      lootTokenId: mana.lootBag?.id,
      price: isNFTX(mana)
        ? nftxFloorPrice
        : manaPricingByTokenId[mana?.id] || undefined,
      rarity: itemRarity(mana.itemName)
    };
  };

  const manas = (claimedData?.manas ?? []).map(mapOpenseaManaPricing);

  return {
    manas,
    loading:
      isClaimedManaLoading ||
      isOSClaimedWeaponManaLoading ||
      isOSClaimedChestManaLoading ||
      isOSClaimedHeadManaLoading ||
      isOSClaimedWaistManaLoading ||
      isOSClaimedFootManaLoading ||
      isOSClaimedHandManaLoading ||
      isOSClaimedNeckManaLoading ||
      isOSClaimedRingManaLoading,
    refetch: () => {
      return refetchWallet();
    }
  };
}

function useUnClaimedManaWithPricing({ address }) {
  const { state } = useContext(ManaFinderContext);

  const { floorPrice: nftxFloorPrice } = useNFTXFloorPrice(NFTX_LOOT_ADDRESS);

  const isAllQuery = GM_ALL_ADDRESS === address;

  const queryBags: any = {
    isClaimed: 0
  };
  if (!isAllQuery) {
    queryBags.currentOwner = address?.toLowerCase();
  } else {
    queryBags.currentOwner_not_in = [...DAO_ADDRESSES];
  }

  const nftxQuery: any = { currentOwner: NFTX_LOOT_ADDRESS, isClaimed: 0 };
  if (state.selectedOrder?.value) {
    nftxQuery.orderId = state.selectedOrder?.value;
    queryBags.orderId = state.selectedOrder?.value;
  }

  if (state.selectedClass?.value) {
    nftxQuery.itemClass_in = [state.selectedClass?.value, ""];
    queryBags.itemClass_in = [state.selectedClass?.value, ""];
  }

  if (state.selectedMinGreatness?.value) {
    nftxQuery.itemGreatness_gte = parseInt(state.selectedMinGreatness?.value);
    queryBags.itemGreatness_gte = parseInt(state.selectedMinGreatness?.value);
  }

  if (state.selectedPower?.value) {
    const power = parseInt(state.selectedPower?.value);
    const values = [1, 2, 3, 4, 5].filter((val) => val >= power).concat(0);
    nftxQuery.itemPower_in = values;
    queryBags.itemPower_in = values;
  }

  const { data: nftxResults, loading: isNFTxLoading } = useUnclaimedManaRaw(
    nftxQuery,
    !isAllQuery
  );

  function bagQueryWithInventoryId(inventoryId) {
    const query = {
      ...queryBags,
      inventoryId: inventoryId
    };
    return query;
  }

  const { data: weaponBagData, loading: isWeaponBagDataLoading } =
    useUnclaimedManaRaw(bagQueryWithInventoryId(0));
  const { data: chestBagData, loading: isChestBagDataLoading } =
    useUnclaimedManaRaw(bagQueryWithInventoryId(1));
  const { data: headBagData, loading: isHeadBagDataLoading } =
    useUnclaimedManaRaw(bagQueryWithInventoryId(2));
  const { data: waistBagData, loading: isWaistBagDataLoading } =
    useUnclaimedManaRaw(bagQueryWithInventoryId(3));
  const { data: footBagData, loading: isFootBagDataLoading } =
    useUnclaimedManaRaw(bagQueryWithInventoryId(4));
  const { data: handBagData, loading: isHandBagDataLoading } =
    useUnclaimedManaRaw(bagQueryWithInventoryId(5));
  const { data: neckBagData, loading: isNeckBagDataLoading } =
    useUnclaimedManaRaw({ ...bagQueryWithInventoryId(6) });
  const { data: ringBagData, loading: isRingDataBagLoading } =
    useUnclaimedManaRaw({ ...bagQueryWithInventoryId(7) });

  const { priceByTokenId: lootPricingByTokenId } =
    useCollectionPricing("lootproject");

  const bagResults = [
    ...(nftxResults?.manas ?? []),
    ...(weaponBagData?.manas ?? []),
    ...(chestBagData?.manas ?? []),
    ...(headBagData?.manas ?? []),
    ...(waistBagData?.manas ?? []),
    ...(footBagData?.manas ?? []),
    ...(handBagData?.manas ?? []),
    ...(neckBagData?.manas ?? []),
    ...(ringBagData?.manas ?? [])
  ];

  const mapOpenseaBagPricing = (mana) => {
    return {
      ...mana,
      price: isNFTX(mana)
        ? nftxFloorPrice
        : lootPricingByTokenId[parseInt(mana.lootTokenId)] || undefined,
      rarity: itemRarity(mana.itemName)
    };
  };

  const manas = bagResults.map(mapOpenseaBagPricing);

  return {
    manas,
    loading:
      isWeaponBagDataLoading ||
      isChestBagDataLoading ||
      isHeadBagDataLoading ||
      isWaistBagDataLoading ||
      isFootBagDataLoading ||
      isHandBagDataLoading ||
      isNeckBagDataLoading ||
      isRingDataBagLoading ||
      isNFTxLoading
  };
}

function useManaWithPricing({ address }) {
  const { state } = useContext(ManaFinderContext);

  const { manas: unclaimedManas, loading: isUnclaimedLoadiing } =
    useUnClaimedManaWithPricing({ address });

  const {
    manas: claimedManas,
    loading: isClaimedManaLoading,
    refetch: refetchClaimedMana
  } = useClaimedManaWithPricing({ address });

  const applyFilters = () => {
    const cache = {};
    return (mana) => {
      if (state?.reclaimedMana?.find((reclaimed) => reclaimed.id === mana.id)) {
        return false;
      }
      const key =
        mana?.orderId + mana.itemName + (mana?.lootBag?.id ?? mana.id);
      if (cache[key]) {
        return false;
      }
      cache[key] = true;
      return (
        !state.selectedOrder?.value ||
        mana?.orderId == state.selectedOrder?.value
      );
    };
  };

  const manas = [...(claimedManas ?? []), ...(unclaimedManas ?? [])].filter(
    applyFilters()
  );

  return {
    manas,
    loading: isUnclaimedLoadiing || isClaimedManaLoading,
    refetch: () => {
      return refetchClaimedMana();
    }
  };
}

type GenesisManaCardsByInventoryProps = {
  address: string;
};
function GenesisManaCardsByInventory({
  address
}: GenesisManaCardsByInventoryProps): ReactElement {
  const { state, dispatch } = useContext(ManaFinderContext);

  const {
    manas: manasWithPricing,
    loading: isManaLoading,
    refetch: refetchMana
  } = useManaWithPricing({
    address
  });
  const {
    items: manas,
    setSortConfig,
    sortConfig
  } = useSortableData(manasWithPricing, state.selectedSort);

  useEffect(() => {
    if (sortConfig?.value === state.selectedSort?.value) {
      return;
    }
    setSortConfig({ ...state.selectedSort });
  }, [state.selectedSort?.value]);

  useEffect(() => {
    if (!isManaLoading) {
      dispatch({ type: "setManaResults", payload: manas });
    }
  }, [manas?.length, state.selectedOrder?.value, isManaLoading]);

  useEffect(() => {
    if (state.refreshCount === 0) {
      return;
    }
    refetchMana().then(() => {
      dispatch({ type: "setManaResults", payload: manas });
    });
  }, [state.refreshCount]);

  const truthy = [true, true, true, true, true, true, true, true];
  const falsy = [false, false, false, false, false, false, false, false];

  const [collapsed, setCollapsed] = useState([...falsy]);
  const onCollapseAll = () => setCollapsed([...truthy]);
  const onExpandAll = () => setCollapsed([...falsy]);
  const onToggleExpand = (selectedIdx) =>
    setCollapsed([
      ...collapsed.map((val, idx) => (idx === selectedIdx ? !val : val))
    ]);

  const onSelect = (mana: Mana) =>
    dispatch({ type: "onSelectMana", payload: mana });

  return (
    <div className={styles.ctr} key={state.selectedSort?.value + "-cards"}>
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
              <span className={[styles.line, `bg-gray-200`].join(" ")}></span>
            </h1>
            {collapsed[idx] ? null : state.selectedView?.value === "list" ? (
              <GenesisManaListRow
                manas={row}
                onSelect={onSelect}
                selectedMana={state.selectedManaBuild?.find(
                  (mana) => mana.inventoryId === idx
                )}
              />
            ) : (
              <GenesisManaCardRow
                manas={row}
                idx={idx}
                selectedMana={state.selectedManaBuild?.find(
                  (mana) => mana.inventoryId === idx
                )}
                onSelect={onSelect}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GenesisManaCardRow({ manas, idx, onSelect, selectedMana }) {
  return (
    <div className="flex gap-4 overflow-x-scroll">
      {manas.map((mana) => (
        <GenesisManaCard
          onClick={() => {
            onSelect(mana);
          }}
          isSelected={
            mana.id > 0
              ? mana.id === selectedMana?.id
              : mana.lootTokenId === selectedMana?.lootTokenId
          }
          key={`${idx}-${mana.id}-${mana.lootTokenId}}`}
          mana={mana}
        />
      ))}
    </div>
  );
}

function GenesisManaListRow({ manas, onSelect, selectedMana }) {
  const { account } = useWalletContext();
  const { manaMinter } = useContext(ManaFinderContext);

  const isCurrentOwner = (mana) =>
    mana?.currentOwner?.id.toLowerCase() === account?.toLowerCase();
  const isManaSelected = (mana) =>
    mana.id > 0
      ? mana.id === selectedMana?.id
      : mana.lootTokenId === selectedMana?.lootTokenId;

  const isMinted = (mana) =>
    mana.id > 0 || manaMinter.isManaMintSuccessful(mana);
  const isInProgress = (mana) => manaMinter.isManaMintInProgress(mana);
  const showMint = (mana) => isCurrentOwner(mana) && !isMinted(mana);

  return (
    <div>
      {manas.map((mana) => (
        <div key={mana.id + mana?.lootTokenId} className="flex">
          <span
            title="Add"
            className="w-1/5 cursor-pointer"
            onClick={() => onSelect(mana)}
          >
            <span className="w-4 inline-block mr-2">
              {isManaSelected(mana) ? "(x) " : ""}
            </span>
            <span className="underline">
              {!mana?.lootTokenId || mana.lootBag || isMinted(mana)
                ? `${manaMinter.getTokenId(mana)}`
                : `${mana?.lootTokenId} (loot)`}
            </span>
            &nbsp;
            {isInProgress(mana) && (
              <span className="inline-block">... minting</span>
            )}
            {!isInProgress(mana) && showMint(mana) && (
              <button
                onClick={() => {
                  manaMinter.mintMana(mana);
                }}
                className="text-blue-400"
              >
                mint
              </button>
            )}
          </span>
          <span
            title="Add"
            onClick={() => onSelect(mana)}
            className="w-2/5 cursor-pointer flex flex-col justify-center"
          >
            <span className="underline mr-4">{mana.itemName}</span>
            <span
              className="text-xs"
              style={{ color: rarityColor(mana.itemName) }}
            >
              {rarityDescription(mana.itemName)}
              &nbsp;
              {mana.itemClass}
              &nbsp;
              {mana.itemGreatness}
            </span>{" "}
          </span>
          <span className="w-1/5 text-right" title="Owner">
            <ManaOwnerLink mana={mana} />
          </span>
          <span className="w-1/5 text-right">
            {isCurrentOwner(mana) ? (
              "Yours"
            ) : (
              <ExternalManaLink
                mana={mana}
                text={mana?.price > 0 ? `${mana?.price?.toFixed(3)} ♦` : "buy"}
              />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function ManaOwnerLink({ mana }) {
  const address = mana?.currentOwner?.id;
  const { address: ensName } = useEnsLookup(address);
  return (
    <a
      className="underline text-right"
      href={
        isNFTX(mana)
          ? `https://nftx.io/vault/${address?.toLowerCase()}/buy/`
          : `https://opensea.io/${address}`
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      {isNFTX(mana) ? "NFTx" : ensName || shortenAddress(address)}
    </a>
  );
}

function isNFTX(mana: Mana) {
  return (
    mana?.currentOwner?.id?.toLowerCase() === NFTX_MANA_ADDRESS ||
    mana?.currentOwner?.id?.toLowerCase() === NFTX_LOOT_ADDRESS
  );
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
  isSelected?: boolean;
}

function GenesisManaCard({
  mana,
  onClick,
  isSelected,
  ...props
}: GenesisManaCardProps): ReactElement {
  const { account } = useWalletContext();
  const { manaMinter } = useContext(ManaFinderContext);

  const inventoryLabel = INVENTORY.find(
    (item) => String(mana.inventoryId) === item.value
  ).label;

  const isArmor = [0, 7].indexOf(mana.inventoryId) === -1;
  const isMinted = mana.id > 0 || manaMinter.isManaMintSuccessful(mana);
  const isInProgress = manaMinter.isManaMintInProgress(mana);
  const doesOwnMana =
    account?.toLowerCase() === mana.currentOwner?.id?.toLowerCase();
  const showMint = doesOwnMana && !isMinted;
  const order = SUFFICES.find(
    (suffix) => suffix.value === String(mana.orderId)
  ).label;

  const openseaUrl = formatOpenseaUrl(mana);
  const nftxUrl = formatNFTXUrl(mana);
  return (
    <div {...props} className={styles.gm_card_ctr}>
      <div
        className={[
          styles.card,
          isSelected ? "bg-white" : `bg-gm-${mana.orderId}`,
          "cursor-pointer",
          "border-4",
          isSelected ? `text-gm-${mana.orderId}` : "text-white",
          `border-gm-${mana.orderId}`
        ].join(" ")}
        onClick={onClick}
      >
        <div>
          <div>Order: {order}</div>
          <div>
            Equipment Type: {inventoryLabel} {isArmor ? "Armor" : ""}
          </div>
        </div>
        <div
          className={`flex-1 flex text-base justify-center items-center text-gm-${mana.orderId}`}
        >
          {isSelected ? "Selected" : "Add"}
        </div>
        <div>
          <div>
            {mana?.lootTokenId
              ? `Distilled from Loot Bag #${mana?.lootTokenId}`
              : "Distilled from"}
          </div>
          <div>{mana.itemName}</div>
        </div>
      </div>
      <div className="pt-2">
        {isInProgress && (
          <span className="flex justify-center items-center">
            <LoadingIcon />
          </span>
        )}
        {!isInProgress && showMint && (
          <button
            onClick={() => {
              manaMinter.mintMana(mana);
            }}
            className={styles.mint}
          >
            mint
          </button>
        )}
        <div className={styles.details}>
          <label>Id </label>
          <span className="text-right">
            {isMinted ? `#${manaMinter.getTokenId(mana)}` : "Unclaimed"}
          </span>
          <label>Type</label>
          <span className="flex items-center justify-end gap-2">
            <span className="text-right">
              {rarityDescription(mana.itemName)} {mana.itemClass}{" "}
              {mana.itemGreatness}
            </span>
            <span className={styles.rarity_indicator}>
              <span style={{ backgroundColor: rarityColor(mana.itemName) }} />
            </span>
          </span>
          <label>Owner </label>
          <span className="text-right">
            <ManaOwnerLink mana={mana} />
          </span>
          {!doesOwnMana && (
            <>
              <label>Buy</label>
              <span className="flex justify-end">
                {nftxUrl?.length > 0 && (
                  <a
                    className="underline"
                    href={nftxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {mana.price > 0 ? `${mana.price.toFixed(3)} ♦` : "NFTx"}
                  </a>
                )}
                {!nftxUrl && (
                  <a
                    className="underline"
                    href={openseaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {mana.price > 0 ? `${mana.price.toFixed(3)} ♦` : "Opensea"}
                  </a>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface GenesisAdventurerCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orderId?: string;
  selectedManas: Mana[];
  onMint: (manas: Mana[]) => void;
}
function GenesisAdventurerCard({
  selectedManas,
  orderId,
  onMint,
  ...props
}: GenesisAdventurerCardProps): React.ReactElement {
  const { account } = useWalletContext();
  const { manaMinter } = useContext(ManaFinderContext);

  let manas = INVENTORY.map((item) =>
    selectedManas.find((mana) => mana.inventoryId === parseInt(item.value))
  );

  const isMinted = (mana) =>
    mana.id > 0 || manaMinter.isManaMintSuccessful(mana);
  const isInProgress = (mana) => manaMinter.isManaMintInProgress(mana);
  const doesOwnMana = (mana) =>
    account?.toLowerCase() === mana.currentOwner?.id?.toLowerCase();

  const canMint =
    manas.filter(
      (mana) =>
        mana?.currentOwner?.id?.toLowerCase() === account?.toLowerCase() &&
        (mana.lootBag || isMinted(mana))
    ).length === 8;

  function AccessoryItem({ mana }: { mana: Mana }) {
    //Owned By Current Wallet
    if (doesOwnMana(mana)) {
      if (isMinted(mana)) {
        return <CheckIcon className="text-green-200" />;
      } else if (isInProgress(mana)) {
        return <LoadingIcon className="text-white" />;
      } else {
        return (
          <button
            onClick={() => {
              manaMinter.mintMana(mana);
            }}
            className={styles.mint}
          >
            mint
          </button>
        );
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
      <div className="flex flex-col">
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
        <div className="pb-4 mx-4">
          {canMint && (
            <button
              className="bg-blue-400 text-white px-4 py-2 font-extrabold rounded-md text-center w-full"
              onClick={() => {
                onMint(selectedManas);
              }}
            >
              Congrats, mint your Adventurer!
            </button>
          )}
        </div>
      </div>
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
              styles.claim__app_input_text,
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
              styles.claim__app_btn,
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

interface GenesisAdventurerResurrectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedManas: Mana[];
}
function GenesisAdventurerResurrectModal({
  isOpen,
  onClose,
  selectedManas
}: GenesisAdventurerResurrectModalProps) {
  const { dispatch, manaMinter } = useContext(ManaFinderContext);
  const { getPublicPrice, adventurerContract } = useAdventurerContract();
  const {
    isAppoved,
    isAppoving,
    isResurrecting,
    isUnAppoved,
    approveContract,
    resurrectGA
  } = useAdventurerContract();
  const [price, setPrice] = useState(0);
  const [completedTokenId, setCompletedTokenId] = useState(0);

  async function onApproveClick() {
    if (!isUnAppoved) {
      alert("already approved or in progress");
      return;
    }
    await approveContract();
  }

  async function onResurrectClick() {
    if (!isAppoved || completedTokenId) {
      alert("not approved or in progress");
      return;
    }
    const tokenId = await resurrectGA(
      selectedManas.map((mana) => ({
        ...mana,
        id: manaMinter.getTokenId(mana)
      }))
    );
    if (tokenId) {
      setCompletedTokenId(Number(tokenId));
    } else {
      setCompletedTokenId(0);
      alert("There was an error resurrecting your GA. Please try again.");
    }
  }

  useEffect(() => {
    if (!adventurerContract) return;
    getPublicPrice().then((price) => {
      setPrice(price);
    });
  }, [adventurerContract, getPublicPrice]);

  if (selectedManas.length < 8) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        // Can't close while interacting with contract
        if (isResurrecting || isAppoving) {
          return;
        }
        if (completedTokenId > 0) {
          dispatch({ type: "onReclaimMana", payload: selectedManas });
        }
        onClose();
      }}
      title="Genesis Adventurer Resurrect"
    >
      <div className="pt-12 pb-8 text-xs">
        <ul>
          <li className="flex pb-4">
            <span className="flex-1"></span>
            <span>
              1. setApprovalForAll on{" "}
              <a
                href="https://etherscan.io/address/0xf4b6040a4b1b30f1d1691699a8f3bf957b03e463#writeContract"
                target="_blank"
                className="text-blue-400"
                rel="noopener noreferrer"
              >
                Etherscan (GM Contract)
              </a>
            </span>
          </li>
          <li className="flex items-center border-t border-gray-200 py-1">
            <span className="flex-1">operator:</span>
            <span>0x8db687aceb92c66f013e1d614137238cc698fedb</span>
          </li>

          <li className="flex py-4 border-t border-gray-200">
            <span className="flex-1">approved (bool):</span>
            <span>true</span>
          </li>
          <li className="flex flex-col py-4 border-t border-gray-200">
            {(isAppoved || isResurrecting) && (
              <div className="flex justify-center items-center gap-2 font-bold">
                <span className="text-green-200">Contract Approved </span>
                <CheckIcon className="text-green-200" />
              </div>
            )}
            {isUnAppoved && (
              <button
                onClick={onApproveClick}
                className="bg-blue-400 text-white px-4 py-2 font-extrabold rounded-md text-center w-full"
              >
                Approve Adventurer Contract
              </button>
            )}
            {isAppoving && (
              <div className="flex justify-center items-center">
                <LoadingIcon />
              </div>
            )}
          </li>
          <li className="flex pb-4">
            <span className="flex-1"></span>
            <span>
              2. resurrectGA on{" "}
              <a
                href="https://etherscan.io/token/0x8db687aceb92c66f013e1d614137238cc698fedb#writeProxyContract"
                target="_blank"
                className="text-blue-400"
                rel="noopener noreferrer"
              >
                Etherscan (GA contract)
              </a>
            </span>
          </li>
          <li className="flex">
            <span className="flex-1">payableAmount (mint price):</span>
            <span>{price}♦</span>
          </li>
          {INVENTORY.map((item) => (
            <li key={item.label} className="flex border-t border-gray-200 py-1">
              <span className="w-1/2">{item.label.toLowerCase()}TokenId:</span>
              <span className="w-1/2 text-right">
                {manaMinter.getTokenId(
                  selectedManas.find(
                    (mana) => mana.inventoryId === parseInt(item.value)
                  )
                )}
              </span>
            </li>
          ))}
          <li className="flex flex-col py-4 border-t border-gray-200 text-base">
            {completedTokenId > 0 && (
              <div className="flex justify-center items-center gap-2">
                Your Genesis Adventurer has been resurrected:
                <a
                  className="underline text-right text-green-200 ml-2 flex justify-center items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://opensea.io/assets/${OS_ADVENTURER_URL}/${completedTokenId}`}
                >
                  OpenSea <CheckIcon className="text-green-200" />
                </a>
              </div>
            )}
            {!isResurrecting && isAppoved && completedTokenId <= 0 && (
              <button
                onClick={onResurrectClick}
                className="bg-blue-400 text-white px-4 py-2 font-extrabold rounded-md text-center w-full"
              >
                Resurrect Your Genesis Adventurer
              </button>
            )}
            {isResurrecting && (
              <div className="flex justify-center items-center">
                <LoadingIcon />
              </div>
            )}
          </li>
        </ul>
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
  return { items: sortedItems, setSortConfig, requestSort, sortConfig };
};
