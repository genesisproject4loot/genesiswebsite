import { ethers } from "ethers";
import { useAtimeContract } from "hooks/useAtimeContract";
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
  const wallet = useWalletContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const { atimeContract } = useAtimeContract();
  const [atimeBalance, setAtimeBalance] = useState(0);
  atimeContract
    ?.balanceOf(wallet.account)
    .then((value) => {
      setAtimeBalance(
        parseFloat(parseFloat(ethers.utils.formatUnits(value)).toFixed(4))
      );
    })
    .catch((e) => {
      console.log(e);
    });
  const menuRef = useRef(null);

  useOnClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div className="relative cursor-pointer">
      <button onClick={() => setMenuOpen(!menuOpen)}>
        {atimeBalance} $ATIME{" "}
      </button>
      {/* {menuOpen && (
        <ul
          ref={menuRef}
          className="absolute bg-white rounded-md text-black w-40 z-50"
        >
          <li className="px-4 py-2">Claim All</li>
          <li className="px-4 py-2">Claim By Realm</li>
        </ul>
      )} */}
    </div>
  );
}
