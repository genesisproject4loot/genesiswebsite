import { NextApiRequest, NextApiResponse } from 'next'
import pMap from 'p-map'
import { chunk, flatten, orderBy, range } from 'lodash'
import { utils as etherUtils, BigNumber } from 'ethers'
import type { OpenseaResponse, Asset } from '@utils/openseaTypes'

const apiKey = process.env.OPENSEA_API_KEY


const fetchManaPage = async (ids: string[]) => {
  let url = `https://api.opensea.io/api/v1/assets?collection=genesis-mana&`
  url += ids.map((id) => `token_ids=${id}`).join('&')
  // const res = await fetch(url, {
  //   headers: {
  //     'X-API-KEY': apiKey,
  //   },
  // })
  const res = await fetch(url)
  const json: OpenseaResponse = await res.json();
  return json.assets ?? [];
}

export interface ManaInfo {
  id: string
  price: Number
  url: string
}

export const fetchMana = async (manaIds: string[]) => {
 
  const chunked = chunk(manaIds, 20)
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
    manas: orderBy(mapped, ['price', 'id'], ['asc', 'asc']),
    lastUpdate: new Date().toISOString(),
  }
}

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { tokenIds } = _req.query;
    if (!tokenIds) { // restrict pulling all bags
      res.status(200).json({
        manas: [],
        lastUpdate: new Date().toISOString()
      });
      return ;
    }

    const data = await fetchMana((tokenIds as string).split(','))

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
