import { ReactElement } from "react";
import Link from "next/link"; // Routing
import { GenesisLogo } from "./icons";

import WalletConnectButton from "./WalletConnectButton";

export default function Layout_V2({
  children
}: {
  children: ReactElement | ReactElement[];
}): ReactElement {
  return (
    <div>
      <Header />
      <div className="mt-16">{children}</div>
    </div>
  );
}

function Header() {
  return (
    <div className="h-16 flex w-full justify-center items-center px-10 border-b border-white-15 bg-gray-0 text-white fixed top-0 z-50">
      {/* Main logo */}
      <div className="flex-1 font-bold text-lg">
        <Link href="/">
          <span className="flex items-center gap-3">
            <GenesisLogo /> <span>Genesis Project (for Loot)</span>
          </span>
        </Link>
      </div>
      <WalletConnectButton />
    </div>
  );
}
