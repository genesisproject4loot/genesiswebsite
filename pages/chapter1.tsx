// Imports
import { useState } from "react";
import Layout from "@components/Layout"; // Layout wrapper
import styles from "@styles/pages/Chapter1.module.scss"; // Styles
import { useManaByOwner } from "hooks/useMana";
import { useManaContract } from "hooks/useManaContract";
import { useLootById } from "hooks/useLoot";
import inventory from "data/inventory.json";

// Types
import type { ReactElement } from "react";
import { useWalletContext } from "hooks/useWalletContext";
import GenesisManaChart from "@components/charts/GenesisManaChart";

export default function Chapter1(): ReactElement {
  return (
    <Layout>
      <div>
        <div className={styles.chapter1__cta}>
          {/* CTA title */}
          <h1>Distill Genesis Mana</h1>
          <GenesisManaChart />
          <UnclaimedMana />
        </div>
      </div>
    </Layout>
  );
}

function UnclaimedMana() {
  const { account } = useWalletContext();
  const { data, refetch: refetchUnclaimedMana } = useManaByOwner(account);
  const inventoryNames = inventory.map((item) => item.label.toLowerCase());
  const { mintMana } = useManaContract();
  const [mintsInProgress, setMintsInProgress] = useState<any[]>([]);

  const isMintInProgress = (id) => mintsInProgress.includes(id);
  const mintKey = (bag) => [bag.lootId, bag.inventoryId].join("-");

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
        await refetchUnclaimedMana();
        setMintsInProgress(mintsInProgress.filter((id) => id !== mintKey(bag)));
      }, 1000);
    } catch (e) {
      e = e?.error ?? e;
      setMintsInProgress(mintsInProgress.filter((id) => id !== mintKey(bag)));
      alert(e?.data?.message ?? e?.message ?? "Error");
    }
  }

  const bags = (data?.bags ?? []).map((bag) => {
    const data = useLootById(String(bag.id));
    const manas = inventoryNames
      .filter((name) => bag[`${name}SuffixId`] > 0)
      .map((name) => {
        const inventoryId = inventoryNames.findIndex((item) => item == name);
        return {
          lootId: bag.id,
          name: bag[name],
          hasMinted: !!bag.manas.find(
            (mana) => inventoryId === mana?.inventoryId
          ),
          suffixId: bag[`${name}SuffixId`],
          inventoryId
        };
      });
    return { ...bag, data, manas };
  });

  if (!bags || bags.length === 0) {
    return null;
  }

  const accessoryItem = (item) => {
    if (item.hasMinted) {
      return <span>Minted!</span>;
    }
    if (isMintInProgress(mintKey(item))) {
      return <span>Minting...</span>;
    }
    return <button onClick={() => onMintMana(item)}>Mint</button>;
  };
  return (
    <div>
      {bags.map((bag) => {
        return (
          <div key={bag.id} className={styles.bag_list}>
            <img src={bag.data?.image} width={300} height={300} />
            <div className={styles.mana_list}>
              {bag.manas.map((item) => (
                <>
                  <span>{item.lootId}</span>
                  <span>{item.name}</span>
                  <span>{accessoryItem(item)}</span>
                </>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
