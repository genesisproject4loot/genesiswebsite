// Imports
import Layout from "@components/Layout"; // Layout wrapper
import styles from "@styles/pages/Manafinder.module.scss"; // Styles
import { gql,useQuery } from '@apollo/client';
import { useRouter } from "next/router";
import { useState, useMemo, useEffect } from "react";
import Select from 'react-select'
import suffices from '@data/suffices.json'
import inventory from '@data/inventory.json'
// import { format as ts } from 'timeago.js'

// Types
import type { ReactElement } from "react";
import type {Mana, ManaVars, ManaData, Bag, BagData, BagVars, Wallet, TokenListProps} from '@utils/manaFinderTypes'

export default function Home(props): ReactElement {
  const router = useRouter();
  const [suffixId, inventoryId] = (
    (router.query.slug as string[]) || ["-1", "-1"]
  ).map((val) => (val ? parseInt(val) : 0));


  const onChangeSuffixId = (item: any) => {
    router.push(`/manafinder/${item.value || 0}/${inventoryId}`, undefined, { shallow: true });
  };

  const onChangeInventoryId = (item: any) => {
    router.push(`/manafinder/${suffixId}/${item.value || 0}`, undefined, { shallow: true });
  };

 
  return (
    <Layout>
      <div>
        <div className={styles.manafinder__intro}>
          {/* CTA title */}
          <h1>Mana Finder</h1>
          {/* CTA Description */}
          <p>
            The Genesis Project is a community of  builders, designers, mathematicians and storytellers on a mission to discover the origin story of the Loot universe.
            <br /><br />
            Whether by chance, inevitability or divine design, the data reveals a hidden scaffolding behind the game, hiding in plain sight — <b>within the seemingly random Loot bags, there is a clear and singular Order to the Loot Universe.</b>
            The Genesis Project seeks not to <i>create</i>, but to <b>discover</b> the origin story of Loot (for Adventurers).
            <br /><br />
            Join us on our quest to restore the original Orders of Loot and resurrect the Genesis Adventurers.
          </p>
        </div>
        <div className={styles.manafinder__app}>
          <div className={styles.controls}>
            <Select
              id="order-dropdown"
              instanceId="order-dropdown"
              placeholder="Select an Order..."
              value={suffices.find(
                (item) => parseInt(item.value) == suffixId
              )}
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


function ClaimedMana(props: {suffixId:number, inventoryId:number}) {
  const { loading, data, error } = useClaimedMana(props.suffixId, props.inventoryId);
  const { data: openseaData } = useOpenseaManaData((data?.manas ?? []).map(mana => mana.id.toString()));

  const tableData = (data?.manas??[]).map((item) => ({
    id: Number(item.id),
    name: item.itemName,
    address: item.currentOwner?.id,
    price: openseaData?.queryManas?.manas?.find(mana => mana.id == item.id)?.price
  }));

  return (
    <div>
      <h2>Claimed Mana</h2>
      {loading ? <p>Loading ...</p> : <TokenList name ="Mana" data={tableData} address="0xf4b6040a4b1b30f1d1691699a8f3bf957b03e463"/>}
    </div>
  );
}

function UnClaimedMana(props: {suffixId:number, inventoryId:number}) {
  const { loading, data, error } = useUnclaimedMana(props.suffixId, props.inventoryId);  
  const { data: openseaData } = useOpenseaBagsData((data?.bags ?? []).map(bag => bag.id.toString()));

  const tableData = (data?.bags??[]).map((item) => ({
    id: Number(item.id),
    name: item.itemName,
    address: item.currentOwner?.id,
    price: openseaData?.queryBags?.bags?.find(bag => bag.id == item.id)?.price
  }));

  return (
    <div>
      <h2>Unclaimed Mana</h2>
      {loading ? <p>Loading ...</p> : <TokenList name ="Loot" data={tableData} address="0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7"/>}
    </div>
  );
}


function useClaimedMana(suffixId, inventoryId) {
  const [claimedMana, setClaimedMana] = useState();

  const GET_CLAIMED_MANA = gql`
  query GetClaimedMana($suffixId: Int!, $inventoryId: Int!) {
    manas(where: {suffixId: $suffixId, inventoryId: $inventoryId, currentOwner_not_in:
        ["0x1884d71487bfd7f595061221801e783efcd0bf6a",
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
         "0xb1dea25cb8b997913f86076b372aa75f06c53c99"]}) {
      id
      itemName
      currentOwner {
        id
      }
    }
  }
  `;
  return useQuery<ManaData, ManaVars>(
    GET_CLAIMED_MANA,
    { variables: { suffixId: suffixId, inventoryId: inventoryId } }
  );
}

function useUnclaimedMana(suffixId, inventoryId) {
  const inventoryName = (inventoryId >= 0) ? inventory[inventoryId].label.toLowerCase() : 'weapon';
  const inventoryNameSuffix = inventoryName + "SuffixId";

  const GET_UNCLAIMED_MANA = gql`
  query GetUnclaimedMana($suffixId: Int!) {
    bags(where: {manasClaimed: 0, ${inventoryNameSuffix}: $suffixId}) {
      id
      itemName: ${inventoryName}
      currentOwner {
        id
      }
    }
  }
  `;
  
  return useQuery<BagData, BagVars>(
    GET_UNCLAIMED_MANA,
    { variables: { suffixId: suffixId } }
  );
}

function useOpenseaManaData(tokenIds:string[]) {
  const GET_OPENSEA_MANA_DATA = gql`
  query GetOpenSeaManaData ($tokenIds: String) {
    queryManas(tokenIds: $tokenIds) @rest(type: "OpenSeaManaData", method:"GET", path: "/mana?tokenIds={args.tokenIds}" ) {
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
      tokenIds: (tokenIds ?? []).join(','),
      restful: true,
    }
  });
}

function useOpenseaBagsData(tokenIds:string[]) {
  const GET_OPENSEA_BAGS_DATA = gql`
  query GetOpenSeaBagsData ($tokenIds: String) {
    queryBags(tokenIds: $tokenIds) @rest(type: "OpenSeaBagsData", method:"GET", path: "/bags?tokenIds={args.tokenIds}" ) {
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
      tokenIds: (tokenIds ?? []).join(','),
      restful: true,
    }
  });
}

function shortenAddress(address: string) {
  return address.slice(0, 6) + '…' + address.slice(-4)
}

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);
  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (typeof a[sortConfig.key] === 'undefined' && typeof b[sortConfig.key] !== 'undefined') {
          return 1;
        }
        if (typeof a[sortConfig.key] !== 'undefined' && typeof b[sortConfig.key] === 'undefined') {
          return -1;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = key => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }
  return { items: sortedItems, requestSort, sortConfig };
}


function TokenList(props: TokenListProps): ReactElement {
  const data = props.data;
  const { items: sortedData, requestSort, sortConfig } = useSortableData(data, {key: 'price', direction: 'ascending'})
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
          <th className={styles.header_id}><a href="#" onClick={(e) => {e.preventDefault(); requestSort('id');}} className={styles?.[getClassNamesFor('id')]}>{props.name} Token ID</a></th>
          <th><a href="#" onClick={(e) => {e.preventDefault(); requestSort('name');}} className={styles?.[getClassNamesFor('name')]}>Item Name</a></th>
          <th className={styles.header_address}><a href="#" onClick={(e) => {e.preventDefault(); requestSort('address');}} className={styles?.[getClassNamesFor('address')]}>Address</a></th>
          <th><a href="#" onClick={(e) => {e.preventDefault(); requestSort('price');}} className={styles?.[getClassNamesFor('price')]}>Price</a></th>
        </tr>
      </thead>
      <tbody>
        {sortedData &&
          sortedData.map((item) => (
            <tr key={item.id}>
              <td className={styles.tokenId}><a href={"//opensea.io/assets/"+ props.address + "/" + item.id}  target="_blank" rel="noopener noreferrer">{item.id}</a></td>
              <td>{item.name}</td>
              <td><a href={"//opensea.io/" + item.address}  target="_blank" rel="noopener noreferrer">{shortenAddress(item.address)}</a></td>
              <td className={[styles.price,(item.price ? styles.eth : '')].join(" ")}>{(item.price && item.price > 0 ? item.price : "--")}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
