import Link from "next/link"; // Routing
import type { ReactElement } from "react";
import { useRouter } from "next/router"; // Routing
import styles from "@styles/components/Layout.module.scss"; // Styles
import { useWallet } from "hooks/useWallet";

export default function Header() {
    // Collect current path for active links
    const { pathname } = useRouter();
    const { connect, isConnected, disconnect } = useWallet();
  
    return (
      <div className={styles.header}>
        {/* Main logo */}
        <div className={styles.header__logo}>
          <Link href="/">
            <a><img src="/genesis-icon.png" height="35px"></img> Genesis Project (for Loot)</a>
          </Link>
        </div>
        <button onClick={connect}>connect</button>        
        <button onClick={disconnect}>disconnect</button>

      </div>
    );
  }