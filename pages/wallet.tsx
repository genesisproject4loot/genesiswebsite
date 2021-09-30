import type { ReactElement } from "react";
import Layout from "@components/Layout"; // Layout wrapper
import { useWalletContext } from "hooks/useWalletContext";
import { useUnclaimedManaByOwner } from "hooks/useMana";
import styles from "@styles/pages/Manafinder.module.scss"; // Styles
import { Bag } from "@utils/manaFinderTypes";
import inventory from "@data/inventory.json";
import suffices from "@data/suffices.json";
import { range } from "lodash";

export default function Wallet(props): ReactElement {
  const { account, isConnected } = useWalletContext();
  const { data } = useUnclaimedManaByOwner(account);

  return (
    <Layout>
      <div className={styles.manafinder__app}>
        {isConnected && (
          <div>
            {data?.bags?.map((bag) => (
              <div key={bag.id}>
                Bag: {bag.id} <Manas bag={bag} />
              </div>
            ))}
          </div>
        )}
        {!isConnected && <div>Connect your wallet</div>}
      </div>
    </Layout>
  );
}

type ManasProps = {
  bag: Bag;
};

function Manas(props: ManasProps) {
  const bag = props.bag;
  const claimedManas = bag?.manas ?? [];
  const iventoryIds = range(0, inventory.length - 1);
  const manas = iventoryIds
    .filter(
      (iventoryId) =>
        bag[`${inventory[iventoryId].label.toLowerCase()}SuffixId`] > 0
    )
    .map((iventoryId) => {
      const attr = inventory[iventoryId].label.toLowerCase();
      const suffixId = bag[`${attr}SuffixId`];
      return {
        iventoryId,
        inventoryLabel: inventory[iventoryId].label,
        suffixId,
        itemName: bag[attr],
        isClaimed: !!claimedManas.find(
          (mana) =>
            mana.inventoryId === iventoryId &&
            mana.suffixId.id == String(suffixId)
        )
      };
    });

  return (
    <ul>
      {manas.map((mana) => (
        <li>
          {mana.inventoryLabel}: {mana.itemName}[{mana.isClaimed ? "claimed" : "unclaimed"}]
        </li>
      ))}
    </ul>
  );
}
