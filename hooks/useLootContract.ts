
import { useState, useMemo } from 'react';
import { ethers } from "ethers";
import lootABI from 'abi/Loot.json';
import { GenesisMana, GenesisMana__factory, Loot__factory } from 'typechain';

export function useLootContract(signer: ethers.Signer | ethers.providers.Provider) {
    const [lootContract, setLootContract] = useState<GenesisMana>();
    useMemo(() => {
        
        const contract = Loot__factory.connect('', signer);
        // contract.getWaist
        // const contract = GenesisMana__factory.connect('', signer);
        // contract.claimByLootId(ethers.BigNumber.from('30'), ethers.BigNumber.from('30'));
        // const contract = new ethers.Contract(
        //     'https://eth-mainnet.alchemyapi.io/v2/f-5JpA4L7_gst60QBQ-sbczctebU6JzY',
        //     lootABI,
        //     signer
        // );
        // setLootContract(contract);

        // contract.
    },[signer]);

    return {
        lootContract
    };
}