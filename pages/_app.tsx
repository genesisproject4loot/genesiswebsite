// Imports
import "@styles/global.scss";
import "@styles/app.css";

// Types
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import client from "../apollo-client";
import { WalletProvider } from "hooks/useWalletContext";

// Export application
export default function GenesisProject({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </WalletProvider>
  );
}
