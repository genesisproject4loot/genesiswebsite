// Imports
import Layout from "@components/Layout"; // Layout wrapper
import styles from "@styles/pages/Home.module.scss"; // Styles
import Link from "next/link"
// Types
import type { ReactElement } from "react";

export default function Home(): ReactElement {
  // Quicklinks to render
  const quicklinks: Record<string, string>[] = [
    { name: "OpenSea", url: "https://opensea.io/collection/genesismana" },
    {
      name: "Twitter",
      url: "https://twitter.com/lootproject",
    },
    {
      name: "Mirror",
      url: "https://mirror.xyz"
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
            <ul>
              <li><div className={styles.btn}><a href="#chapter1">Chapter 1</a></div></li>
              <li><div className={styles.btn}><a href="#chapter2">Chapter 2</a></div></li>
              <li><div className={styles.btn}><a href="#chapter3">Chapter 3</a></div></li>
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
          <span className={styles.author}><i>timshel - The Historian</i></span>
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
          <i>In the beginning, before the bags were shuffled, these Loot bags were carried by 2,540 original Adventurers — &ldquo;Genesis Adventures&rdquo; — <a href="16-orders.png" target="_blank">organized across 16 Orders.</a></i>
          <br/><br/>
          Read <a href="#">here</a> for a detailed history of our data exploration, statistical modeling, and linguistic analysis.
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
          You now have a new piece of Genesis Mana in your bag: the Holy Chestplate of Brilliance.
          Where did this come from?  Who wore this?
          It strikes you — this ancient item came from one of the original Adventurers — <b>a Genesis Adventurer.</b>
          <br/><br/>
          What else were they wearing when they arrived in this realm? What else did they carry?
          In the times ahead, the Order of Brilliance will need a champion, a hero. You carry her Chestplate in your bag and can feel her calling to you through the ages.
          <br/><br/>
          <i>Find me the rest of my loot.  I am here.  Bring me back.</i>
          <br/><br/>
          Can you resurrect a Genesis Adventurer of Brilliance before it’s too late?
          </p>
          <span className={styles.author}><i>The Discovery Awaits</i></span>
          </blockquote>
          <ul>
            <li><b>Who:</b> Loot Bag holders</li>
            <li><b>What:</b> an NFT of a single item from your bag</li>
            <li><b>What to Do:</b> &ldquo;Distill&rdquo; Genesis Mana from any item in your bag that has an Order (&ldquo;Of ___&rdquo;). Genesis Mana is essentially a Mint Pass for a Genesis Adventurer</li>
            <li><b>Price:</b> Free</li>
            <li><b>How:</b> From Etherscan</li>
            <li><b>Why:</b> If you collect all 8 Genesis Mana from a single order, the original items that equipped a &ldquo;Genesis Adventurer&rdquo; of your order, then you can mint a Genesis Adventurer.</li>
          </ul>
          <div className={[styles.btn, styles.cta].join(' ')}><Link href="#">Distill Genesis Mana</Link></div>
          <div className={styles.examples}>
            <span>Example Genesis Mana:</span>
          </div>
        </div>

        <div className={styles.home__chapters}>
          <hr id="chapter2"/>
          <h2>Chapter 2 : The Genesis Adventurers</h2>
          <blockquote>
            <p>
            You’ve collected a complete set of Genesis Loot, one for Each Item Type, all of the same Order.
            <br/><br/>
            You carry this precious Genesis Loot on your wallet, and climb to the top of the mountain to attempt to resurrect a Genesis Adventurer.
            <br/><br/>
            You throw the bag in the fire.
            <br/><br/>
            A Genesis Adventurer of Brilliance emerges from the flames, ready to rejoin their ancestral Order.
            </p>
            <span className={styles.author}><i>The Resurrection Begins</i></span>
          </blockquote>
          <ul>
            <li><b>Who:</b>  Genesis Mana holders</li>
            <li><b>What:</b> an NFT of a &ldquo;perfect&rdquo; bag, originally brought to the Loot universe by a &ldquo;Genesis Adventurer&rdquo;</li>
            <li><b>What to Do:</b> &ldquo;Resurrect&rdquo; Genesis Adventurers from a complete set of 8 items from any of the 16 Orders <li> This means one Weapon, one Head Armor, one Chest Armor, etc all from the same Order (&ldquo;Of ____&rdquo;)</li></li>
            <li><b>Price:</b> Free</li>
            <li><b>How:</b>
              <ul>
                <li>Buy GMs on OpenSea and resurrect a GA yourself</li>
                <li>Trade GMs with others to resurrect a GA yourself</li>
                <li>Team up with others to pool your GMs and collectively resurrect one or many GAs and share them fractionally + share the resulting $AMANA according to a shared agreement you set up</li>
              </ul>
            </li>
            <li><b>Why:</b>
              <ul>
                <li>For your team — The more Genesis Adventurers that your Order resurrects, the stronger your team will be in the games ahead</li>
                <li>For yourself — For every Genesis Adventurer you resurrect, you get 10,000 $AMANA</li>
              </ul>
            </li>
          </ul>
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
            You remove it from the ash and discover a bag of $AMANA.
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
          <ul>
            <li><b>Who:</b> Players who participate in resurrecting Genesis Adventurers, either individually or as teams or within the official DAOs of their Order.</li>
            <li><b>What:</b> A tradeable ERC-20 Token, complimentary to $AGLD</li>
            <li><b>Why:</b> While Adventure Gold ($AGLD) is used to BUY things in the game, Adventure Mana ($AMANA) is used to DO things in the adventures ahead.</li>
          </ul>
          <div className={[styles.btn, styles.disabled, styles.cta].join(" ")}><a>Claim Adventure Mana</a></div>
        </div>
      </div>
    </Layout>
  );
}
