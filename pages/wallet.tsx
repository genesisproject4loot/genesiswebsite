import type { ReactElement } from "react";
import Layout from "@components/Layout"; // Layout wrapper
import { useWalletContext } from "hooks/useWalletContext";
import { useUnclaimedManaByOwner } from "hooks/useMana";
import styles from "@styles/pages/Manafinder.module.scss"; // Styles

export default function Wallet(props): ReactElement {
  const { account, isConnected } = useWalletContext();
  const { data } = useUnclaimedManaByOwner(account);

  return (
    <Layout>
      <div className={styles.manafinder__app}>
        {isConnected && (
          <div>
            {data?.bags?.map((bag) => (
              <div key={bag.id}>Bag: {bag.id}</div>
            ))}
          </div>
        )}
        {!isConnected &&
            <div>Connect your wallet</div>
        }
      </div>
    </Layout>
  );
}
