import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { RestLink } from 'apollo-link-rest';
import { RetryLink } from '@apollo/client/link/retry';

const theGraphLink = new HttpLink({uri:"https://api.thegraph.com/subgraphs/name/treppers/genesisproject"});
const apiLink = new RestLink({
  uri:'/api',
  responseTransformer: response => response.json()
});

const theNFTxLink = new HttpLink({uri:"https://api.thegraph.com/subgraphs/name/nftx-project/nftx-v2"});
const theSushiSwapLink = new HttpLink({uri:"https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork"});

const dispatcherLink = new RetryLink().split(
  (operation) =>  operation.getContext()?.restful,
  apiLink,
  new RetryLink().split(
    (operation) =>  operation.getContext()?.nftx,
    theNFTxLink,
    new RetryLink().split(
      (operation) =>  operation.getContext()?.sushiswap,
      theSushiSwapLink,
      theGraphLink,
    )
  )
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: dispatcherLink
});

export default client;

