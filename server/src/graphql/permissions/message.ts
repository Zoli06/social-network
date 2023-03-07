import { and, race, allow, not } from 'graphql-shield';
import {
  isGroupMember,
  isAuthenticated,
  isMessageCreator,
  isGroupAdmin,
  isGroupCreator,
  isGroupOpen,
  isBannedFromGroup,
} from './rules';

export default {
  Query: {
    message: and(
      isAuthenticated,
      race(
        isGroupMember,
        isGroupAdmin,
        isGroupCreator,
        isMessageCreator,
        isGroupOpen
      )
    ),
  },
  Mutation: {
    sendMessage: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator, isGroupOpen),
      not(isBannedFromGroup)
    ),
    editMessage: and(isAuthenticated, isMessageCreator),
    deleteMessage: and(
      isAuthenticated,
      race(isMessageCreator, isGroupAdmin, isGroupCreator)
    ),
    createReaction: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator, isGroupOpen),
      not(isBannedFromGroup)
    ),
    createVote: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator, isGroupOpen),
      not(isBannedFromGroup)
    ),
  },
  Subscription: {
    // left fields here idk if they are needed
    // they could be useful someday
    // messageAdded: and(isAuthenticated, race(isGroupMember, isGroupAdmin, isGroupCreator)),
    // messageEdited: and(isAuthenticated, race(isGroupMember, isGroupAdmin, isGroupCreator)),
    // messagesDeleted: and(isAuthenticated, race(isGroupMember, isGroupAdmin, isGroupCreator)),
    // messageReacted: and(isAuthenticated, race(isGroupMember, isGroupAdmin, isGroupCreator)),
    // messageVoted: and(isAuthenticated, race(isGroupMember, isGroupAdmin, isGroupCreator)),
    // '*': and(isAuthenticated, race(isGroupMember, isGroupAdmin, isGroupCreator))
    // XXX: subscription rules doesn't work because it has to be implemented yet in graphql-shield
    // TODO: find a workaround or make a pull request to graphql-shield
    // see: https://github.com/dimatill/graphql-shield/issues/27
    // also: subscriptions only exposes IDs of the messages and groups wich user already knows since they are providing it to the subscription
    '*': allow,
  },
  Message: {
    messageId: isAuthenticated,
    // group: isAuthenticated,
    // author: isAuthenticated,
    // createdAt: isAuthenticated,
    // updatedAt: isAuthenticated,
    // text: isAuthenticated,
    // responses: isAuthenticated,
    // responseTree: isAuthenticated,
    // responsesCount: isAuthenticated,
    // reactions: isAuthenticated,
    // reaction: isAuthenticated,
    // upVotes: isAuthenticated,
    // downVotes: isAuthenticated,
    // vote: isAuthenticated,
    // mentionedUsers: isAuthenticated,
    // medias: isAuthenticated,
    '*': and(
      isAuthenticated,
      race(
        isGroupMember,
        isGroupAdmin,
        isGroupCreator,
        isMessageCreator,
        isGroupOpen
      )
    ),
    myPermissionToMessage: isAuthenticated, // every user has right to check their own permission to message
  },
  Reaction: {
    user: isAuthenticated,
    createdAt: isAuthenticated,
    updatedAt: isAuthenticated,
    type: isAuthenticated,
  },
  VoteChange: {
    upVotes: isAuthenticated,
    downVotes: isAuthenticated,
  },
};
