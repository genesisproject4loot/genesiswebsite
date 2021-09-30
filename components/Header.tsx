import Link from "next/link"; // Routing
import type { ReactElement } from "react";
import { useRouter } from "next/router"; // Routing
import styles from "@styles/components/Layout.module.scss"; // Styles
import { useWalletContext } from "hooks/useWalletContext";

export default function Header() {
  // Collect current path for active links
  const { pathname } = useRouter();
  const { connectWallet, isConnected, disconnectWallet, account } =
    useWalletContext();

  return (
    <div className={styles.header}>
      {/* Main logo */}
      <div className={styles.header__logo}>
        <Link href="/">
          <a>
            <img src="/genesis-icon.png" height="35px"></img> Genesis Project
            (for Loot)
          </a>
        </Link>
      </div>
      {isConnected && (
        <div>
          {account} <button onClick={disconnectWallet}>disconnect</button>
        </div>
      )}
      {!isConnected && <button onClick={connectWallet}>connect</button>}
    </div>
  );
}
