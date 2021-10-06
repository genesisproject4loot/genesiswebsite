// Imports
import type { ReactElement } from "react";
import { useState } from "react";
import Layout from "@components/Layout"; // Layout wrapper
import styles from "@styles/pages/Chapter1.module.scss"; // Styles
import { useManaBagsByOwner, useManaFromWallet } from "hooks/useMana";
import { useManaContract } from "hooks/useManaContract";
import { useLootById } from "hooks/useLoot";
import inventory from "data/inventory.json";
import { useRouter } from "next/router";
import { shortenAddress } from "@utils/formatters";
import { useWalletContext } from "hooks/useWalletContext";
import GenesisManaChart from "@components/charts/GenesisManaChart";
import { OpenseaLink } from "@components/common/OpenseaLink";

export default function Chapter1(): ReactElement {
  return (
    <Layout>
      <div>
        <div className={styles.chapter1__cta}>
          {/* CTA title */}
          <h1>Distill Genesis Mana</h1>
          <GenesisManaChart />
          <ManaBagsList />
        </div>
      </div>
    </Layout>
  );
}

function ManaBagsList(): ReactElement {
  const router = useRouter();
  const [address] = (router.query.slug as string[]) ?? [];
  const { account } = useWalletContext();
  const { data, refetch: refetchManaBags } = useManaBagsByOwner(
    address || account
  );
  // const { data, refetch: refetchManaBags } = useManaFromWallet();
  const inventoryNames = inventory.map((item) => item.label.toLowerCase());
  const { mintMana } = useManaContract();
  const [mintsInProgress, setMintsInProgress] = useState<any[]>([]);
  function isMintInProgress(id) {
    return mintsInProgress.includes(id);
  }

  function mintKey(bag) {
    return [bag.lootId, bag.inventoryId].join("-");
  }

  async function onMintMana(bag) {
    if (isMintInProgress(mintKey(bag))) {
      return;
    }
    setMintsInProgress([...mintsInProgress, mintKey(bag)]);
    try {
      const transaction = await mintMana(bag.lootId, bag.inventoryId + 1);
      const done = await transaction.wait();
      console.log(done);
      setTimeout(async () => {
        await refetchManaBags();
      }, 1000);
    } catch (e) {
      e = e?.error ?? e;
      alert(e?.data?.message ?? e?.message ?? "Error");
    } finally {
      setMintsInProgress(mintsInProgress.filter((id) => id !== mintKey(bag)));
    }
  }

  function accessoryItem(item) {
    if (item.ownedByOther) {
      return (
        <span>
          {item.hasMinted ? "Minted" : "UnMinted"}{" "}
          <OpenseaLink address={item.ownedByOther} tokenid={undefined} text={shortenAddress(item.ownedByOther)}/>
        </span>
      );
    }
    if (item.hasMinted) {
      return <span>Minted!</span>;
    }
    if (isMintInProgress(mintKey(item))) {
      return <span>Minting...</span>;
    }
    return <button onClick={() => onMintMana(item)}>Mint</button>;
  }

  function transformMana(name, bag) {
    const inventoryId = inventoryNames.findIndex((item) => item == name);
    const foundMana = bag.manas.find((mana) => inventoryId === mana?.inventoryId);
    const item = {
      id: foundMana?.id ?? '#',
      lootId: bag.id,
      name: bag[name],
      hasMinted: !!foundMana,
      ownedByOther: address,
      suffixId: bag[`${name}SuffixId`],
      inventoryId,
      accessoryItem: null
    };
    item.accessoryItem = accessoryItem(item);
    return item;
  }

  const bags = (data?.bags ?? []).map((bag) => {
    const data = useLootById(String(bag.id));
    const manas = inventoryNames
      .filter((name) => bag[`${name}SuffixId`] > 0)
      .map((name) => transformMana(name, bag));
    return { ...bag, data, manas };
  });

  if (!bags || bags.length === 0) {
    return null;
  }

  return (
    <div>
      {bags.map((bag, idx) => (
        <ManaBag key={idx} bag={bag} />
      ))}
    </div>
  );
}

function ManaBag({ bag }) {
  return (
    <div key={bag.id} className={styles.bag_list}>
      <img src={bag.data?.image} width={300} height={300} />
      <div className={styles.mana_list}>
        {bag.manas.map((item) => (
          <>
            <span>{item.id}</span>
            <span>{item.name}</span>
            <span>{item.accessoryItem}</span>
          </>
        ))}
      </div>
    </div>
  );
}
