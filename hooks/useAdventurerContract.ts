import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { useWalletContext } from "./useWalletContext";
import { useManaContract } from "./useManaContract";
import { Mana } from "@utils/manaFinderTypes";
import { INVENTORY } from "utils/constants";
export const GA_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GA_CONTRACT_ADDRESS ??
  "0x8db687aceb92c66f013e1d614137238cc698fedb";

const gaABI = [
  {
    inputs: [],
    name: "publicPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "weaponTokenId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "chestTokenId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "headTokenId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "waistTokenId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "footTokenId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "handTokenId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "neckTokenId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "ringTokenId",
        type: "uint256"
      }
    ],
    name: "resurrectGA",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
];

export enum AdventurerContractState {
  UNAPPROVED,
  APPROVED,
  APPROVING,
  RESURRECTING
}

export function useAdventurerContract() {
  const wallet = useWalletContext();
  const { manaContract } = useManaContract();
  const [contractState, setContractState] = useState(
    AdventurerContractState.UNAPPROVED
  );

  const [adventurerContract, setAdventurerContract] =
    useState<ethers.Contract>();
  useEffect(() => {
    const contract = new ethers.Contract(
      GA_CONTRACT_ADDRESS,
      gaABI,
      wallet?.signer
    );
    setAdventurerContract(contract);
  }, [wallet?.signer]);

  useEffect(() => {
    if (!manaContract) {
      return;
    }
    manaContract
      .isApprovedForAll(wallet.account, GA_CONTRACT_ADDRESS)
      .then((res) => {
        setContractState(
          res
            ? AdventurerContractState.APPROVED
            : AdventurerContractState.UNAPPROVED
        );
      });
  }, [manaContract]);

  async function getPublicPrice() {
    if (!adventurerContract) {
      return 0;
    }
    const price = await adventurerContract.publicPrice();
    return parseFloat(parseFloat(ethers.utils.formatUnits(price)).toFixed(4));
  }

  async function approveContract() {
    try {
      setContractState(AdventurerContractState.APPROVING);
      await manaContract.setApprovalForAll(GA_CONTRACT_ADDRESS, true);
      setContractState(AdventurerContractState.APPROVED);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async function resurrectGA(selectedManas: Mana[]) {
    let manas = INVENTORY.map((item) =>
      selectedManas.find((mana) => mana.inventoryId === parseInt(item.value))
    ).map((mana) => mana.id);
    if (manas.length !== 8) {
      alert("Invalid mint");
    }
    const previousState = contractState;
    setContractState(AdventurerContractState.RESURRECTING);
    const price = await getPublicPrice();
    try {
      const result = await adventurerContract.resurrectGA(
        manas[0],
        manas[1],
        manas[2],
        manas[3],
        manas[4],
        manas[5],
        manas[6],
        manas[7],
        { value: ethers.utils.parseEther(String(price)) }
      );
      const txn = await result.wait();
      const tokenId = txn?.events[0]?.topics[3];
      setContractState(previousState);
      return tokenId;
    } catch (e) {
      console.log(e);
      setContractState(previousState);
    }
  }

  return {
    adventurerContract,
    getPublicPrice,
    isAppoved: contractState === AdventurerContractState.APPROVED,
    isAppoving: contractState === AdventurerContractState.APPROVING,
    isResurrecting: contractState === AdventurerContractState.RESURRECTING,
    isUnAppoved: contractState === AdventurerContractState.UNAPPROVED,
    approveContract,
    resurrectGA
  };
}
