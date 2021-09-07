// Imports
import Layout from "@components/Layout"; // Layout wrapper
import { defaultBags } from "@utils/constants"; // Bags to render
import styles from "@styles/pages/Home.module.scss"; // Styles
import Link from "next/link"

// Types
import type { ReactElement } from "react";

export default function Home(): ReactElement {
  // Quicklinks to render
  const quicklinks: Record<string, string>[] = [
  ];

  return (
    <Layout>
      <div>
        <div className={styles.home__cta}>
          {/* CTA title */}
          <h1>Chapter 1 : Genesis Mana</h1>
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
            The Genesis Project is a community of  builders, designers, mathematicians and storytellers on a mission to discover the origin story of the Loot universe.
            <br /><br />
            Whether by chance, inevitability or divine design, the data reveals a hidden scaffolding behind the game, hiding in plain sight — <b>within the seemingly random Loot bags, there is a clear and singular Order to the Loot Universe.</b>
            The Genesis Project seeks not to <i>create</i>, but to <b>discover</b> the origin story of Loot (for Adventurers).
            <br /><br />
            Join us on our quest to restore the original Orders of Loot and resurrect the Genesis Adventurers.
          </p>
        </div>
        <div className={styles.home__chapters}>
          <blockquote>
          <p>
          You walk to the edge, and take the Holy Chestplate of Brilliance from your Loot bag.
          <br/>
You hold it up to the light, and it shimmers with energy and vibration.  You feel the pull of your ancestral Order calling through the mist.
Time and space stands still. A flash!
<br/>
Then silence.
<br/>
You carefully look into your Wallet and notice something new: Genesis Mana.
<br/>
<b>A Discovery Awaits...</b>
<br/>
You now have a new piece of Genesis Mana in your bag: the Holy Chestplate of Brilliance.
Where did this come from?  Who wore this?
It strikes you — this ancient item came from one of the original Adventurers — a Genesis Adventurer.
What else were they wearing when they arrived in this realm? What else did they carry?
In the times ahead, the Order of Brilliance will need a champion, a hero. You carry her Chestplate in your bag and can feel her calling to you through the ages.
<br/>
<b>Find me the rest of my loot.  I am here.  Bring me back.</b>
<br/>
Can you resurrect a Genesis Adventurer of Brilliance before it’s too late?
          </p>
          </blockquote>
          <ul>
            <li><b>Who:</b> Loot Bag holders</li>
            <li><b>What:</b> an NFT of a single item from your bag</li>
            <li><b>What to Do:</b> &ldquo;Distill&rdquo; Genesis Mana from any item in your bag that has an Order (&ldquo;Of ___&rdquo;). Genesis Mana is essentially a Mint Pass for a Genesis Adventurer</li>
            <li><b>Price:</b> Free</li>
            <li><b>How:</b> From Etherscan</li>
            <li><b>Why:</b> If you collect all 8 Genesis Mana from a single order, the original items that equipped a &ldquo;Genesis Adventurer&rdquo; of your order, then you can mint a Genesis Adventurer.</li>
          </ul>
          <div className="btn"><Link href="#">Mint the NFT</Link></div>
        </div>
      </div>
    </Layout>
  );
}
