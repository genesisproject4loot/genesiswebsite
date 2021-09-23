// Imports
import Layout from "@components/Layout"; // Layout wrapper
import styles from "@styles/pages/Manafinder.module.scss"; // Styles
import Link from "next/link"
import { gql,useQuery } from '@apollo/client';
import { useRouter } from "next/router";
import Select from 'react-select'

// Types
import type { ReactElement } from "react";
import type {Mana, ManaVars, ManaData, Bag, BagData, BagVars, Wallet, TokenListProps} from '../../utils/manaFinderTypes'
import type { OpenseaResponse, Asset } from '../../../utils/openseaTypes'
const apiKey = process.env.OPENSEA_API_KEY

const suffices = [
  { value: '1', label: 'Power' },
  { value: '2', label: 'Giants' },
  { value: '3', label: 'Titans' },
  { value: '4', label: 'Skill' },
  { value: '5', label: 'Perfection' },
  { value: '6', label: 'Brilliance' },
  { value: '7', label: 'Enlightenment' },
  { value: '8', label: 'Protection' },
  { value: '9', label: 'Anger' },
  { value: '10', label: 'Rage' },
  { value: '11', label: 'Fury' },
  { value: '12', label: 'Vitriol' },
  { value: '13', label: 'the Fox' },
  { value: '14', label: 'Detection' },
  { value: '15', label: 'Reflection' },
  { value: '16', label: 'the Twins' }
]

const inventory = [
  { value: '0', label: 'Weapon' },
  { value: '1', label: 'Chest' },
  { value: '2', label: 'Head' },
  { value: '3', label: 'Waist' },
  { value: '4', label: 'Foot' },
  { value: '5', label: 'Hand' },
  { value: '6', label: 'Neck' },
  { value: '7', label: 'Ring' }
]

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
        ["0x1884d71487bFD7f595061221801e783EFcD0BF6A",
         "0x9BbDA2777C8623D8894b21120bEd1fFf72B024f8",
         "0xb6b3EB3Ec30bD8979DF60D7F47b173a389310dd9",
         "0xc3e33B881AeA922BCE6df56bC2C6f0686A3A421A",
         "0xdcab536Df6Dd9Ad5D332180edF1ba1ec71669Ae2",
         "0x4cF7E239F5BC882e007D9790A7B49B4abDFeB510",
         "0x338AEf050Ac689246490AA75B691AC03FE0a81C8",
         "0xeA0a3aae1DdA17D0a17A488196801F59cA96854C",
         "0x1f5FE23574D5aEc1660A8c6B209135DA5723042f",
         "0xd431a116A7d0eca9371614D5652CDfFfb7c5B6Eb",
         "0x0780529F0EcfAc1048d2fAAe5007Fe62Ce318c79",
         "0xf935C944A8E03181ae3229774D4B93D7BBa816D4",
         "0xAba619A78032abCfE0346c1592835Df563BA3BFa",
         "0xe1E5072FC1fF1A419D17bF9B5C5b6Ddd12c19F08",
         "0x17498d27433849a510165Cc1Fc618582AC54229B",
         "0xb1deA25cB8B997913f86076B372AA75F06C53c99"]}) {
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
    router.push(`/manafinder/${item.value || 0}/${inventoryId}`);
  };

  const onChangeInventoryId = (item: any) => {
    router.push(`/manafinder/${suffixId}/${item.value || 0}`);
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
