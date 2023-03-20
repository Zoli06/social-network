import { gql, useMutation } from '@apollo/client';
import { UserContext } from '../../App';
import { useContext } from 'react';
import { Button } from 'react-daisyui';

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

export const GroupActions = ({
  group,
  redirectToInfoPageWhenLeave,
  onlyDisplayButtons = false,
}: GroupActionsProps) => {
  const { userId: myUserId } = useContext(UserContext)!;

  const {
    groupId,
    myRelationshipWithGroup: { type: myRelationshipWithGroupType },
    creatorUser: { userId: creatorUserId },
  } = group;

  const updateRelationshipWithGroup = (
    cache: any,
    newRelationshipWithGroupType: string | null
  ) => {
    cache.modify({
      id: cache.identify({
        __typename: 'Group',
        groupId,
      }),
      fields: {
        myRelationshipWithGroup() {
          return {
            type: newRelationshipWithGroupType,
          };
        },
      },
    });
  };

  const [acceptGroupInvitation] = useMutation(
    ACCEPT_GROUP_INVITATION_MUTATION,
    {
      variables: {
        groupId,
      },
      update(cache) {
        updateRelationshipWithGroup(cache, 'member');
      },
    }
  );

  const [rejectGroupInvitation] = useMutation(
    REJECT_GROUP_INVITATION_MUTATION,
    {
      variables: {
        groupId,
      },
      update(cache) {
        updateRelationshipWithGroup(cache, null);
      },
    }
  );

  const [sendMemberRequest] = useMutation(SEND_MEMBER_REQUEST_MUTATION, {
    variables: {
      groupId,
    },
    update(cache) {
      updateRelationshipWithGroup(cache, 'member_request');
    },
  });

  const [cancelMemberRequest] = useMutation(CANCEL_MEMBER_REQUEST_MUTATION, {
    variables: {
      groupId,
    },
    update(cache) {
      updateRelationshipWithGroup(cache, null);
    },
  });

  const [leaveGroup] = useMutation(LEAVE_GROUP_MUTATION, {
    variables: {
      groupId,
    },
    update(cache) {
      updateRelationshipWithGroup(cache, null);

      if (redirectToInfoPageWhenLeave) {
        window.location.href = `/group/${groupId}/info`;
      }
    },
  });

  const isCreator = myUserId === creatorUserId;

  return (
    <div className='flex justify-end'>
      {isCreator ? (
        !onlyDisplayButtons && (
          <div>
            <p>You are the creator of this group.</p>
          </div>
        )
      ) : (
        <>
          {myRelationshipWithGroupType === 'invited' && (
            <div>
              <Button onClick={() => acceptGroupInvitation()} color='secondary'>
                Accept invitation
              </Button>
              <Button onClick={() => rejectGroupInvitation()} color='success'>
                Reject invitation
              </Button>
            </div>
          )}
          {myRelationshipWithGroupType === 'member_request' && (
            <div>
              <Button onClick={() => cancelMemberRequest()} color='secondary'>
                Cancel member request
              </Button>
            </div>
          )}
          {myRelationshipWithGroupType === null && (
            <div>
              <Button onClick={() => sendMemberRequest()}>
                Send member request
              </Button>
            </div>
          )}
          {myRelationshipWithGroupType === 'member_request_rejected' &&
            !onlyDisplayButtons && (
              <div>
                <p>Sorry, your request was rejected.</p>
              </div>
            )}
          {myRelationshipWithGroupType === 'banned' && !onlyDisplayButtons && (
            <div>
              <p>You are banned from this group.</p>
            </div>
          )}
          {(myRelationshipWithGroupType === 'member' ||
            myRelationshipWithGroupType === 'admin') && (
            <div className='flex gap-4'>
              <Button onClick={() => leaveGroup()} color='secondary'>
                Leave
              </Button>
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
  redirectToInfoPageWhenLeave: boolean;
  onlyDisplayButtons?: boolean;
};
