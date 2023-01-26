import { deny, allow, and } from 'graphql-shield';
import { isAuthenticated, isUserViewingOwnThing } from './rules';

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
  },
  User: {
    userId: isAuthenticated,
    firstName: isAuthenticated,
    lastName: isAuthenticated,
    middleName: isAuthenticated,
    userName: isAuthenticated,
    // TODO: Maybe email and mobileNumber should be hidden from other users. Consider that
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
  },
  // TODO: do todo in user.gql then write permissions for this field
  UserUserRelationship: {
    user: isAuthenticated,
    type: isAuthenticated,
    createdAt: isAuthenticated,
    updatedAt: isAuthenticated,
  },
  AuthPayload: {
    token: allow,
    user: allow,
  },
};
