import { and, race, not } from 'graphql-shield';
import {
  isAuthenticated,
  isGroupMember,
  isGroupAdmin,
  isGroupCreator,
  isInvitedToGroup,
  isBannedFromGroup,
  isUserViewingOwnThing,
} from './rules';

export default {
  Query: {
    // TODO: implement private groups
    group: isAuthenticated
  },
  Mutation: {
    createGroup: isAuthenticated,
    updateGroup: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    deleteGroup: and(isAuthenticated, isGroupCreator),

    sendGroupInvitation: and(
      isAuthenticated,
      race(isGroupAdmin, isGroupCreator)
    ),
    acceptGroupInvitation: and(isAuthenticated, isInvitedToGroup),
    rejectGroupInvitation: and(isAuthenticated, isInvitedToGroup),
    banUser: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    unbanUser: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    addAdmin: and(isAuthenticated, isGroupCreator),
    removeAdmin: and(isAuthenticated, isGroupCreator),
    sendMemberRequest: and(
      isAuthenticated,
      not(race(isGroupAdmin, isGroupCreator, isGroupMember)),
      not(isBannedFromGroup)
    ),
    acceptMemberRequest: and(
      isAuthenticated,
      race(isGroupAdmin, isGroupCreator)
    ),
    rejectMemberRequest: and(
      isAuthenticated,
      race(isGroupAdmin, isGroupCreator)
    ),
    leaveGroup: and(isAuthenticated, race(isGroupMember, isGroupAdmin)),
    kickUser: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),

    setNotificationFrequency: and(isAuthenticated, isGroupMember),
  },
  Group: {
    groupId: isAuthenticated,
    creatorUser: isAuthenticated,
    createdAt: isAuthenticated,
    updatedAt: isAuthenticated,
    name: isAuthenticated,
    messages: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator)
    ),
    members: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator)
    ),
    bannedUsers: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    invitedUsers: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    admins: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator)
    ),
    memberRequests: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    rejectedUsers: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    notificationFrequency: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator)
    ),
    description: isAuthenticated,
    visibility: isAuthenticated,
    userRelationshipWithGroup: and(
      isAuthenticated,
      race(isGroupAdmin, isGroupCreator)
    ),
    myRelationshipWithGroup: isAuthenticated,
  },
  GroupUserRelationship: {
    // user: isAuthenticated,
    // group: isAuthenticated,
    // type: isAuthenticated,
    // createdAt: isAuthenticated,
    // updatedAt: isAuthenticated
    '*': and(isAuthenticated, isUserViewingOwnThing),
  },
};
