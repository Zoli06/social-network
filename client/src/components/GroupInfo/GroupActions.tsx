import './GroupInfo.scss'

import { gql, useMutation } from '@apollo/client';
import { UserContext } from '../../App';
import React, { useContext } from 'react';

const ACCEPT_GROUP_INVITATION_MUTATION = gql`
  mutation AcceptGroupInvitationMutation($groupId: ID!) {
    acceptGroupInvitation(groupId: $groupId)
  }
`;

const REJECT_GROUP_INVITATION_MUTATION = gql`
  mutation RejectGroupInvitationMutation($groupId: ID!) {
    rejectGroupInvitation(groupId: $groupId)
  }
`;

const SEND_MEMBER_REQUEST_MUTATION = gql`
  mutation SendMemberRequestMutation($groupId: ID!) {
    sendMemberRequest(groupId: $groupId)
  }
`;

const CANCEL_MEMBER_REQUEST_MUTATION = gql`
  mutation CancelMemberRequestMutation($groupId: ID!) {
    cancelMemberRequest(groupId: $groupId)
  }
`;

const LEAVE_GROUP_MUTATION = gql`
  mutation LeaveGroupMutation($groupId: ID!) {
    leaveGroup(groupId: $groupId)
  }
`;

export const GroupActions = ({ group }: GroupActionsProps) => {
  const { userId: myUserId } = useContext(UserContext)!;

  const {
    groupId,
    myRelationshipWithGroup: { type: myRelationshipWithGroupType },
    creatorUser: { userId: creatorUserId },
  } = group;

  const [acceptGroupInvitation] = useMutation(
    ACCEPT_GROUP_INVITATION_MUTATION,
    {
      variables: {
        groupId,
      },
    }
  );

  const [rejectGroupInvitation] = useMutation(
    REJECT_GROUP_INVITATION_MUTATION,
    {
      variables: {
        groupId,
      },
    }
  );

  const [sendMemberRequest] = useMutation(SEND_MEMBER_REQUEST_MUTATION, {
    variables: {
      groupId,
    },
  });

  const [cancelMemberRequest] = useMutation(CANCEL_MEMBER_REQUEST_MUTATION, {
    variables: {
      groupId,
    },
  });

  const [leaveGroup] = useMutation(LEAVE_GROUP_MUTATION, {
    variables: {
      groupId,
    },
  });

  const isCreator = myUserId === creatorUserId;

  return (
    <div>
      {isCreator ? (
        <div>
          <p>You are the creator of this group.</p>
        </div>
      ) : (
        <>
          {myRelationshipWithGroupType === 'invited' && (
            <div>
              <button onClick={() => acceptGroupInvitation()}>
                Accept invitation
              </button>
              <button onClick={() => rejectGroupInvitation()}>
                Reject invitation
              </button>
            </div>
          )}
          {myRelationshipWithGroupType === 'member_request' && (
            <div>
              <button onClick={() => cancelMemberRequest()}>
                Cancel member request
              </button>
            </div>
          )}
          {myRelationshipWithGroupType === null && (
            <div>
              <button onClick={() => sendMemberRequest()}>
                Send member request
              </button>
            </div>
          )}
          {myRelationshipWithGroupType === 'member_request_rejected' && (
            <div>
              <p>Sorry, your request was rejected.</p>
            </div>
          )}
          {myRelationshipWithGroupType === 'banned' && (
            <div>
              <p>You are banned from this group.</p>
            </div>
          )}
          {myRelationshipWithGroupType === 'member' && (
            <div>
              <button onClick={() => leaveGroup()}>Leave group</button>
            </div>
          )}
          {myRelationshipWithGroupType === 'admin' && (
            <div>
              <p>You are an admin of this group.</p>
              <button onClick={() => leaveGroup()}>Leave group</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

GroupActions.fragments = {
  group: gql`
    fragment GroupActions on Group {
      groupId
      myRelationshipWithGroup {
        type
      }
      creatorUser {
        userId
      }
    }
  `,
};

export type GroupActionsGQLData = {
  groupId: string;
  myRelationshipWithGroup: {
    type:
      | 'member'
      | 'banned'
      | 'admin'
      | 'member_request'
      | 'member_request_rejected'
      | 'invited'
      | null;
  };
  creatorUser: {
    userId: string;
  };
};

type GroupActionsProps = {
  group: GroupActionsGQLData;
};
