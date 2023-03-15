import { and, race, not } from 'graphql-shield';
import {
  isAuthenticated,
  isGroupMember,
  isGroupAdmin,
  isGroupCreator,
  isInvitedToGroup,
  isBannedFromGroup,
  didUserSentMemberRequest,
  isGroupVisibleToUser,
  isGroupOpen,
} from './rules';

export default {
  Query: {
    group: and(isAuthenticated, isGroupVisibleToUser),
    searchGroups: isAuthenticated,
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
      isGroupVisibleToUser,
      // TODO: review what happens when user is invited to group
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
    cancelMemberRequest: and(isAuthenticated, didUserSentMemberRequest),
    leaveGroup: and(isAuthenticated, race(isGroupMember, isGroupAdmin)),
    kickUser: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),

    setNotificationFrequency: and(isAuthenticated, race(isGroupMember, isGroupAdmin, isGroupCreator))
  },
  Group: {
    groupId: isAuthenticated,
    creatorUser: and(isAuthenticated, isGroupVisibleToUser),
    createdAt: and(isAuthenticated, isGroupVisibleToUser),
    updatedAt: and(isAuthenticated, isGroupVisibleToUser),
    name: and(isAuthenticated, isGroupVisibleToUser),
    messages: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator, isGroupOpen)
    ),
    members: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator, isGroupOpen)
    ),
    bannedUsers: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    invitedUsers: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    admins: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator, isGroupOpen)
    ),
    memberRequests: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    rejectedUsers: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    otherUsers: and(isAuthenticated, race(isGroupAdmin, isGroupCreator)),
    notificationFrequency: and(
      isAuthenticated,
      race(isGroupMember, isGroupAdmin, isGroupCreator, isGroupOpen)
    ),
    description: and(isAuthenticated, isGroupVisibleToUser),
    visibility: and(isAuthenticated, isGroupVisibleToUser),
    userRelationshipWithGroup: and(
      isAuthenticated,
      race(isGroupAdmin, isGroupCreator)
    ),
    myRelationshipWithGroup: and(isAuthenticated, isGroupVisibleToUser),
    indexImage: and(isAuthenticated, isGroupVisibleToUser),
    bannerImage: and(isAuthenticated, isGroupVisibleToUser)
  },
  GroupUserRelationship: {
    // user: isAuthenticated,
    // group: isAuthenticated,
    // type: isAuthenticated,
    // createdAt: isAuthenticated,
    // updatedAt: isAuthenticated
    // TODO: fix this
    '*': isAuthenticated
  },
};
