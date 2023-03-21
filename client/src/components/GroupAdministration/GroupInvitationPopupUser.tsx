import { Button } from 'react-daisyui';
import {
  UserListElement,
  UserListElementGQLData,
} from '../User/UserListElement';
import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';

const SEND_GROUP_INVITATION_MUTATION = gql`
  mutation SendGroupInvitation($groupId: ID!, $userId: ID!) {
    sendGroupInvitation(groupId: $groupId, userId: $userId)
  }
`;

type SendGroupInvitationMutationGQLData = {
  sendGroupInvitation: boolean;
};

export const GroupInvitationPopupUser = ({
  user,
  groupId,
}: GroupInvitationPopupUserProps) => {
  const [isInvited, setIsInvited] = useState(false);

  const [sendGroupInvitation] = useMutation<SendGroupInvitationMutationGQLData>(
    SEND_GROUP_INVITATION_MUTATION,
    {
      onCompleted: () => {
        setIsInvited(true);
      },
    }
  );

  return (
    <div key={user.userId} className='flex justify-between'>
      <UserListElement user={user} />
      {!isInvited ? (
        <Button
          className='ml-4'
          onClick={() =>
            sendGroupInvitation({
              variables: {
                groupId: groupId,
                userId: user.userId,
              },
            })
          }
        >
          Invite
        </Button>
      ) : (
        <Button className='ml-4'>Invited</Button>
      )}
    </div>
  );
};

GroupInvitationPopupUser.fragments = {
  user: gql`
    fragment GroupInvitationPopupUser on User {
      userId
      ...UserListElement
    }

    ${UserListElement.fragments.user}
  `,
};

export type GroupInvitationPopupUserGQLData = {
  userId: string;
} & UserListElementGQLData;

type GroupInvitationPopupUserProps = {
  user: GroupInvitationPopupUserGQLData;
  groupId: string;
};
