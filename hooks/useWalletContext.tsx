import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

const WEB3_MODAL_CONFIG = {
  network: "mainnet",
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        pollingInterval: 20000000,
        rpc: {
          1: "https://eth-mainnet.alchemyapi.io/v2/f-5JpA4L7_gst60QBQ-sbczctebU6JzY"
        }
      }
    }
  }
};

const defaultWalletContext = {
  isConnected: false,
  signer: null,
  provider: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
  account: "",
  displayName: ""
};

const WalletContext = createContext<{
  isConnected: boolean;
  signer: ethers.providers.JsonRpcSigner | null;
  provider: ethers.providers.Provider | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  account: String;
  displayName: String;
}>(defaultWalletContext);

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider = (props: WalletProviderProps) => {
  const wallet = useWallet();
  return (
    <WalletContext.Provider value={wallet}>
      {props.children}
    </WalletContext.Provider>
  );
};

function shortenAddress(address) {
  return address.slice(0, 3) + "..." + address.slice(-3);
}

function useWallet() {
  const [modal, setModal] = useState<Web3Modal>();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
  const [provider, setProvider] = useState<ethers.providers.Provider>();
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [displayName, setDisplayName] = useState("");

  async function connectWallet() {
    const web3Modal = new Web3Modal(WEB3_MODAL_CONFIG);
    setModal(web3Modal);
    login(web3Modal);
  }

  async function login(newModal: Web3Modal) {
    try {
      newModal.clearCachedProvider();
      await newModal.connect();
      const rawProvider = await newModal.connect();
      const provider = new ethers.providers.Web3Provider(rawProvider);
      const signer = provider.getSigner();
      setSigner(signer);
      setProvider(provider);
      setIsConnected(true);
      const address = await signer.getAddress();
      if (address) {
        setAccount(address);
        const ensName = await provider.lookupAddress(address);
        setDisplayName(ensName || shortenAddress(address));
      }

      if (rawProvider) {
        rawProvider.on("accountsChanged", async (accounts) => {
          if (accounts?.length > 0) {
            setAccount(accounts[0]);
          }
        });

        rawProvider.on("chainChanged", async (chainId) => {
          console.log(chainId, "<----chainId");
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  function disconnectWallet() {
    modal.clearCachedProvider();
    setModal(null);
    setSigner(null);
    setProvider(null);
    setAccount("");
    setIsConnected(false);
    setDisplayName("");
  }

  return {
    connectWallet,
    signer,
    provider,
    disconnectWallet,
    isConnected,
    account,
    displayName
  };
}

export function useWalletContext() {
  return useContext(WalletContext);
}
