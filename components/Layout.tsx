// Imports
import Link from "next/link"; // Routing
import { useRouter } from "next/router"; // Routing
import { default as HTMLHead } from "next/head"; // Meta
import styles from "@styles/components/Layout.module.scss"; // Styles

// Types
import type { ReactElement } from "react";

export default function Layout({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  return (

    <div>
      {/* Meta */}
      <Head />
      {/* Top header */}
      <Header />

      {/* Page content */}
      <div className={styles.content}>{children}</div>
      {/* Bottom footer */}
      <Footer />
    </div>
  );
}

/**
 * Meta HTML Head
 * @returns {ReactElement} HTML Head component
 */
function Head(): ReactElement {

  return (
    <HTMLHead>
      {/* Primary Meta Tags */}
      <title>Genesis Project (for Loot)</title>
      <meta name="title" content="Genesis Project (for Loot)" />
      <meta
        name="description"
        content="The Genesis Project is a community of builders, designers, mathematicians and storytellers on a mission to discover the origin story of the Loot universe."
      />

      {/* OG + Faceook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://genesisproject.xyz/" />
      <meta property="og:title" content="The Genesis Project (for Loot)" />
      <meta
        property="og:description"
        content="The Genesis Project is a community of builders, designers, mathematicians and storytellers on a mission to discover the origin story of the Loot universe."
      />
      <meta property="og:image" content="https://genesisproject.xyz/genesisadventurer.png" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://genesisproject.xyz/" />
      <meta property="twitter:title" content="The Genesis Project (for Loot)" />
      <meta
        property="twitter:description"
        content="The Genesis Project is a community of builders, designers, mathematicians and storytellers on a mission to discover the origin story of the Loot universe."
      />
      <meta property="twitter:image" content="https://genesisproject.xyz/genesisadventurer.png" />

      {/* Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-CB1BCE90W3"
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CB1BCE90W3', { page_path: window.location.pathname });
          `,
        }}
      />
    </HTMLHead>
  );
}

/**
 * Header
 * @returns {ReactElement} Header
 */
function Header() {
  // Collect current path for active links
  const { pathname } = useRouter();

  return (
    <div className={styles.header}>
      {/* Main logo */}
      <div className={styles.header__logo}>
        <Link href="/">
          <a><img src="genesis-icon.png" height="35px"></img> Genesis Project (for Loot)</a>
        </Link>
      </div>

    </div>
  );
}

/**
 * Footer component
 * @returns {ReactElement} Footer
 */
function Footer(): ReactElement {

  return (
    <div className={styles.footer}>
      <p>
        This website is{" "}
        <a
          href="https://github.com/genesisproject4loot/genesiswebsite"
          target="_blank"
          rel="noopener noreferrer"
        >
          open-source
        </a>
        .
        Along with{" "}
        <a
          href="https://github.com/genesisproject4loot/genesismana"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chapter 1&apos;s contract
        </a>
        .
      </p>
    </div>
  );
}
