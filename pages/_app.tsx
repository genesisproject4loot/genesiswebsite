// Imports
import "@styles/global.scss";
// Types
import type { AppProps } from "next/app";
import { ApolloProvider } from '@apollo/client';
import client from "../apollo-client";

// Export application
export default function GenesisProject({ Component, pageProps }: AppProps) {


  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
