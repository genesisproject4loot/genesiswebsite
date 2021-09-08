// Imports
import Layout from "@components/Layout"; // Layout wrapper
import styles from "@styles/pages/Home.module.scss"; // Styles
import Link from "next/link"
// Types
import type { ReactElement } from "react";

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
            The Genesis Project is a community of builders, designers, mathematicians and storytellers on a mission to discover the origin story of the Loot universe.
            <br /><br />
            Join us on our quest to restore the original Orders of Loot and resurrect the Genesis Adventurers.
          </p>
          <div>
            <ul className={styles.btns}>
              <li>
                <div className={styles.btn}><a href="#chapter1">Chapter 1</a></div>
                <div className={styles.moreinfo}>
                  <a href="https://opensea.io/collection/genesis-mana" target="_blank" rel="noopener noreferrer">
                    OpenSea
                  </a>
                  <a href="https://etherscan.io/address/0xf4b6040a4b1b30f1d1691699a8f3bf957b03e463#writeContract" target="_blank" rel="noopener noreferrer">
                    Etherscan
                  </a>
                </div>
              </li>
              <li>
                <div className={styles.btn}><a href="#chapter2">Chapter 2</a></div>
                <div className={[styles.moreinfo, styles.inactive].join(' ')}>
                  <a href="#" onClick={(e) => {e.preventDefault() }} target="_blank" rel="noopener noreferrer">
                    OpenSea
                  </a>
                  <a href="#" onClick={(e) => {e.preventDefault() }} target="_blank" rel="noopener noreferrer">
                    Etherscan
                  </a>
                </div>
              </li>
              <li>
                <div className={styles.btn}><a href="#chapter3">Chapter 3</a></div>
                <div className={[styles.moreinfo, styles.inactive].join(' ')}>
                  <a href="#" onClick={(e) => {e.preventDefault() }}  target="_blank" rel="noopener noreferrer">
                    OpenSea
                  </a>
                  <a href="#" onClick={(e) => {e.preventDefault() }} target="_blank" rel="noopener noreferrer">
                    Etherscan
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
          <i>In the beginning, before the bags were shuffled, these Loot bags were carried by 2,540 original Adventurers — &ldquo;Genesis Adventures&rdquo; — <a href="https://docs.google.com/spreadsheets/d/118x6e4WEVZ7q-XvsRoyDNq7Nufw3xSmMKeYxPpivwRA/edit?usp=sharing" target="_blank">organized across 16 Orders.</a></i>
          <a href="https://docs.google.com/spreadsheets/d/118x6e4WEVZ7q-XvsRoyDNq7Nufw3xSmMKeYxPpivwRA/edit?usp=sharing" target="_blank"><img src="img/16-orders.png" width="75%"/></a>
          <br/><br/>
          Read <a href="https://medium.com/@timshelxyz?p=dddb50ab18b7" target="_blank">here</a> for a detailed history of our data exploration, statistical modeling, and linguistic analysis.
          </p>
        </div>
        <div className={styles.home__chapters}>
          <hr id="chapter1"/>
          <h2>Chapter 1 : Genesis Mana</h2>
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
          <br/><br/>
          <div className={[styles.btn, styles.cta].join(' ')}><Link href="https://etherscan.io/address/0xf4b6040a4b1b30f1d1691699a8f3bf957b03e463#writeContract">Distill Genesis Mana</Link></div>
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
            You carry this precious Genesis Loot on your wallet, and climb to the top of the mountain to attempt to resurrect a Genesis Adventurer.
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
          The more Genesis Adventurers you resurrect, the strong you and/or your team will be in the games ahead. Furthermore, for every Genesis Adventurer you resurrect, you have the right to claim a bag of Adventure Mana ($AMANA).
          </p>
          <br/><br/>
          <div className={[styles.btn, styles.disabled, styles.cta].join(" ")}><a>Resurrect Genesis Adventurer</a></div>
        </div>

        <div className={styles.home__chapters}>
          <hr id="chapter3"/>
          <h2>Chapter 3 : $AMANA</h2>
          <blockquote>
            <p>
            As the flames die down, you notice something in the ash.
            <br/><br/>
            Your bag of Genesis Mana is intact, but transformed.
            <br/><br/>
            You remove it from the ash and discover a bag of Adventure Mana ($AMANA).
            <br/><br/>
            It tingles with energy and magic.
            <br/><br/>
            You put the $AMANA in your wallet for safekeeping.
            <br/><br/>
            What will you do with this newfound resource?
            <br/><br/>
            Full of energy and teeming with a renewed sense of adventure, you walk down the mountain and return to your Order to gather your clan and pool your items to resurrect more Genesis Adventurers and earn more $AMANA.
            </p>
            <span className={styles.author}><i>The Ancestral Mana Returns</i></span>
          </blockquote>
          <p>
          For Genesis Adventurer holders (individuals or teams), retrieve your $AMANA (an ERC20 token).
          <br/><br/>
          While Adventure Gold ($AGLD) is used to BUY things in the game, Adventure Mana ($AMANA) is used to DO things in the adventures ahead.
          </p>
          <br/><br/>
          <div className={[styles.btn, styles.disabled, styles.cta].join(" ")}><a>Retrieve Adventure Mana</a></div>
        </div>
      </div>
    </Layout>
  );
}
