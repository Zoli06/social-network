import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from './App';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import './index.scss';
import { createUploadLink } from 'apollo-upload-client';

const VARIABLES_TO_CHECK = ['REACT_APP_API_URL', 'REACT_APP_WS_URL', 'REACT_APP_DEBUG_VERSION'];

VARIABLES_TO_CHECK.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Environment variable ${variable} is not defined`);
  }
});

const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

const httpLink = createUploadLink({
  uri: process.env.REACT_APP_API_URL,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_WS_URL!,
    connectionParams: {
      Authorization: `Bearer ${getAuthToken()}`,
      'Apollo-Require-Preflight': 'true',
    },
  })
);

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
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
    privateMessageId: string;
  }) => {
    switch (__typename) {
      case 'Group':
        return rest.groupId;
      case 'Media':
        return rest.mediaId;
      case 'Message':
        return rest.messageId;
      case 'User':
        return rest.userId;
      case 'PrivateMessage':
        return rest.privateMessageId;
      default:
        return id;
    }
  },
  typePolicies: {
    Query: {
      fields: {
        topMessages: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        trendingMessages: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    PrivateMessage: {
      keyFields: ['privateMessageId'],
    },
    Message: {
      keyFields: ['messageId'],
      fields: {
        reactions: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    Group: {
      keyFields: ['groupId'],
      fields: {
        messages: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        members: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        memberRequests: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        bannedUsers: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        invitedUsers: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        admins: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        rejectedUsers: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    Media: {
      keyFields: ['mediaId'],
    },
    User: {
      keyFields: ['userId'],
      fields: {
        myPrivateMessagesWithUser: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
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

export const client = new ApolloClient({
  link: splitLink,
  cache,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
      <p className='fixed bottom-0 right-0 text-xs text-gray-500'>{process.env.REACT_APP_DEBUG_VERSION}</p>
    </ApolloProvider>
  </StrictMode>
);
