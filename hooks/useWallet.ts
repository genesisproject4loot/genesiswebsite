import { useState } from 'react';
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
// import { shortenAddress } from "@utils";

const WEB3_MODAL_CONFIG = {
    network: "mainnet", 
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider, 
        options: {
          pollingInterval: 20000000,
          rpc: {
            1: "https://eth-mainnet.alchemyapi.io/v2/f-5JpA4L7_gst60QBQ-sbczctebU6JzY",
          }
        }
      }
    }
  };

export function useWallet() {
    const [modal, setModal] = useState<Web3Modal>();
    const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
    const [provider, setProvider] = useState<ethers.providers.Provider>();
    const [isConnected, setIsConnected] = useState(false);

    async function connect() {
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
            let address = await signer.getAddress();
            console.log(address)

            // console.log(rawProvider.isMetaMask, 'is meta mask')
            rawProvider.on("accountsChanged", async accounts => {
                console.log(accounts);
                console.log('accounts')
            });
        
            rawProvider.on("chainChanged", async chainId => {
            console.log(chainId, '<----chainId')
            });
        } catch(e) {
            console.log(e);
        }
    }

    function disconnect() {
        modal.clearCachedProvider();
        setModal(null);
        setSigner(null);
        setProvider(null);
        setIsConnected(false);
    }

    return {
        connect,
        disconnect,
        isConnected
    }
}