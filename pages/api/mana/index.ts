import { NextApiRequest, NextApiResponse } from 'next'
import pMap from 'p-map'
import { chunk, flatten, orderBy } from 'lodash'
import { utils as etherUtils, BigNumber } from 'ethers'
import { Contract, Event, providers } from 'ethers'
import type { OpenseaResponse, Asset } from '@utils/openseaTypes'
import abi from '@data/genesismana-abi.json'

const apiKey = process.env.OPENSEA_API_KEY
const rpc = new providers.JsonRpcProvider(process.env.PROVIDER_URL)
const contract = new Contract(process.env.CONTRACT_ADDRESS as string, abi, rpc)


const fetchManaPage = async (ids: string[]) => {
  let url = 'https://api.opensea.io/api/v1/assets?collection=genesis-mana&'
  url += ids.map((id) => `token_ids=${id}`).join('&')
  // const res = await fetch(url, {
  //   headers: {
  //     'X-API-KEY': apiKey,
  //   },
  // })
  const res = await fetch(url)

  const json: OpenseaResponse = await res.json()

  return Promise.all(
    json.assets.map(async (asset) => {
      return {
        ...asset
      }
    }),
  )
}

export interface ManaInfo {
  id: string
  price: Number
  url: string
}

export const fetchMana = async () => {
  const manaSupply = await contract.totalSupply();
  const maxTokenID = manaSupply.toNumber();
  let ManaIDs = new Array();
  for(let i=0; i < maxTokenID; i++) {
    ManaIDs.push(i+1);
  }
  const chunked = chunk(ManaIDs, 20)
  const data = await pMap(chunked, fetchManaPage, { concurrency: 2 })

  const mapped = flatten(data)
    .filter(
      (a: Asset) =>
        a?.sell_orders?.[0]?.payment_token_contract.symbol === 'ETH',
    )
    .map((a: Asset): ManaInfo => {
      return {
        id: a.token_id,
        price: Number(
          etherUtils.formatUnits(
            BigNumber.from(a.sell_orders[0]?.current_price.split('.')[0])
          ),
        ),
        url: a.permalink
      }
    })

  return {
    mana: orderBy(mapped, ['price', 'id'], ['asc', 'asc']),
    lastUpdate: new Date().toISOString(),
  }
}

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await fetchMana()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
