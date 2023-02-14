import {
  isAuthenticated,
  isUserViewingOwnPrivateMessage,
  isPrivateMessageReceiverFriend,
} from './rules';
import { and, allow } from 'graphql-shield';

export default {
  Query: {
    privateMessage: and(isAuthenticated, isUserViewingOwnPrivateMessage),
  },
  Mutation: {
    sendPrivateMessage: and(isAuthenticated, isPrivateMessageReceiverFriend),
    editPrivateMessage: and(isAuthenticated, isUserViewingOwnPrivateMessage),
    deletePrivateMessage: and(isAuthenticated, isUserViewingOwnPrivateMessage),
  },
  PrivateMessage: {
    '*': isAuthenticated,
  },
  Subscription: {
    // TODO: see message.ts
    '*': allow,
  },
};
