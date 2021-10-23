import React, { ReactElement, useState } from "react";
import Layout_V2 from "@components/Layout_V2";
import GenesisAdventurerChart from "@components/charts/GenesisAdventurerChart";

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

export default function Chapter2_V2(): ReactElement {
  return (
    <Layout_V2>
      <div className={styles.leaderboard__app}>
        <GenesisAdventurerHeader />
        <div className={styles.main}>
          <GenesisAdventurersGrid />
        </div>
      </div>
    </Layout_V2>
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
  const { data } = useAdventurerRawQuery(
    {
      currentOwner: account?.toLowerCase()
    },
    !account
  );

  const adventurerImage = (adventurer) => {
    const data = JSON.parse(atob(adventurer.tokenURI.split(",")[1]));
    return data.image;
  };

  return (
    <>
      {!isConnected && (
        <h1 className="text-xl text-center pt-10">
          Connect your wallet to see your Adventurers.
        </h1>
      )}
      <div className="flex content-evenly gap-8 flex-wrap">
        {data?.adventurers?.map((adventurer) => {
          return (
            <div
              key={adventurer.id}
              className="rounded-md border border-gray-300 shadow-md p-6 flex flex-col"
            >
              <img
                className="rounded-md"
                width="292px"
                height="292px"
                src={adventurerImage(adventurer)}
              />
              <label className="font-bold text-base pt-5 pb-4">
                Genesis Adventurer # {adventurer.id}
              </label>
              <div className="flex flex-col text-blue-400 text-sm items-end pr-2">
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
              </div>
              {/* <button
              onClick={() => alert("to be implemented")}
              className="m-auto text-center rounded-md border-gray-200 shadow-sm w-full border py-2 mb-6"
            >
              Claim $ATIME
            </button>

            <div className="flex pt-4 border-t border-gray-200">
              <span className="flex-1 text-gray-600">AVAILABLE $ATIME</span>
              <span>20,320</span>
            </div> */}
            </div>
          );
        })}
      </div>
    </>
  );
}
