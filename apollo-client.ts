import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { RestLink } from 'apollo-link-rest';
import { RetryLink } from '@apollo/client/link/retry';

const theGraphLink = new HttpLink({uri:"https://api.thegraph.com/subgraphs/name/treppers/genesisproject"});
const apiLink = new RestLink({
  uri:'/api',
  responseTransformer: response => response.json()
});

const dispatcherLink = new RetryLink().split(
  (operation) =>  operation.variables?.restful,
  apiLink,
  theGraphLink
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: dispatcherLink
});
export default client;
