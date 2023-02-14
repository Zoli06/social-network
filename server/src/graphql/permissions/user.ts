import { deny, allow, and } from 'graphql-shield';
import { isAuthenticated, isUserViewingOwnThing, isUserCheckingOwnNotification } from './rules';

export default {
  Query: {
    user: isAuthenticated,
    me: isAuthenticated,
  },
  Mutation: {
    register: allow,
    login: allow,
    updateUser: isAuthenticated,
    createUserUserRelationship: isAuthenticated,
    checkNotification: and(isAuthenticated, isUserCheckingOwnNotification),
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
    lastLoginAt: isAuthenticated,
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
  },
  // TODO: do todo in user.gql then write permissions for this field
  UserUserRelationship: {
    '*': isAuthenticated
  },
  AuthPayload: {
    token: allow,
    user: allow,
  },
  Notification: {
    '*': isAuthenticated,
  },
};
