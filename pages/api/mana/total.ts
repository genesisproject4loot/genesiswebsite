import { NextApiRequest, NextApiResponse } from 'next'
import { utils as etherUtils, BigNumber } from 'ethers'
import { Contract, Event, providers } from 'ethers'
import abi from '@data/genesismana-abi.json'

const rpc = new providers.JsonRpcProvider(process.env.PROVIDER_URL)
const contract = new Contract(process.env.CONTRACT_ADDRESS as string, abi, rpc)

export interface ManaInfo {
  id: string
  price: Number
  url: string
}

export const fetchManaSupply = async () => {

    const manaSupply = await contract.totalSupply();
    const maxTokenID = manaSupply.toNumber();
  
  return {
    manaSupply: maxTokenID,
    lastUpdate: new Date().toISOString(),
  }
}

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await fetchManaSupply()

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
