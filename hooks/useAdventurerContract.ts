import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { useWalletContext } from "./useWalletContext";
import { useManaContract } from "./useManaContract";
import { useAtimeContract } from "./useAtimeContract";

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
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "lootTokenId",
            type: "uint256"
          },
          {
            internalType: "uint8",
            name: "inventoryId",
            type: "uint8"
          }
        ],
        internalType: "struct GenesisAdventurerV2.Item[]",
        name: "itemsToName",
        type: "tuple[]"
      }
    ],
    name: "nameLostMana",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "name_",
        type: "string"
      }
    ],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export enum AdventurerContractState {
  UNAPPROVED,
  APPROVED,
  APPROVING,
  RESURRECTING,
  NAMING
}

export enum AdventurerContractATimeState {
  UNAPPROVED,
  APPROVED,
  APPROVING
}

export function useAdventurerContract() {
  const wallet = useWalletContext();
  const { manaContract } = useManaContract();
  const { atimeContract } = useAtimeContract();
  const [contractState, setContractState] = useState(
    AdventurerContractState.UNAPPROVED
  );
  const [aTimeContractState, setATimeContractState] = useState(
    AdventurerContractATimeState.UNAPPROVED
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
    if (!manaContract || !wallet?.account) {
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
  }, [wallet, wallet.account, manaContract]);

  useEffect(() => {
    if (!atimeContract || !wallet?.account) {
      return;
    }
    atimeContract.allowance(wallet.account, GA_CONTRACT_ADDRESS).then((res) => {
      if (parseInt(ethers.utils.formatUnits(res)) < 100) {
        setATimeContractState(AdventurerContractATimeState.UNAPPROVED);
      } else {
        setATimeContractState(AdventurerContractATimeState.APPROVED);
      }
    });
  }, [wallet, wallet.account, manaContract]);

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
      const tx = await manaContract.setApprovalForAll(
        GA_CONTRACT_ADDRESS,
        true
      );
      await tx?.wait();
      setContractState(AdventurerContractState.APPROVED);
      return true;
    } catch (e) {
      setContractState(AdventurerContractState.UNAPPROVED);
      console.log(e);
      return false;
    }
  }

  async function approveATimeContract() {
    try {
      setATimeContractState(AdventurerContractATimeState.APPROVING);
      const tx = await atimeContract.approve(
        GA_CONTRACT_ADDRESS,
        ethers.utils.parseEther(String(Number.MAX_SAFE_INTEGER))
      );
      await tx?.wait();
      setATimeContractState(AdventurerContractATimeState.APPROVED);
      return true;
    } catch (e) {
      setATimeContractState(AdventurerContractATimeState.UNAPPROVED);
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

  async function nameLostMana(tokenId: number, itemsToName: any[]) {
    if (contractState !== AdventurerContractState.APPROVED) {
      return;
    }
    const previousState = contractState;
    setContractState(AdventurerContractState.NAMING);
    try {
      const result = await adventurerContract.nameLostMana(
        tokenId,
        itemsToName
      );
      await result.wait();
      setContractState(previousState);
      return true;
    } catch (e) {
      console.log(e);
      setContractState(previousState);
      return false;
    }
  }

  function escapeName(name) {
    let occurances = 0;
    let escapedName = "";
    for (let char of name.split("")) {
      if (char === '"') {
        char = occurances % 2 === 0 ? "“" : "”";
        occurances++;
      }
      escapedName += char;
    }
    return escapedName;
  }

  function isNameTooLong(name) {
    return new Blob([escapeName(name)]).size > 42;
  }

  async function nameAdventurer(tokenId: number, name: string) {
    if (
      name.length > 42 ||
      contractState !== AdventurerContractState.APPROVED
    ) {
      return;
    }
    const previousState = contractState;
    setContractState(AdventurerContractState.NAMING);
    try {
      const result = await adventurerContract.setName(
        tokenId,
        escapeName(name)
      );
      await result.wait();
      setContractState(previousState);
      return true;
    } catch (e) {
      console.log(e);
      setContractState(previousState);
      return false;
    }
  }

  return {
    adventurerContract,
    getPublicPrice,
    isAppoved: contractState === AdventurerContractState.APPROVED,
    isAppoving: contractState === AdventurerContractState.APPROVING,
    isResurrecting: contractState === AdventurerContractState.RESURRECTING,
    isUnAppoved: contractState === AdventurerContractState.UNAPPROVED,
    isNaming: contractState === AdventurerContractState.NAMING,
    isAtimeAppoved:
      aTimeContractState === AdventurerContractATimeState.APPROVED,
    isAtimeAppoving:
      aTimeContractState === AdventurerContractATimeState.APPROVING,
    isAtimeUnAppoved:
      aTimeContractState === AdventurerContractATimeState.UNAPPROVED,
    approveContract,
    approveATimeContract,
    resurrectGA,
    nameLostMana,
    nameAdventurer,
    isNameTooLong
  };
}
