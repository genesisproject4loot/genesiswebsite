import type { ReactElement } from "react";
import Layout from "@components/Layout"; // Layout wrapper
import { useWalletContext } from "hooks/useWalletContext";
import { useManaContract, useManaFromWallet } from "hooks/useManaContract";
import styles from "@styles/pages/Manafinder.module.scss"; // Styles
import { useLootFromWallet } from "hooks/useLootContract";

export default function Wallet(props): ReactElement {
  const { account, isConnected, signer, provider } = useWalletContext();
  const {  mintMana } = useManaContract();
  const { manas, refresh: refreshManaFromWallet } = useManaFromWallet();
  const { loot } = useLootFromWallet();

  async function onMintMana(lootId: number, inventoryId: number) {
    try {
      const transaction = await mintMana(lootId, inventoryId + 1);
      const done = await transaction.wait();
      console.log(done);
      console.log("Done Minting");
      setTimeout(() => refreshManaFromWallet(), 1000);
    } catch (e) {
      console.log(e);
      alert(e?.data?.message ?? "Error minting");
    }
  }
  return (
    <Layout>
      <div className={styles.manafinder__app}>
        <h1>Mana</h1>
        {isConnected && (
          <div>
            {manas &&
              manas.map((mana) => (
                <div>
                  <label>{mana.name}</label>{" "}
                  <img src={mana.image} width="400" height="400" />
                </div>
              ))}
          </div>
        )}
        <h1>Bags</h1>
        {isConnected && (
          <div>
            {loot &&
              loot.map((bag) => (
                <div>
                  <label>{bag.name}</label>{" "}
                  <img src={bag.image} width="400" height="400" />
                  {bag &&
                    bag.manas.map((mana, idx) => (
                      <button onClick={() => onMintMana(bag.tokenId, idx)}>
                        {idx} - {mana}
                      </button>
                    ))}
                </div>
              ))}
          </div>
        )}
        {!isConnected && <div>Connect your wallet</div>}
      </div>
    </Layout>
  );
}