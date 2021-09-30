import type { ReactElement } from "react";
import Layout from "@components/Layout"; // Layout wrapper
import { useWalletContext } from "hooks/useWalletContext";
import { useUnclaimedManaByOwner } from "hooks/useMana";
import { usManaContract } from "hooks/useManaContract";
import styles from "@styles/pages/Manafinder.module.scss"; // Styles
import { Bag } from "@utils/manaFinderTypes";
import inventory from "@data/inventory.json";
import suffices from "@data/suffices.json";
import { range } from "lodash";
import { ethers } from "ethers";

export default function Wallet(props): ReactElement {
  const { account, isConnected, signer, provider } = useWalletContext();
  const { manaContract } = usManaContract(signer);
  const { data } = useUnclaimedManaByOwner(account);

  async function onMintMana(bag: Bag, inventoryId: number) {

    const gas = await manaContract.estimateGas.claimByLootId(
      ethers.BigNumber.from(bag.id),
      ethers.BigNumber.from(inventoryId + 1)
    );
    console.log("Estimated gas: ", gas.toString());

    // Commenting out mint for now
    // const transaction = await manaContract.claimByLootId(
    //   ethers.BigNumber.from(bag.id),
    //   ethers.BigNumber.from(inventoryId + 1)
    // );
    // await transaction.wait();
  }
  return (
    <Layout>
      <div className={styles.manafinder__app}>
        {isConnected && (
          <div>
            {data?.bags?.map((bag) => (
              <div key={bag.id}>
                Bag: {bag.id} <Manas bag={bag} onMintMana={onMintMana} />
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
  onMintMana: (bag: Bag, inventoryId: number) => void;
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
        lootId: bag.id,
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
        <li key={`${mana.inventoryLabel}-${mana.suffixId}`}>
          {mana.inventoryLabel}: {mana.itemName}{" "}
          {mana.isClaimed && " [claimed]"}
          {!mana.isClaimed && (
            <button
              onClick={() => {
                props.onMintMana(bag, mana.iventoryId);
              }}
            >
              Mint
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
