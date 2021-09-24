// Imports
import Layout from "@components/Layout"; // Layout wrapper
import styles from "@styles/pages/Manafinder.module.scss"; // Styles
import Link from "next/link"
import { gql,useQuery } from '@apollo/client';
import { useRouter } from "next/router";
import Select from 'react-select'
import suffices from '@data/suffices.json'
import inventory from '@data/inventory.json'

// Types
import type { ReactElement } from "react";
import type {Mana, ManaVars, ManaData, Bag, BagData, BagVars, Wallet, TokenListProps} from '@utils/manaFinderTypes'

function shortenAddress(address: string) {
  return address.slice(0, 6) + '…' + address.slice(-4)
}

export default function Home(): ReactElement {
  const router = useRouter();
  const slug = router.query.slug;
  const [suffixId, inventoryId] = (
    (router.query.slug as string[]) || ["-1", "-1"]
  ).map((val) => (val ? parseInt(val) : 0));

  const inventoryName = (inventoryId >= 0) ? inventory[inventoryId].label.toLowerCase() : 'weapon';
  const inventoryNameSuffix = inventoryName + "SuffixId";

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

  const GET_UNCLAIMED_MANA = gql`
  query GetUnclaimedMana($suffixId: Int!) {
    bags(where: {manasClaimed: 0, ${inventoryNameSuffix}: $suffixId}) {
      id
      manasClaimed
      itemName: ${inventoryName}
      currentOwner {
        id
      }
    }
  }
  `;

  const onChangeSuffixId = (item: any) => {
    router.push(`/manafinder/${item.value || 0}/${inventoryId}`, undefined, { shallow: true });
  };

  const onChangeInventoryId = (item: any) => {
    router.push(`/manafinder/${suffixId}/${item.value || 0}`, undefined, { shallow: true });
  };

  const { loading:cLoading, data:cData, error: cError } = useQuery<ManaData, ManaVars>(
    GET_CLAIMED_MANA,
    { variables: { suffixId: suffixId, inventoryId: inventoryId } }
  );

  const { loading:ucLoading, data:ucData, error: ucError } = useQuery<BagData, BagVars>(
    GET_UNCLAIMED_MANA,
    { variables: { suffixId: suffixId } }
  );

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
              placeholder="Select an Order..."
              value={suffices.find(
                (item) => parseInt(item.value) == suffixId
              )}
              onChange={onChangeSuffixId}
              className={styles.suffixDropdown}
              options={suffices}
            />
            <Select
              placeholder="Select an Item..."
              value={inventory.find(
                (item) => parseInt(item.value) == inventoryId
              )}
              onChange={onChangeInventoryId}
              className={styles.inventoryDropdown}
              options={inventory}
            />
          </div>
          <h2>Claimed Mana</h2>
          {cLoading ? <p>Loading ...</p> : <TokenList name ="Mana" data={cData?.manas} address="0xf4b6040a4b1b30f1d1691699a8f3bf957b03e463"/>}
          <h2>Unclaimed Mana</h2>
          {ucLoading ? <p>Loading ...</p> : <TokenList name="Loot" data={ucData?.bags} address="0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7"/>}
        </div>
      </div>
    </Layout>
  );
}

function TokenList(props: TokenListProps): ReactElement {
  return (
    <table>
      <thead>
        <tr>
          <th className={styles.header_id}>{props.name} Token ID</th>
          <th>Item Name</th>
          <th className={styles.header_address}>Addresss</th>
        </tr>
      </thead>
      <tbody>
        {props.data &&
          props.data.map((item) => (
            <tr key={item.id}>
              <td><a href={"//opensea.io/assets/"+ props.address + "/" + item.id}  target="_blank" rel="noopener noreferrer">{item.id}</a></td>
              <td>{item.itemName}</td>
              <td><a href={"//opensea.io/" + item.currentOwner.id}  target="_blank" rel="noopener noreferrer">{shortenAddress(item.currentOwner.id)}</a></td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
