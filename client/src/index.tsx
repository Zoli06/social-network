import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { App } from "./App";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const getAuthToken = () => {
  // production code
  // const token = localStorage.getItem('token');

  // temp code
  let token = localStorage.getItem("token");
  if (!token) token = "81";
  return token;
};

const httpLink = createHttpLink({
  uri: `http://${window.location.hostname}:8000/graphql`,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `ws://${window.location.hostname}:8000/graphql`,
    connectionParams: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
);

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const cache = new InMemoryCache({
  // @ts-ignore 
  dataIdFromObject: ({
    __typename,
    id,
    ...rest
  }: {
    __typename: string;
    id: string;
    groupId: string;
    mediaId: string;
    messageId: string;
    userId: string;
  }) => {
    switch (__typename) {
      case "Group":
        return rest.groupId;
      case "Media":
        return rest.mediaId;
      case "Message":
        return rest.messageId;
      case "User":
        return rest.userId;
      default:
        return id;
    }
  },
  typePolicies: {
    Message: {
      keyFields: ["messageId"],
      fields: {
        reactions: {
          merge(_existing, incoming) {
            return incoming;
          }
        },
      },
    },
    Group: {
      keyFields: ["groupId"],
      fields: {
        messages: {
          merge(_existing, incoming) {
            return incoming;
          }
        },
      },
    },
    Media: {
      keyFields: ["mediaId"],
    },
    User: {
      keyFields: ["userId"],
    },
    Subscription: {
      fields: {
        messageReacted: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: splitLink,
  cache,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
