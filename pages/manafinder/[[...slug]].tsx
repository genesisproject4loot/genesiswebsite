// Imports
import Layout from "@components/Layout"; // Layout wrapper
import styles from "@styles/pages/Manafinder.module.scss"; // Styles
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import Select from "react-select";
import suffices from "@data/suffices.json";
import inventory from "@data/inventory.json";
import { useUnclaimedMana, useClaimedMana } from "hooks/useMana";

// Types
import type { ReactElement } from "react";
import type {
  ManaVars,
  ManaData,
  Bag,
  BagData,
  BagVars,
  TokenListProps
} from "@utils/manaFinderTypes";
import { useWalletContext } from "hooks/useWalletContext";
import { useManaContract } from "hooks/useManaContract";

export default function Home(props): ReactElement {
  const router = useRouter();

  const [suffixId, inventoryId] = (
    (router.query.slug as string[]) || ["-1", "-1"]
  ).map((val) => (val ? parseInt(val) : 0));

  const onChangeSuffixId = (item: any) => {
    router.push(`/manafinder/${item.value || 0}/${inventoryId}`, undefined, {
      shallow: true
    });
  };

  const onChangeInventoryId = (item: any) => {
    router.push(`/manafinder/${suffixId}/${item.value || 0}`, undefined, {
      shallow: true
    });
  };

  return (
    <Layout>
      <div>
        <div className={styles.manafinder__intro}>
          {/* CTA title */}
          <h1>Mana Finder</h1>
          {/* CTA Description */}
          <p>
            The Genesis Project is a community of builders, designers,
            mathematicians and storytellers on a mission to discover the origin
            story of the Loot universe.
            <br />
            <br />
            Whether by chance, inevitability or divine design, the data reveals
            a hidden scaffolding behind the game, hiding in plain sight —{" "}
            <b>
              within the seemingly random Loot bags, there is a clear and
              singular Order to the Loot Universe.
            </b>
            The Genesis Project seeks not to <i>create</i>, but to{" "}
            <b>discover</b> the origin story of Loot (for Adventurers).
            <br />
            <br />
            Join us on our quest to restore the original Orders of Loot and
            resurrect the Genesis Adventurers.
          </p>
        </div>
        <div className={styles.manafinder__app}>
          <div className={styles.controls}>
            <Select
              id="order-dropdown"
              instanceId="order-dropdown"
              placeholder="Select an Order..."
              value={suffices.find((item) => parseInt(item.value) == suffixId)}
              onChange={onChangeSuffixId}
              className={styles.suffixDropdown}
              options={suffices}
            />
            <Select
              id="item-dropdown"
              instanceId="item-dropdown"
              placeholder="Select an Item..."
              value={inventory.find(
                (item) => parseInt(item.value) == inventoryId
              )}
              onChange={onChangeInventoryId}
              className={styles.inventoryDropdown}
              options={inventory}
            />
          </div>
          <ClaimedMana suffixId={suffixId} inventoryId={inventoryId} />
          <UnClaimedMana suffixId={suffixId} inventoryId={inventoryId} />
        </div>
      </div>
    </Layout>
  );
}

function ClaimedMana(props: { suffixId: number; inventoryId: number }) {
  const { loading, data, error } = useClaimedMana(
    props.suffixId,
    props.inventoryId
  );
  const { data: openseaData } = useOpenseaManaData(
    (data?.manas ?? []).map((mana) => mana.id.toString())
  );
  const { loading: loadingNFTx, data: dataNFTx, error: errorNFTx } = useNFTx();
  const { loading: loadingSS, data: dataSS, error: errorSS } = useSushiSwap();
  const { account } = useWalletContext();

  const isOwnedByWallet = (item) =>
    item.currentOwner?.id?.toLowerCase() === account?.toLowerCase();

  let NFTxFloorPrice;
  if (!loadingNFTx && !loadingSS) {
    NFTxFloorPrice =
      (dataNFTx?.vaults[0].fees.targetRedeemFee / 1000000000000000000 + 1) *
      dataSS?.token.derivedETH;
  } else {
    NFTxFloorPrice = 0;
  }

  const tableData = (data?.manas ?? []).map((item) => ({
    id: Number(item.id),
    name: item.itemName,
    address: item.currentOwner?.id,
    action: isOwnedByWallet(item) ? (<span>Owned</span>) : null,
    price:
      item.currentOwner?.id == "0x2d77f5b3efa51821ad6483adaf38ea4cb1824cc5" &&
      !loadingNFTx &&
      !loadingSS
        ? NFTxFloorPrice
        : openseaData?.queryManas?.manas?.find((mana) => mana.id == item.id)
            ?.price
  }));

  return (
    <div>
      <h2>Claimed Mana</h2>
      {loading ? (
        <p>Loading ...</p>
      ) : (
        <TokenList
          name="Mana"
          data={tableData}
          address="0xf4b6040a4b1b30f1d1691699a8f3bf957b03e463"
        />
      )}
    </div>
  );
}

function UnClaimedMana(props: { suffixId: number; inventoryId: number }) {
  const {
    loading,
    data,
    refetch: refetchUnclaimedMana
  } = useUnclaimedMana(props.suffixId, props.inventoryId);
  const { data: openseaData, refetch: refetchOpenseaBagsData } =
    useOpenseaBagsData((data?.bags ?? []).map((bag) => bag.id.toString()));
  const { account } = useWalletContext();
  const { mintMana } = useManaContract();
  const [mintsInProgress, setMintsInProgress] = useState<any[]>([]);

  const isMintInProgress = (id) => mintsInProgress.includes(id);
  const isOwnedByWallet = (item) =>
    item.currentOwner?.id?.toLowerCase() === account?.toLowerCase();

  async function onMintMana(bag: Bag) {
    if (isMintInProgress(bag.id)) {
      return;
    }
    setMintsInProgress([...mintsInProgress, bag.id]);
    try {
      const transaction = await mintMana(bag.id, props.inventoryId + 1);
      const done = await transaction.wait();
      console.log(done);
      setTimeout(async () => {
        await refetchUnclaimedMana();
        await refetchOpenseaBagsData();
        setMintsInProgress(mintsInProgress.filter((id) => id !== bag.id));
      }, 1000);
    } catch (e) {
      alert(e?.data?.message ?? e?.message ?? "Error");
    }
  }

  const tableData = (data?.bags ?? []).map((item) => ({
    id: Number(item.id),
    name: item.itemName,
    address: item.currentOwner?.id,
    action: isOwnedByWallet(item) ? (
      isMintInProgress(item.id) ? (
        "In progress"
      ) : (
        <a onClick={() => onMintMana(item)}>mint</a>
      )
    ) : null,
    price: openseaData?.queryBags?.bags?.find((bag) => bag.id == item.id)?.price
  }));

  return (
    <div>
      <h2>Unclaimed Mana</h2>
      {loading ? (
        <p>Loading ...</p>
      ) : (
        <TokenList
          name="Loot"
          data={tableData}
          address="0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7"
        />
      )}
    </div>
  );
}

function useNFTx() {
  const GET_NFTX_DATA = gql`
    query GetNFTxData {
      vaults(where: { vaultId: 209 }) {
        fees {
          targetRedeemFee
        }
      }
    }
  `;

  return useQuery(GET_NFTX_DATA, {
    context: {
      nftx: true
    }
  });
}

function useSushiSwap() {
  const GET_SUSHI_SWAP_DATA = gql`
    query GetSushiSwapData {
      token(id: "0x2d77f5b3efa51821ad6483adaf38ea4cb1824cc5") {
        derivedETH
      }
    }
  `;

  return useQuery(GET_SUSHI_SWAP_DATA, {
    context: {
      sushiswap: true
    }
  });
}

function useOpenseaManaData(tokenIds: string[]) {
  const GET_OPENSEA_MANA_DATA = gql`
    query GetOpenSeaManaData($tokenIds: String) {
      queryManas(tokenIds: $tokenIds)
        @rest(
          type: "OpenSeaManaData"
          method: "GET"
          path: "/mana?tokenIds={args.tokenIds}"
        ) {
        manas {
          id
          url
          price
        }
        lastUpdate
      }
    }
  `;

  return useQuery(GET_OPENSEA_MANA_DATA, {
    variables: {
      tokenIds: (tokenIds ?? []).join(",")
    },
    context: {
      restful: true
    }
  });
}

function useOpenseaBagsData(tokenIds: string[]) {
  const GET_OPENSEA_BAGS_DATA = gql`
    query GetOpenSeaBagsData($tokenIds: String) {
      queryBags(tokenIds: $tokenIds)
        @rest(
          type: "OpenSeaBagsData"
          method: "GET"
          path: "/bags?tokenIds={args.tokenIds}"
        ) {
        bags {
          id
          url
          price
        }
        lastUpdate
      }
    }
  `;

  return useQuery(GET_OPENSEA_BAGS_DATA, {
    variables: {
      tokenIds: (tokenIds ?? []).join(",")
    },
    context: {
      restful: true
    }
  });
}

function shortenAddress(address: string) {
  return address.slice(0, 6) + "…" + address.slice(-4);
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

function TokenList(props: TokenListProps): ReactElement {
  // const data = props.data;
  const data = props.data.filter((item) => !item.action);
  const actions = props.data.filter((item) => item.action);
  const {
    items: sortedData,
    requestSort,
    sortConfig
  } = useSortableData(data, { key: "price", direction: "ascending" });
  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <table>
      <thead>
        <tr>
          <th className={styles.header_id}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                requestSort("id");
              }}
              className={styles?.[getClassNamesFor("id")]}
            >
              {props.name} Token ID
            </a>
          </th>
          <th>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                requestSort("name");
              }}
              className={styles?.[getClassNamesFor("name")]}
            >
              Item Name
            </a>
          </th>
          <th className={styles.header_address}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                requestSort("address");
              }}
              className={styles?.[getClassNamesFor("address")]}
            >
              Owner
            </a>
          </th>
          <th>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                requestSort("price");
              }}
              className={styles?.[getClassNamesFor("price")]}
            >
              Buy
            </a>
          </th>
        </tr>
      </thead>
      <tbody>
        {actions &&
          actions.map((item) => (
            <tr key={item.id}>
              <td className={styles.tokenId}>
                <OpenseaLink
                  address={props.address}
                  tokenid={item.id}
                  text={item.id}
                />
              </td>
              <td>{item.name}</td>
              <td>
                <OpenseaLink
                  address={item.address}
                  tokenid={undefined}
                  text={shortenAddress(item.address)}
                />
              </td>
              <td className={styles.action}>{item.action}</td>
            </tr>
          ))}
        {sortedData &&
          sortedData.map((item) => (
            <tr key={item.id}>
              <td className={styles.tokenId}>
                <OpenseaLink
                  address={props.address}
                  tokenid={item.id}
                  text={item.id}
                />
              </td>
              <td>{item.name}</td>
              <td>
                <OpenseaLink
                  address={item.address}
                  tokenid={undefined}
                  text={shortenAddress(item.address)}
                />
              </td>
              <td
                className={[styles.price, item.price ? styles.eth : ""].join(
                  " "
                )}
              >
                <BuyItNowLink
                  price={item.price}
                  ownerAddress={item.address}
                  itemAddress={props.address}
                  tokenid={item.id}
                  text={item.id}
                />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

function BuyItNowLink(props: {
  price: number;
  ownerAddress: string;
  itemAddress: string;
  tokenid: number;
  text: string;
}): ReactElement {
  if (props.price && props.price > 0) {
    const price = props.price
      .toFixed(2)
      .replace(/[.,]00$/, "")
      .toString();
    if (props.ownerAddress == "0x2d77f5b3efa51821ad6483adaf38ea4cb1824cc5") {
      return (
        <NFTxLink
          address={props.ownerAddress}
          tokenid={props.tokenid}
          text={price}
        />
      );
    } else {
      return (
        <OpenseaLink
          address={props.itemAddress}
          tokenid={props.tokenid}
          text={price}
        />
      );
    }
  } else {
    return <span>--</span>;
  }
}

function NFTxLink(props: {
  address: string;
  tokenid: number;
  text: string;
}): ReactElement {
  return (
    <a
      href={"//nftx.io/vault/0x2d77f5b3efa51821ad6483adaf38ea4cb1824cc5/buy/"}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.text}
    </a>
  );
}

function OpenseaLink(props: {
  address: string;
  tokenid: number;
  text: string;
}): ReactElement {
  return (
    <a
      href={
        "//opensea.io" +
        (props.tokenid ? "/assets" : "") +
        "/" +
        props.address +
        (props.tokenid ? "/" + props.tokenid : "")
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.text}
    </a>
  );
}
