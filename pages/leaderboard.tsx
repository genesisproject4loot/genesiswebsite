import React, {
  ReactElement,
  useState,
  createContext,
  useReducer,
  useContext,
  Dispatch,
  useEffect
} from "react";
import Select from "react-select";
import Layout_V2 from "@components/Layout_V2";
import GenesisAdventurerChart from "@components/charts/GenesisAdventurerChart";
import { useAtimeSeasonClaimed } from "hooks/useAtimeContract";
import { useLostManaNames } from "hooks/useLostManaNames";
import { useAdventurerContract } from "hooks/useAdventurerContract";

import styles from "@styles/pages/Leaderboard.module.scss"; // Styles

import _ from "lodash";
import {
  useAdventurerLeaderBoard,
  useAdventurerRawQuery
} from "hooks/useAdventurer";
import { useEnsLookup } from "hooks/useEns";
import { shortenAddress } from "@utils/formatters";
import { SUFFICES } from "@utils/constants";
import { useWalletContext } from "hooks/useWalletContext";
import { Modal } from "@components/Modal";
import { itemRarity } from "loot-rarity";

interface GenesisAdventurerPageState {
  selectedAdventurer: any;
}

const defaultGenesisAdventurerPageState: GenesisAdventurerPageState = {
  selectedAdventurer: null
};

type GenesisAdventurerPageAction = {
  type: "setSelectedAdventurer";
  payload: any;
};

const GenesisAdventurerPageContext = createContext<{
  state: GenesisAdventurerPageState;
  dispatch: Dispatch<GenesisAdventurerPageAction>;
}>({
  state: defaultGenesisAdventurerPageState,
  dispatch: (_: GenesisAdventurerPageAction) => {}
});

function GenesisAdventurerPageReducer(
  state: GenesisAdventurerPageState,
  action: GenesisAdventurerPageAction
) {
  switch (action.type) {
    case "setSelectedAdventurer":
      return {
        ...state,
        selectedAdventurer: action.payload
      };
    default:
      return state;
  }
}

export default function GenesisAdventurerPage(): ReactElement {
  const [state, dispatch] = useReducer(
    GenesisAdventurerPageReducer,
    defaultGenesisAdventurerPageState
  );

  return (
    <GenesisAdventurerPageContext.Provider value={{ state, dispatch }}>
      <Layout_V2>
        <div className={styles.leaderboard__app}>
          <GenesisAdventurerHeader />
          <div className={styles.main}>
            <GenesisAdventurersGrid />
          </div>
        </div>
        <LostManaNamingModal />
      </Layout_V2>
    </GenesisAdventurerPageContext.Provider>
  );
}

function GenesisAdventurerHeader() {
  return (
    <div className={styles.hdr}>
      <h1 className="pb-4">Genesis Adventurers</h1>
      <div className={styles.chart}>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 px-5">
          <div className="w-full md:w-2/5 mt-2">
            <GenesisAdventurerLeaderboard />
          </div>
          <div className="w-full md:w-3/5">
            <GenesisAdventurerChart />
          </div>
        </div>
      </div>
    </div>
  );
}

function GenesisAdventurerLeaderboard() {
  const LIMIT = 16;
  const { data } = useAdventurerLeaderBoard();
  const [page, setPage] = useState(0);
  const [mouseOutTimer, setMouseOutTimer] = useState(0);
  const [selectedLeader, setSelectedLeader] = useState(0);

  const prevPage = () => {
    if (page === 0) {
      return;
    }
    setPage(page - 1);
  };
  const nextPage = () => {
    if ((page + 1) * LIMIT >= data?.wallets?.length) {
      return;
    }
    setPage(page + 1);
  };

  const onMouseOverLeader = (num) => {
    clearTimeout(mouseOutTimer);
    setSelectedLeader(num);
  };

  const onMouseOutLeaderboard = () => {
    clearTimeout(mouseOutTimer);
    const timer = setTimeout(() => {
      setSelectedLeader(0);
    }, 500);
    setMouseOutTimer(timer as any);
  };

  const offset = page * LIMIT;
  const end = offset + LIMIT;

  return (
    <div>
      <h1 className="text-xl font-bold text-center pb-2">Leaderboard</h1>
      <ul onMouseOut={onMouseOutLeaderboard}>
        {data?.wallets?.slice(offset, end).map((wallet, idx) => {
          const number = page * LIMIT + idx + 1;
          return (
            <li
              key={wallet.id}
              onMouseOver={() => onMouseOverLeader(number)}
              className="grid grid-cols-4 gap-1 w-full justify-center items-center relative"
              style={{
                fontSize: 14,
                gridTemplateColumns: "20px minmax(120px,auto) 1fr auto"
              }}
            >
              <span>{number}.</span>
              <GenesisAdventurerLeaderboardRow
                wallet={wallet}
                showOverlay={number === selectedLeader}
                maxValue={data?.wallets[0]?.adventurersHeld}
              />
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end gap-4 text-base py-4 underline">
        <button onClick={prevPage}>Prev</button>{" "}
        <button onClick={nextPage}>Next</button>
      </div>
    </div>
  );
}

function GenesisAdventurerLeaderboardRow({ wallet, showOverlay, maxValue }) {
  const { address: ensName } = useEnsLookup(wallet.id);
  const counts = wallet.adventurers.reduce((map, adventurer) => {
    if (!map[adventurer.suffixId.id]) map[adventurer.suffixId.id] = 0;
    map[adventurer.suffixId.id]++;
    return map;
  }, {});
  const ordersOwned = SUFFICES.filter((item) => counts[item.value] > 0).map(
    (item: any) => ({
      label: item.label,
      color: item.color,
      count: counts[item.value],
      percentage: (counts[item.value] / maxValue) * 100
    })
  );
  return (
    <>
      <a
        className={`underline ${showOverlay ? "font-semibold" : ""}`}
        href={`https://opensea.io/${wallet.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {ensName || shortenAddress(wallet.id)}
      </a>
      <span className="flex flex-1 border-l border-white">
        {ordersOwned.map((order) => {
          return (
            <span
              key={order.label}
              style={{
                color: "#fff",
                height: 12,
                width: `${order.percentage}%`,
                backgroundColor: order.color
              }}
            ></span>
          );
        })}
      </span>
      <span className={`ml-2 ${showOverlay ? "font-bold" : ""}`}>
        {wallet.adventurersHeld}
      </span>
      {showOverlay && (
        <div
          className="absolute hidden md:block bg-white p-4 rounded-md text-black top-0 ml-5 z-50 left-full shadow-md"
          style={{ minWidth: 160 }}
        >
          <h1 className="font-semibold pb-1 flex border-b border-gray-200 ">
            <span className="flex-1">
              {ensName || shortenAddress(wallet.id)}
            </span>
            <span className="ml-4">{wallet.adventurersHeld}</span>
          </h1>
          <ul>
            {ordersOwned.map((order) => {
              return (
                <li
                  key={order.label + order.count}
                  className="flex gap-4 w-full py-1"
                >
                  <span className="flex-1">{order.label}:</span>
                  <span>{order.count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

function GenesisAdventurersGrid() {
  const { account, isConnected } = useWalletContext();
  const { state, dispatch } = useContext(GenesisAdventurerPageContext);
  const [selectedTab, setSelectedTab] = useState(0);
  const tabs = ["All", "Wallet"];
  const { data, refetch } = useAdventurerRawQuery(
    selectedTab === 0
      ? { currentOwner_not: "" }
      : {
          currentOwner: account?.toLowerCase()
        },
    selectedTab === 1 && !account
  );

  useEffect(() => {
    if (!state.selectedAdventurer) {
      setTimeout(refetch, 1000);
    }
  }, [state.selectedAdventurer]);

  return (
    <>
      <ul className="flex flex-row gap-4 text-lg pb-4">
        {tabs.map((tab, idx) => {
          return (
            <li
              onClick={() => {
                setSelectedTab(idx);
              }}
              className={
                idx === selectedTab
                  ? "border-b text-black"
                  : "text-gray-300  cursor-pointer"
              }
              key={tab}
            >
              {tab}
            </li>
          );
        })}
      </ul>
      {/* {!isConnected && (
        <h1 className="text-xl text-center pt-10">
          Connect your wallet to see your Adventurers.
        </h1>
      )} */}
      <div className="flex content-evenly gap-8 flex-wrap">
        {data?.adventurers?.map((adventurer) => {
          return (
            <GenesisAdventurerCard
              key={adventurer.id}
              adventurer={adventurer}
            />
          );
        })}
      </div>
    </>
  );
}

function GenesisAdventurerCard({ adventurer }) {
  const { dispatch } = useContext(GenesisAdventurerPageContext);
  const { address: ensName } = useEnsLookup(adventurer?.currentOwner?.id);

  const { isClaimed, claimById, amountPerToken } = useAtimeSeasonClaimed(
    adventurer.id
  );

  const adventurerImage = (adventurer) => {
    const data = JSON.parse(atob(adventurer.tokenURI.split(",")[1]));
    return data.image;
  };

  const hasLostMana = (adventurer) =>
    adventurer.lootTokenIds.filter((tokenId) => tokenId === 0).length > 0;

  return (
    <div key={adventurer.id} className="flex-col flex ">
      <div>
        <label className="font-bold text-base">
          Genesis Adventurer # {adventurer.id}
        </label>
        <img
          className="rounded-md"
          width="292px"
          height="292px"
          src={adventurerImage(adventurer)}
        />
      </div>

      {/* <div className="text-blue-400 text-sm flex gap-2 pl-2">
        <a
          href={`https://www.loot.exchange/collections/genesisadventurer/${adventurer.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          loot.exchange
        </a>
        <a
          href={`https://opensea.io/assets/0x8db687aceb92c66f013e1d614137238cc698fedb/${adventurer.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          opensea
        </a>
        {hasLostMana(adventurer) && (
          <button
            onClick={() => {
              dispatch({ type: "setSelectedAdventurer", payload: adventurer });
              // claimById(adventurer.id);
            }}
            className="text-blue-400 text-sm flex gap-2"
          >
            rename lost mana
          </button>
        )}
      </div> */}
      <ul className="px-2 font-semibold flex gap-2 flex flex-row-reverse">
        <li>Rating: {adventurer.rating}</li>
        <li>Level: {adventurer.level}</li>
        <li>Greatness: {adventurer.greatness}</li>
      </ul>
      <a
        href={`https://opensea.io/assets/0x8db687aceb92c66f013e1d614137238cc698fedb/${adventurer.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-400 flex flex-row-reverse pr-2 pt-1"
      >
        {ensName || shortenAddress(adventurer?.currentOwner?.id)}
      </a>
      {/* {!isClaimed && (
        <button
          onClick={() => {
            claimById(adventurer.id);
          }}
          className="m-auto text-center rounded-md border-gray-200 shadow-sm w-full border py-2 my-2"
        >
          Claim <b>{amountPerToken.toLocaleString()}</b> $ATIME
        </button>
      )} */}
      {/* {hasLostMana(adventurer) && (
        <button
          onClick={() => {
            dispatch({ type: "setSelectedAdventurer", payload: adventurer });
            // claimById(adventurer.id);
          }}
          className="m-auto text-center rounded-md border-gray-200 shadow-sm w-full border py-2 my-2"
        >
          Name Lost Mana
        </button>
      )} */}
    </div>
  );
}

function LostManaNamingModal() {
  const { state, dispatch } = useContext(GenesisAdventurerPageContext);
  const [selectedNames, setSelectedNames] = useState([]);
  const [stats, setStats] = useState({
    greatness: getGreatness(),
    level: getLevel(),
    rating: getRating()
  });
  const {
    nameLostMana,
    approveATimeContract,
    isAtimeAppoved,
    isAtimeAppoving,
    isAtimeUnAppoved
  } = useAdventurerContract();

  const inventoryIds = [];
  for (let i = 0; i < state.selectedAdventurer?.lootTokenIds?.length; i++) {
    if (state.selectedAdventurer.lootTokenIds[i] == 0) {
      inventoryIds.push(i);
    }
  }

  useEffect(() => {
    setStats({
      greatness: getGreatness(),
      level: getLevel(),
      rating: getRating()
    });
  }, [state.selectedAdventurer, selectedNames]);

  const { data, loading, refetch } = useLostManaNames(
    {
      orderId: state.selectedAdventurer?.orderId,
      inventoryId_in: inventoryIds
    },
    !state.selectedAdventurer
  );
  const defaultNames = [
    "weapon",
    "chest",
    "head",
    "waist",
    "foot",
    "hand",
    "neck",
    "ring"
  ];

  function onSelectName(name, inventoryId) {
    let list = selectedNames.filter((item) => item.inventoryId !== inventoryId);
    // new item
    if (name) {
      list.push(name);
    }
    setSelectedNames([...list]);
  }

  function inventoryItemOrLostManaName(inventoryId) {
    if (state.selectedAdventurer.lootTokenIds[inventoryId] !== 0) {
      return (
        <div className="px-2">
          {state.selectedAdventurer[defaultNames[inventoryId]]}
        </div>
      );
    }
    const lostManaNames =
      data?.lostManaNames
        .filter((name) => name.inventoryId === inventoryId)
        .map((lostMana, idx) => {
          return {
            ...lostMana,
            value: idx,
            label: `${lostMana.itemName}   (${lostMana.itemGreatness}, ${lostMana.itemLevel}, ${lostMana.itemRating}) - ${lostMana.available} Remaining`
          };
        }) || [];
    if (lostManaNames.length === 0) {
      return (
        <div className="px-2">
          {state.selectedAdventurer[defaultNames[inventoryId]]}
        </div>
      );
    }

    return (
      <Select
        isClearable={true}
        options={lostManaNames}
        onChange={(val) => {
          onSelectName(val, inventoryId);
        }}
        value={
          selectedNames.filter((name) => name.iventoryId === inventoryId)[0]
        }
        placeholder={state.selectedAdventurer[defaultNames[inventoryId]]}
      />
    );
  }

  function getGreatness() {
    let greatness = state.selectedAdventurer?.greatness ?? 0;
    if (greatness === 0) {
      return 0;
    }
    for (let name of selectedNames) {
      greatness -= 15;
      greatness += name.itemGreatness;
    }
    return greatness;
  }

  function getLevel() {
    let level = state.selectedAdventurer?.level ?? 0;
    if (level === 0) {
      return 0;
    }
    for (let name of selectedNames) {
      level -= 1;
      level += name.itemLevel;
    }
    return level;
  }

  function getRating() {
    let rating = state.selectedAdventurer?.rating ?? 0;
    if (rating === 0) {
      return 0;
    }
    for (let name of selectedNames) {
      rating -= 15;
      rating += name.itemRating;
    }
    return rating;
  }

  if (!state.selectedAdventurer) {
    return null;
  }

  function canUpdate() {
    return isAtimeAppoved && selectedNames.length > 0;
  }
  return (
    <Modal
      isOpen={!!state.selectedAdventurer}
      title="Lost Mana Naming"
      onClose={() => {
        dispatch({ type: "setSelectedAdventurer", payload: null });
      }}
    >
      {!isAtimeAppoved && (
        <button
          className="my-2 p-2 font-extrabold rounded-md text-center w-full"
          style={{
            backgroundColor: "rgb(96 165 250)",
            color: "#fff"
          }}
          onClick={async () => {
            if (!isAtimeAppoved) {
              await approveATimeContract();
            }
          }}
        >
          Approve $ATIME
        </button>
      )}
      <ul className="flex flex-col gap-2 text-xs mt-2">
        <li>{inventoryItemOrLostManaName(0)}</li>
        <li>{inventoryItemOrLostManaName(1)}</li>
        <li>{inventoryItemOrLostManaName(2)}</li>
        <li>{inventoryItemOrLostManaName(3)}</li>
        <li>{inventoryItemOrLostManaName(4)}</li>
        <li>{inventoryItemOrLostManaName(5)}</li>
        <li>{inventoryItemOrLostManaName(6)}</li>
        <li>{inventoryItemOrLostManaName(7)}</li>
      </ul>
      <ul className="flex text-sm font-semibold gap-2 p-2">
        <li>Greatness: {stats.greatness}</li>
        <li>Level: {stats.level}</li>
        <li>Rating: {stats.rating}</li>
      </ul>
      <button
        disabled={!canUpdate()}
        className="px-4 py-2 font-extrabold rounded-md text-center w-full"
        style={{
          backgroundColor: canUpdate() ? "rgb(96 165 250)" : "#ccc",
          color: canUpdate() ? "#fff" : "#fff"
        }}
        onClick={async () => {
          if (!canUpdate()) {
            return;
          }
          try {
            await nameLostMana(
              parseInt(state.selectedAdventurer.id),
              selectedNames.map((name) => {
                return {
                  lootTokenId: parseInt(name.lootTokenId),
                  inventoryId: parseInt(name.inventoryId)
                };
              })
            );
            dispatch({ type: "setSelectedAdventurer", payload: null });
          } catch (e) {
            console.log(e);
          }
        }}
      >
        Update Adventurer
      </button>
    </Modal>
  );
}
