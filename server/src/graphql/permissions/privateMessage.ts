import {
  isAuthenticated,
  isUserViewingOwnPrivateMessage,
  isPrivateMessageReceiverFriend,
  isPrivateMessageDeleted
} from './rules';
import { and, allow, not } from 'graphql-shield';

export default {
  Query: {
    privateMessage: and(isAuthenticated, isUserViewingOwnPrivateMessage),
  },
  Mutation: {
    sendPrivateMessage: and(isAuthenticated, isPrivateMessageReceiverFriend),
    editPrivateMessage: and(isAuthenticated, isUserViewingOwnPrivateMessage, not(isPrivateMessageDeleted)),
    deletePrivateMessage: and(isAuthenticated, isUserViewingOwnPrivateMessage, not(isPrivateMessageDeleted)),
  },
  PrivateMessage: {
    '*': isAuthenticated,
  },
  Subscription: {
    // TODO: see message.ts
    '*': allow,
  },
};
