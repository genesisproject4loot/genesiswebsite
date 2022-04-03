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
// import { rarityDescription } from "loot-rarity";

interface GenesisAdventurerPageState {
  selectedLostManaAdventurer: any;
  selectedNameAdventurer: any;
}

const defaultGenesisAdventurerPageState: GenesisAdventurerPageState = {
  selectedLostManaAdventurer: null,
  selectedNameAdventurer: null
};

type GenesisAdventurerPageAction =
  | { type: "setSelectedLostManaAdventurer"; payload: any }
  | { type: "setSelectedNameAdventurer"; payload: any };

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
    case "setSelectedLostManaAdventurer":
      return {
        ...state,
        selectedNameAdventurer: null,
        selectedLostManaAdventurer: action.payload
      };
    case "setSelectedNameAdventurer":
      return {
        ...state,
        selectedLostManaAdventurer: null,
        selectedNameAdventurer: action.payload
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
        {state.selectedLostManaAdventurer && (
          <LostManaNamingModal key={state.selectedLostManaAdventurer} />
        )}
        {state.selectedNameAdventurer && (
          <NameAdventurerModal key={state.selectedNameAdventurer} />
        )}
      </Layout_V2>
    </GenesisAdventurerPageContext.Provider>
  );
}

function GenesisAdventurerHeader() {
  return (
    <div className={styles.hdr}>
      <h1 className="pb-4">Genesis Adventurers</h1>
      <div className={styles.chart}>
        <div className="flex flex-col gap-2 px-5 md:flex-row md:gap-4">
          <div className="w-full mt-2 md:w-2/5">
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
      <h1 className="pb-2 text-xl font-bold text-center">Leaderboard</h1>
      <ul onMouseOut={onMouseOutLeaderboard}>
        {data?.wallets?.slice(offset, end).map((wallet, idx) => {
          const number = page * LIMIT + idx + 1;
          return (
            <li
              key={wallet.id}
              onMouseOver={() => onMouseOverLeader(number)}
              className="relative grid items-center justify-center w-full grid-cols-4 gap-1"
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
      <div className="flex justify-end gap-4 py-4 text-base underline">
        <button onClick={prevPage}>Prev</button>{" "}
        <button onClick={nextPage}>Next</button>
      </div>
    </div>
  );
}

function GenesisAdventurerLeaderboardRow({ wallet, showOverlay, maxValue }) {
  const { ensName } = useEnsLookup(wallet.id);
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
          className="absolute top-0 z-50 hidden p-4 ml-5 text-black bg-white rounded-md shadow-md md:block left-full"
          style={{ minWidth: 160 }}
        >
          <h1 className="flex pb-1 font-semibold border-b border-gray-200 ">
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
                  className="flex w-full gap-4 py-1"
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

function SortIndicator({ direction }) {
  return (
    <span>
      {direction === "desc" && "↓"}
      {direction === "asc" && "↑"}
    </span>
  );
}

function GenesisAdventurersGrid() {
  const { account } = useWalletContext();
  const { state } = useContext(GenesisAdventurerPageContext);
  const [selectedTab, setSelectedTab] = useState(0);
  const [sort, setSort] = useState({ sortBy: "rating", sortDirection: "desc" });

  const tabs = account ? ["My Wallet", "All"] : ["All"];
  const { data, refetch } = useAdventurerRawQuery(
    tabs[selectedTab] === "My Wallet"
      ? { currentOwner: account?.toLowerCase() }
      : { currentOwner_not: "" },
    { skip: selectedTab === 1 && !account, ...sort }
  );

  const isSortByGreatness = () => sort.sortBy == "greatness";
  const isSortByLevel = () => sort.sortBy == "level";
  const isSortByRating = () => sort.sortBy == "rating";
  const handleSortClick = (sortBy) => () => {
    if (sortBy === sort.sortBy) {
      setSort({
        sortBy,
        sortDirection: sort.sortDirection == "desc" ? "asc" : "desc"
      });
    } else {
      setSort({ sortBy, sortDirection: "desc" });
    }
  };

  useEffect(() => {
    if (!state.selectedLostManaAdventurer || !state.selectedNameAdventurer) {
      setTimeout(refetch, 1000);
    }
  }, [state.selectedLostManaAdventurer, state.selectedNameAdventurer]);

  return (
    <>
      <ul className="flex flex-row gap-4 pb-4 text-xl">
        {tabs.map((tab, idx) => {
          return (
            <li
              onClick={() => {
                setSelectedTab(idx);
              }}
              className={
                idx === selectedTab
                  ? "border-b-2 text-black border-black"
                  : "text-gray-300 cursor-pointer hover:text-black hover:border-b hover:border-black"
              }
              key={tab}
            >
              {tab}
            </li>
          );
        })}
      </ul>
      {/* {!isConnected && (
        <h1 className="pt-10 text-xl text-center">
          Connect your wallet to see your Adventurers.
        </h1>
      )} */}
      <table className="w-full table-fixed">
        <thead className="font-semibold">
          <tr>
            <td className="w-16">#</td>
            <td className="w-52">Bag</td>
            <td>Name</td>
            <td>Order</td>
            <td>Owner</td>
            <td className="w-48 pr-10 text-right">
              <div
                className="cursor-pointer"
                onClick={handleSortClick("greatness")}
              >
                Greatness{" "}
                {isSortByGreatness() && (
                  <SortIndicator direction={sort.sortDirection} />
                )}
              </div>
            </td>
            <td className="w-48 pr-10 text-right">
              <div
                className="cursor-pointer"
                onClick={handleSortClick("level")}
              >
                Level{" "}
                {isSortByLevel() && (
                  <SortIndicator direction={sort.sortDirection} />
                )}
              </div>
            </td>
            <td className="w-48 pr-10 text-right">
              <div
                className="cursor-pointer"
                onClick={handleSortClick("rating")}
              >
                Rating{" "}
                {isSortByRating() && (
                  <SortIndicator direction={sort.sortDirection} />
                )}
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          {data?.adventurers?.map((adventurer, idx) => {
            return (
              <GenesisAdventurerTableRow
                key={adventurer.id}
                adventurer={adventurer}
                rank={idx + 1}
              />
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function GLRProgressBar({ text, percentage }) {
  return (
    <div>
      <div className="text-sm text-right text-gray-400" style={{ width: 150 }}>
        {text}
      </div>

      <div
        className="relative h-4 rounded-lg"
        style={{ width: 150, backgroundColor: " rgb(229, 232, 235)" }}
      >
        <span
          className="block h-4 rounded-lg"
          style={{
            backgroundColor: "rgb(32, 129, 226)",
            width: percentage * 150
          }}
        ></span>
      </div>
    </div>
  );
}

function GenesisAdventurerTableRow({ adventurer, rank }) {
  const { dispatch } = useContext(GenesisAdventurerPageContext);
  const { ensName } = useEnsLookup(adventurer?.currentOwner?.id);
  const { account, isConnected } = useWalletContext();

  const { isClaimed, claimById, amountPerToken } = useAtimeSeasonClaimed(
    adventurer.id
  );

  const adventurerImage = (adventurer) => {
    try {
      const data = JSON.parse(
        decodeURIComponent(atob(adventurer.tokenURI.split(",")[1]))
      );
      return data.image;
    } catch (e) {
      console.log(e);
      return "";
    }
  };

  const adventurerName = (adventurer) => {
    try {
      const data = JSON.parse(atob(adventurer.tokenURI.split(",")[1]));
      return decodeURIComponent(escape(data.name));
    } catch (e) {
      console.log(e);
      return "";
    }
  };

  const hasLostMana = (adventurer) =>
    adventurer.currentOwner?.id?.toLowerCase() === account?.toLowerCase() &&
    adventurer.lootTokenIds.filter((tokenId) => tokenId === 0).length > 0;

  const canRenameGA = (adventurer) =>
    adventurer.currentOwner?.id?.toLowerCase() === account?.toLowerCase();

  return (
    <tr>
      <td className="pt-5 align-top">{rank}.</td>
      <td className="pt-5 align-top">
        <a
          href={`https://opensea.io/assets/0x8db687aceb92c66f013e1d614137238cc698fedb/${adventurer.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="rounded-md"
            width="180px"
            height="180px"
            src={adventurerImage(adventurer)}
          />
        </a>
      </td>
      <td className="pt-5 align-top">
        {adventurerName(adventurer)}{" "}
        <div className="flex flex-row gap-2">
          {canRenameGA(adventurer) && (
            <button
              onClick={() => {
                dispatch({
                  type: "setSelectedNameAdventurer",
                  payload: adventurer
                });
              }}
              className="flex text-sm text-blue-400"
            >
              [rename]
            </button>
          )}
          {hasLostMana(adventurer) && (
            <button
              onClick={() => {
                dispatch({
                  type: "setSelectedLostManaAdventurer",
                  payload: adventurer
                });
              }}
              className="flex text-sm text-blue-400"
            >
              [upgrade]
            </button>
          )}
        </div>
      </td>
      <td className="pt-5 align-top">
        of{" "}
        {
          SUFFICES.find((suffix) => suffix.value === String(adventurer.orderId))
            .label
        }
      </td>
      <td className="pt-5 align-top">
        <a
          href={`https://opensea.io/assets/0x8db687aceb92c66f013e1d614137238cc698fedb/${adventurer.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400"
        >
          {ensName || shortenAddress(adventurer?.currentOwner?.id)}
        </a>
      </td>
      <td className="pt-5 align-top">
        <GLRProgressBar
          text={`${adventurer.greatness}/160`}
          percentage={adventurer.greatness / 160}
        />
      </td>
      <td className="pt-5 align-top">
        <GLRProgressBar
          text={`${adventurer.level}/36`}
          percentage={adventurer.level / 36}
        />
      </td>
      <td className="pt-5 align-top">
        <GLRProgressBar
          text={`${adventurer.rating}/720`}
          percentage={adventurer.rating / 720}
        />
      </td>
    </tr>
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
  const { nameLostMana, approveATimeContract, isAtimeAppoved } =
    useAdventurerContract();

  const inventoryIds = [];
  for (
    let i = 0;
    i < state.selectedLostManaAdventurer?.lootTokenIds?.length;
    i++
  ) {
    if (state.selectedLostManaAdventurer.lootTokenIds[i] == 0) {
      inventoryIds.push(i);
    }
  }

  useEffect(() => {
    setStats({
      greatness: getGreatness(),
      level: getLevel(),
      rating: getRating()
    });
  }, [state.selectedLostManaAdventurer, selectedNames]);

  const { data, loading, refetch } = useLostManaNames(
    {
      orderId: state.selectedLostManaAdventurer?.orderId,
      inventoryId_in: inventoryIds,
      available_gt: 0
    },
    !state.selectedLostManaAdventurer
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
    if (state.selectedLostManaAdventurer.lootTokenIds[inventoryId] !== 0) {
      return (
        <div className="px-2">
          {state.selectedLostManaAdventurer[defaultNames[inventoryId]]}
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
            label: `${lostMana.itemName} - ${lostMana.itemClass} (${lostMana.itemGreatness}, ${lostMana.itemLevel}, ${lostMana.itemRating}) - ${lostMana.available} Remaining`
          };
        }) || [];
    if (lostManaNames.length === 0) {
      return (
        <div className="px-2">
          {state.selectedLostManaAdventurer[defaultNames[inventoryId]]}
        </div>
      );
    }

    return (
      <Select
        isClearable={true}
        options={lostManaNames}
        maxMenuHeight={130}
        onChange={(val) => {
          onSelectName(val, inventoryId);
        }}
        value={
          selectedNames.filter((name) => name.iventoryId === inventoryId)[0]
        }
        placeholder={
          state.selectedLostManaAdventurer[defaultNames[inventoryId]]
        }
      />
    );
  }

  function getGreatness() {
    let greatness = state.selectedLostManaAdventurer?.greatness ?? 0;
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
    let level = state.selectedLostManaAdventurer?.level ?? 0;
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
    let rating = state.selectedLostManaAdventurer?.rating ?? 0;
    if (rating === 0) {
      return 0;
    }
    for (let name of selectedNames) {
      rating -= 15;
      rating += name.itemRating;
    }
    return rating;
  }

  if (!state.selectedLostManaAdventurer) {
    return null;
  }

  function canUpdate() {
    return isAtimeAppoved && selectedNames.length > 0;
  }
  return (
    <Modal
      isOpen={!!state.selectedLostManaAdventurer}
      title="Lost Mana Naming"
      onClose={() => {
        dispatch({ type: "setSelectedLostManaAdventurer", payload: null });
      }}
    >
      {!isAtimeAppoved && (
        <button
          className="w-full p-2 my-2 font-extrabold text-center rounded-md"
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
      <ul className="flex flex-col gap-2 mt-2 text-sm">
        <li>{inventoryItemOrLostManaName(0)}</li>
        <li>{inventoryItemOrLostManaName(1)}</li>
        <li>{inventoryItemOrLostManaName(2)}</li>
        <li>{inventoryItemOrLostManaName(3)}</li>
        <li>{inventoryItemOrLostManaName(4)}</li>
        <li>{inventoryItemOrLostManaName(5)}</li>
        <li>{inventoryItemOrLostManaName(6)}</li>
        <li>{inventoryItemOrLostManaName(7)}</li>
      </ul>
      <ul className="flex gap-2 p-2 mt-4 mb-16 text-sm font-semibold border-t border-gray-100">
        <li>Greatness: {stats.greatness}</li>
        <li>Level: {stats.level}</li>
        <li>Rating: {stats.rating}</li>
      </ul>
      <button
        disabled={!canUpdate()}
        className="w-full px-4 py-2 font-extrabold text-center rounded-md"
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
              parseInt(state.selectedLostManaAdventurer.id),
              selectedNames.map((name) => {
                return {
                  lootTokenId: parseInt(name.lootTokenId),
                  inventoryId: parseInt(name.inventoryId)
                };
              })
            );
            dispatch({ type: "setSelectedLostManaAdventurer", payload: null });
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

function NameAdventurerModal() {
  const { state, dispatch } = useContext(GenesisAdventurerPageContext);

  const {
    nameAdventurer,
    approveATimeContract,
    isAtimeAppoved,
    isAtimeUnAppoved,
    isNameTooLong
  } = useAdventurerContract();

  const [name, setName] = useState("");

  function canUpdate() {
    return isAtimeAppoved && name.length > 0 && name.length <= 42;
  }
  const adventurerName = (adventurer) => {
    try {
      const data = JSON.parse(atob(adventurer.tokenURI.split(",")[1]));
      return decodeURI(escape(data.name));
    } catch (e) {
      return "";
    }
  };

  return (
    <Modal
      isOpen={!!state.selectedNameAdventurer}
      title="Name Your Adventurer "
      onClose={() => {
        dispatch({ type: "setSelectedLostManaAdventurer", payload: null });
      }}
    >
      {isAtimeUnAppoved && (
        <button
          className="w-full p-2 my-2 mt-4 font-extrabold text-center rounded-md"
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

      <div className="my-4">
        <input
          className="w-full px-4 py-2 leading-tight text-gray-700 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-blue-500"
          type="text"
          placeholder="Name"
          maxLength={42}
          onChange={(event) => {
            setName(event.target.value.trim());
          }}
        />
        <div className="mb-16 text-sm text-right text-red-400">
          {isNameTooLong(name.trim()) ? "Please shorten name" : ""}
        </div>
      </div>
      <button
        disabled={!canUpdate()}
        className="w-full px-4 py-2 font-extrabold text-center rounded-md"
        style={{
          backgroundColor: canUpdate() ? "rgb(96 165 250)" : "#ccc",
          color: canUpdate() ? "#fff" : "#fff"
        }}
        onClick={async () => {
          if (!canUpdate()) {
            return;
          }
          try {
            await nameAdventurer(
              parseInt(state.selectedNameAdventurer.id),
              name
            );

            dispatch({ type: "setSelectedNameAdventurer", payload: null });
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
