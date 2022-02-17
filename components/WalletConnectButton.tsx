import { useAtime } from "hooks/useAtimeContract";
import { useWalletContext } from "hooks/useWalletContext";
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

export default function WalletConnectButton() {
  const wallet = useWalletContext();
  return (
    <div className="flex items-center bg-gray-0  text-sm md:text-base">
      {wallet.isConnected && (
        <span className="flex gap-2 md:gap-4">
          <ATime />
          {wallet.displayName}{" "}
          <a className="cursor-pointer" onClick={wallet.disconnectWallet}>
            [ disconnect ]
          </a>
        </span>
      )}
      {!wallet.isConnected && (
        <div
          className="border border-white px-3 py-2 rounded-md cursor-pointer"
          onClick={wallet.connectWallet}
        >
          Connect Wallet
        </div>
      )}
    </div>
  );
}

function ATime() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { claimAllForOwner, balance } = useAtime();

  const menuRef = useRef(null);

  useOnClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div className="relative cursor-pointer">
      <button onClick={() => setMenuOpen(!menuOpen)}>
        {balance.toLocaleString()} $ATIME{" "}
      </button>
      {menuOpen && (
        <ul
          ref={menuRef}
          className="absolute bg-white rounded-md text-black w-40 z-50"
        >
          <li className="px-4 py-2" onClick={claimAllForOwner}>
            Claim All
          </li>
        </ul>
      )}
    </div>
  );
}
