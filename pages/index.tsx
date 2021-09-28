// Imports
import Layout from "@components/Layout"; // Layout wrapper
import styles from "@styles/pages/Home.module.scss"; // Styles
import Link from "next/link"
import { gql,useQuery } from '@apollo/client';
import Numeral from "numeral"
// Types
import type { ReactElement } from "react";
import type {ManaByOrdersData} from '@utils/manaFinderTypes'

export default function Home(): ReactElement {

  // Quicklinks to render
  const quicklinks: Record<string, string>[] = [
    {
      name: "Twitter",
      url: "https://twitter.com/GenesisLoot",
    },
    {
      name: "Medium",
      url: "https://medium.com/@timshelxyz?p=dddb50ab18b7"
    },
    {
      name: "Discord",
      url: "https://discord.gg/YUYyPSuwfU"
    },
  ];

  return (
    <Layout>
      <div>
        <div className={styles.home__cta}>
          {/* CTA title */}
          <h1>Genesis Project</h1>
          {/* Quicklinks */}
          <ul>
            {quicklinks.map(({ name, url }, i) => {
              return (
                <li key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {name}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* CTA Description */}
          <p>
            The Genesis Project is a community of builders, designers, mathematicians and storytellers on a mission to discover the origin story of <a href="https://www.lootproject.com/" target="_blank" rel="noopener noreferrer">the Loot universe</a>.
            <br /><br />
            Join us on our quest to restore the original Orders of Loot and resurrect the Genesis Adventurers.
          </p>
          <div>
            <ul className={styles.btns}>
              <li>
                <div className={styles.btn}><a href="#chapter1"><p className={styles.label}>Chapter 1</p><p>Genesis Mana</p></a></div>
                <div className={[styles.moreinfo].join(' ')}>
                  <a href="https://opensea.io/collection/genesis-mana" target="_blank" rel="noopener noreferrer">
                    OpenSea
                  </a>
                  <a href="https://etherscan.io/address/0xf4b6040a4b1b30f1d1691699a8f3bf957b03e463#writeContract" target="_blank" rel="noopener noreferrer">
                    Etherscan
                  </a>
                  <a href="https://twitter.com/genesisloot/status/1436084847827570689?s=21" target="_blank" rel="noopener noreferrer">
                    Instructions
                  </a>
                </div>
              </li>
              <li>
                <div className={styles.btn}><a href="#chapter2"><p className={styles.label}>Chapter 2</p><p>Genesis Adventurer</p></a></div>
                <div className={[styles.moreinfo].join(' ')}>
                  <a href="https://opensea.io/collection/genesisadventurer" target="_blank" rel="noopener noreferrer">
                    OpenSea
                  </a>
                  <a href="https://etherscan.io/token/0x8db687aceb92c66f013e1d614137238cc698fedb#writeProxyContract" target="_blank" rel="noopener noreferrer">
                    Etherscan
                  </a>
                  <a href="https://genesisproject.notion.site/Genesis-Adventurer-cc41f0c184ab481aafb0e1056a48727e" target="_blank" rel="noopener noreferrer">
                    Instructions
                  </a>
                </div>
              </li>
              <li>
                <div className={styles.btn}><a href="#chapter3"><p className={styles.label}>Chapter 3</p><p>$ATIME</p></a></div>
                <div className={[styles.moreinfo, styles.inactive].join(' ')}>
                  <a href="#" onClick={(e) => {e.preventDefault() }}  target="_blank" rel="noopener noreferrer">
                    OpenSea
                  </a>
                  <a href="#" onClick={(e) => {e.preventDefault() }} target="_blank" rel="noopener noreferrer">
                    Etherscan
                  </a>
                  <a href="#" onClick={(e) => {e.preventDefault() }} target="_blank" rel="noopener noreferrer">
                    Instructions
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.home__chapters}>
          <hr/>
          <h2>In the Beginning</h2>
          <blockquote>
          <p>
          <i>With pieces, a puzzle
          <br/>
          Through randomness, intent
          <br/>
          From entropy, Order</i>
          </p>
          <span className={styles.author}><i><a href="//twitter.com/timshelxyz">@timshelxyz</a> - The Historian</i></span>
          </blockquote>
          <p>
          At hyperspeed since nearly the moment the Loot Project emerged, a community of builders has come together to develop a series of incredible projects and derivatives that move the ecosystem forward.
          <br/><br/>
          But what lays <i>behind</i>?  What came <i>before</i>?  What was this world like in the beginning, before the bags were shuffled?
          <br/><br/>
          Through a statistical analysis of the data, our team at The Genesis Project has unearthed a breakthrough discovery — the &ldquo;genesis state&rdquo; of the Loot universe.
          <br/><br/>
          Based on the item data and fundamental logic of the smart contract, the evidence has led us to a hair-raising epiphany hidden in the data and the smart contract:
          <br/><br/>
          <i>In the beginning, before the bags were shuffled, these Loot bags were carried by 2,540 original Adventurers — &ldquo;Genesis Adventures&rdquo; — <a href="https://docs.google.com/spreadsheets/d/118x6e4WEVZ7q-XvsRoyDNq7Nufw3xSmMKeYxPpivwRA/edit?usp=sharing" target="_blank" rel="noreferrer">organized across 16 Orders.</a></i>
          <a href="https://docs.google.com/spreadsheets/d/118x6e4WEVZ7q-XvsRoyDNq7Nufw3xSmMKeYxPpivwRA/edit?usp=sharing" rel="noreferrer" target="_blank"><img src="img/16-orders.png" width="75%"/></a>
          <br/><br/>
          Read <a href="https://medium.com/@timshelxyz?p=dddb50ab18b7" target="_blank" rel="noreferrer">here</a> for a detailed history of our data exploration, statistical modeling, and linguistic analysis.
          </p>
        </div>
        <div className={styles.home__chapters}>
          <hr id="chapter1"/>
          <h2>Chapter 1 : Genesis Mana</h2>
          <Chapter1ProgressBars type="spread"/>
          <blockquote>
          <p>
          You walk to the edge, and take the Holy Chestplate of Brilliance from your Loot bag.
          You hold it up to the light, and it shimmers with energy and vibration.  You feel the pull of your ancestral Order calling through the mist.
          Time and space stands still.
          <br/><i>A flash!</i>
          <br/><i>Then silence.</i>
          <br/>
          You carefully look into your Wallet and notice something new: Genesis Mana.
          <br/><br/>
          You now have a new piece of Genesis Mana in your bag for the Order of Brilliance.
          Where did this come from?  Who wore this?
          It strikes you — this ancient energy came from one of the original Adventurers — <b>a Genesis Adventurer.</b>
          <br/><br/>
          What else were they wearing when they arrived in this realm? What else did they carry?
          In the times ahead, the Order of Brilliance will need a champion, a hero. You carry the energy from her Chestplate in your bag and can feel her calling to you through the ages.
          <br/><br/>
          <i>Find me the rest of my loot.  I am here.  Bring me back.</i>
          <br/><br/>
          Can you resurrect a Genesis Adventurer of Brilliance before it’s too late?
          </p>
          <span className={styles.author}><i>The Discovery Awaits</i></span>
          </blockquote>
          <p>
          For Loot Bag holders, distill Genesis Mana (mint an ERC721 NFT) from any item in your bag that has an Order (item with suffix &ldquo;of ____&rdquo;).
          <br/><br/>
          Genesis Mana is essentially a Mint Pass for a Genesis Adventurer.
          Upon collecting 8 Genesis Mana from a single Order, corresponding to all 8 item types (i.e. weapon, head armor, chest armor, etc), a Genesis Adventurer can be resurrected.
          </p>
          <br/>
          <Chapter1ProgressBars type="progress"/>
          <div className={[styles.cta].join(' ')}>
            <div className={[styles.btn, styles.cta].join(' ')}><Link href="https://etherscan.io/address/0xf4b6040a4b1b30f1d1691699a8f3bf957b03e463#writeContract">Distill Genesis Mana</Link></div>
            <div className={[styles.moreinfo].join(' ')}>
              <Link href="https://twitter.com/genesisloot/status/1436084847827570689?s=21">Instructions</Link>
              <Link href="https://opensea.io/collection/genesis-mana">Buy Genesis Mana</Link>
            </div>
          </div>
        </div>
        <div className={styles.home__feature}>
          <span>Example Genesis Mana:</span>
          <img src="img/genesismana/1.svg" />
          <img src="img/genesismana/2.svg" />
          <img src="img/genesismana/3.svg" />
        </div>

        <div className={styles.home__chapters}>
          <hr id="chapter2"/>
          <h2>Chapter 2 : The Genesis Adventurers</h2>
          <blockquote>
            <p>
            You’ve collected a complete set of Genesis Loot, one for each item type, all of the same Order.
            <br/><br/>
            You carry this precious Genesis Loot on your back, and climb to the top of the mountain to attempt to resurrect a Genesis Adventurer.
            <br/><br/>
            You throw the bag in the fire.
            <br/><br/>
            A Genesis Adventurer of Brilliance emerges from the flames, ready to rejoin their ancestral Order.
            </p>
            <span className={styles.author}><i>The Resurrection Begins</i></span>
          </blockquote>
          <p>
          For Genesis Mana holders, resurrect a Genesis Adventurers (mint an ERC721 NFT) from a complete set of 8 items from any of the 16 Orders.
          This means one Weapon, one Head Armor, one Chest Armor, etc all from the same Order (item with suffix &ldquo;of ____&rdquo;).
          <br/><br/>
          There is no wrong way to complete your collection but here are some suggestions:
          <ul>
            <li>Buy GMs on OpenSea and resurrect a GA yourself.</li>
            <li>Trade GMs with others to resurrect a GA yourself.</li>
            <li>Team up with others to pool your GMs and collectively resurrect one or many GAs and share them fractionally.</li>
          </ul>
          The more Genesis Adventurers you resurrect, the stronger you and/or your team will be in the games ahead. Furthermore, for every Genesis Adventurer you resurrect, you have the right to claim a bag of Adventure Mana ($AMANA).
          </p>
          <br/><br/>
          <div className={[styles.cta].join(' ')}>
            <div className={[styles.btn, styles.cta].join(' ')}><Link href="https://etherscan.io/token/0x8db687aceb92c66f013e1d614137238cc698fedb#writeProxyContract">Resurrect a Genesis Adventurer</Link></div>
            <div className={[styles.moreinfo].join(' ')}>
              <Link href="https://genesisproject.notion.site/Genesis-Adventurer-cc41f0c184ab481aafb0e1056a48727e">Instructions</Link>
              <Link href="https://opensea.io/collection/genesisadventurer">View Genesis Adventurers</Link>
            </div>
          </div>
        </div>
        <div className={styles.home__feature}>
          <span>Example Genesis Adventurer:</span>
          <img src="img/genesisadventurer/1.svg" />
          <img src="img/genesisadventurer/2.svg" />
          <img src="img/genesisadventurer/3.svg" />
        </div>

        <div className={styles.home__chapters}>
          <hr id="chapter3"/>
          <h2>Chapter 3 : $ATIME</h2>
          <blockquote>
            <p>
            As the flames die down, you notice something in the ash.
            <br/><br/>
            Your bag of Genesis Mana is intact, but transformed.
            <br/><br/>
            You remove it from the ash and discover a bag of $ATIME.
            <br/><br/>
            It tingles with energy and magic.
            <br/><br/>
            You put the $ATIME in your wallet for safekeeping.
            <br/><br/>
            What will you do with this newfound resource?
            <br/><br/>
            Full of energy and teeming with a renewed sense of adventure, you walk down the mountain and return to your Order to gather your clan and pool your items to resurrect more Genesis Adventurers and earn more $ATIME.
            </p>
            <span className={styles.author}><i>The Ancestral Time Returns</i></span>
          </blockquote>
          <br/><br/>
          <div className={[styles.cta].join(' ')}>
            <div className={[styles.btn, styles.disabled, styles.cta].join(" ")}><a>Retrieve $ATIME</a></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function useManaCountByOrders() {

  const GET_MANA_COUNT_BY_ORDERS = gql`
    query GetManaCountByOrders {
      orders (orderBy: id) {
        id
        manasHeld
      }
    }
  `;
  return useQuery<ManaByOrdersData>(
    GET_MANA_COUNT_BY_ORDERS
  );
}

const Chapter1ProgressBars = (props) => {
  const maxGM = 20320;
  const { loading, data, error } = useManaCountByOrders();
  let progress = { percentage: 0, message: "" }
  let progressByOrder = { total: 0, spread: new Array}
  if (loading) {
    progress["percentage"] = 0;
    progress["msg"] = "Loading..."
  } else {
    let totalMana = 0;
    let manaByOrders = new Array;

    for(let i=0; i < data.orders.length; i++) {
      totalMana = totalMana + Number(data.orders[i].manasHeld)
      manaByOrders[data.orders[i].id] = Number(data.orders[i].manasHeld)
    } 
    progress["percentage"] = Math.ceil(totalMana/maxGM*100);
    progress["msg"] = Numeral(totalMana).format('0,0') + " of "+Numeral(maxGM).format('0,0')+" Genesis Mana Distilled"
    progressByOrder["total"] = totalMana
    progressByOrder["spread"] = manaByOrders
  }
  if (props.type == "spread")
    return <OrdersSpreadBar data={progressByOrder} /> 
  else
    return <ProgressBar data={progress} />
}

const OrdersSpreadBar = (props) => {
  const total = props.data.total
  const orderCount = props.data.spread.length
  const orderSpread = props.data.spread

  let filler = []
  for (let i=1; i<orderCount; i++) {
    let data = orderSpread[i]/total*100
    filler.push(<OrderFiller percentage={data} suffixid={i}/>)
  }
  return (
    <div className={styles.progressbar_spread}>
      {filler}
    </div>
  )
}

const OrderFiller = (props) => {
  return <div className={styles.orderFiller} style={{ width: `${props.percentage}%` }} data-suffixId={props.suffixid} />
}

const ProgressBar = (props) => {
  const percentage = props.data.percentage
  const msg = props.data.msg
  return (
    <div className={styles.progressbar}>
      <div className={styles.message}>{msg}</div>
      <Filler percentage={percentage} />
    </div>
  )
}

const Filler = (props) => {
  return <div className={styles.filler} style={{ width: `${props.percentage}%` }} />
}