import { deny, allow, and } from 'graphql-shield';
import {
  isAuthenticated,
  isUserViewingOwnThing,
  isUserCheckingOwnNotification,
} from './rules';

export default {
  Query: {
    user: isAuthenticated,
    me: isAuthenticated,
    searchUsers: isAuthenticated,
  },
  Mutation: {
    register: allow,
    login: allow,
    updateMe: isAuthenticated,
    deleteMe: isAuthenticated,
    createUserUserRelationship: isAuthenticated,
    checkNotification: and(isAuthenticated, isUserCheckingOwnNotification),
    checkAllNotifications: isAuthenticated
  },
  User: {
    userId: isAuthenticated,
    firstName: isAuthenticated,
    lastName: isAuthenticated,
    middleName: isAuthenticated,
    userName: isAuthenticated,
    mobileNumber: and(isAuthenticated),
    email: and(isAuthenticated),
    registratedAt: isAuthenticated,
    intro: isAuthenticated,
    friends: isAuthenticated,
    incomingFriendRequests: and(isAuthenticated, isUserViewingOwnThing),
    outgoingFriendRequests: and(isAuthenticated, isUserViewingOwnThing),
    blockedUsers: and(isAuthenticated, isUserViewingOwnThing),
    userRelationships: and(isAuthenticated, isUserViewingOwnThing),
    myRelationshipWithUser: and(isAuthenticated),
    profileImage: isAuthenticated,
    notifications: and(isAuthenticated, isUserViewingOwnThing),
    myPrivateMessagesWithUser: isAuthenticated,
    groupRelationships: and(isAuthenticated, isUserViewingOwnThing),
    createdGroups: isAuthenticated,
    adminOfGroups: isAuthenticated,
    memberOfGroups: isAuthenticated,
    bannedFromGroups: and(isAuthenticated, isUserViewingOwnThing),
    sentMemberRequestsToGroups: and(isAuthenticated, isUserViewingOwnThing),
    groupsRejectedMemberRequest: and(isAuthenticated, isUserViewingOwnThing),
    invitedToGroups: and(isAuthenticated, isUserViewingOwnThing),
    points: isAuthenticated,
    friendSuggestions: and(isAuthenticated, isUserViewingOwnThing),
    groupSuggestions: and(isAuthenticated, isUserViewingOwnThing),
  },
  // TODO: do todo in user.gql then write permissions for this field
  UserUserRelationship: {
    '*': isAuthenticated,
  },
  AuthPayload: {
    token: allow,
    user: allow,
  },
  Notification: {
    '*': isAuthenticated,
  },
};
