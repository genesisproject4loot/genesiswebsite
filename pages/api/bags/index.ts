import { NextApiRequest, NextApiResponse } from 'next'
import pMap from 'p-map'
import { chunk, flatten, orderBy } from 'lodash'
import { utils as etherUtils, BigNumber } from 'ethers'
import type { OpenseaResponse, Asset } from '@utils/openseaTypes'

const apiKey = process.env.OPENSEA_API_KEY

const fetchBagPage = async (ids: string[]) => {
  let url = 'https://api.opensea.io/api/v1/assets?collection=lootproject&'
  url += ids.map((id) => `token_ids=${id}`).join('&')
  // const res = await fetch(url, {
  //   headers: {
  //     'X-API-KEY': apiKey,
  //   },
  // })

  console.log(url);
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

export interface BagInfo {
  id: string
  price: Number
  url: string
}

export const fetchBags = async () => {
  let BagIDs = new Array();
  for(let i=0; i < 8000; i++) {
    BagIDs.push(i+1);
  }
  const chunked = chunk(BagIDs, 30)
  const data = await pMap(chunked, fetchBagPage, { concurrency: 5 })

  const mapped = flatten(data)
    .filter(
      (a: Asset) =>
        a?.sell_orders?.[0]?.payment_token_contract.symbol === 'ETH',
    )
    .map((a: Asset): BagInfo => {
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
    bags: orderBy(mapped, ['price', 'id'], ['asc', 'asc']),
    lastUpdate: new Date().toISOString(),
  }
}

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await fetchBags()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
