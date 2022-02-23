import { ReactElement } from "react";
import Link from "next/link"; // Routing
import { GenesisLogo } from "./icons";

import WalletConnectButton from "./WalletConnectButton";
import TwitterIcon from "./icons/TwitterIcon";
import OpenSeaIcon from "./icons/OpenseaIcon";
import DiscordIcon from "./icons/DiscordIcon";
import { useRouter } from "next/router";

export default function Layout_V2({
  children
}: {
  children: ReactElement | ReactElement[];
}): ReactElement {
  return (
    <div className="h-full">
      <Header />
      <div className="mt-16 h-full">{children}</div>
    </div>
  );
}

function Header() {
  const { pathname } = useRouter();
  const isClaim = () => pathname === "/claim";
  const isLeaderboard = () => pathname === "/leaderboard";
  return (
    <div className="h-16 flex w-full justify-center items-center px-10 border-b border-white-15 bg-gray-0 text-white fixed top-0 z-50">
      {/* Main logo */}
      <div className="ont-bold text-xs md:text-lg mr-4">
        <Link href="https://genesisproject.xyz" passHref={true}>
          <span className="flex items-center gap-3 cursor-pointer whitespace-nowrap">
            <GenesisLogo />{" "}
            <span className="hidden md:block">Genesis Project (for Loot)</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 flex gap-4 text-xs md:text-lg whitespace-nowrap justify-end md:justify-center">
        <a
          href="https://genesisproject.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="cursor-pointer underline">STORY</span>
        </a>
        <Link href="/claim" passHref={true}>
          <span
            className={isClaim() ? "font-bold" : "cursor-pointer underline"}
          >
            CLAIM & MINT
          </span>
        </Link>
        <Link href="/leaderboard" passHref={true}>
          <span
            className={
              isLeaderboard() ? "font-bold" : "cursor-pointer underline"
            }
          >
            LEADERBOARD
          </span>
        </Link>
      </div>
      <div className="hidden md:visible md:flex md:gap-2">
        {/* <ExternalLinks /> */}
        <WalletConnectButton />
      </div>
    </div>
  );
}

function ExternalLinks() {
  return (
    <div className="flex opacity-80 justify-center items-center cursor-pointer">
      <a
        href="https://opensea.io/collection/genesis-mana"
        target="_blank"
        rel="noopener noreferrer"
      >
        <OpenSeaIcon />
      </a>
      <a
        href="https://twitter.com/GenesisLoot"
        target="_blank"
        rel="noopener noreferrer"
      >
        <TwitterIcon />
      </a>
      <a
        href="https://discord.gg/9GMQM3r3"
        target="_blank"
        rel="noopener noreferrer"
      >
        <DiscordIcon />
      </a>
    </div>
  );
}
