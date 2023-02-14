import React from 'react';
import { gql } from '@apollo/client';
import { openEditor } from '../Editor/Editor';
import { useMutation } from '@apollo/client';

const SEND_PRIVATE_MESSAGE_MUTATION = gql`
  mutation SendPrivateMessageMutation($privateMessage: PrivateMessageInput!) {
    sendPrivateMessage(privateMessage: $privateMessage) {
      privateMessageId
      text
      createdAt
    }
  }
`;

export const SendPrivateMessage = ({ user }: SendPrivateMessageProps) => {
  const [sendPrivateMessage] = useMutation(SEND_PRIVATE_MESSAGE_MUTATION, {
    update(cache, { data: { sendPrivateMessage: newPrivateMessage } }) {
      cache.modify({
        id: cache.identify(user),
        fields: {
          myPrivateMessagesWithUser(existingPrivateMessages = []) {
            return [...existingPrivateMessages, newPrivateMessage];
          },
        },
      });
    }
  });

  const { myRelationshipWithUser: { type: relationshipType } } = user;

  const handleClick = () => {
    openEditor((text: string) => {
      sendPrivateMessage({
        variables: {
          privateMessage: {
            text,
            receiverUserId: user.userId,
          }
        }
      });
    });
  };

  return (
    <>
      {relationshipType === 'friend' && (
        <button onClick={handleClick}>Send private message</button>
      )}
    </>
  )
}

SendPrivateMessage.fragments = {
  user: gql`
    fragment SendPrivateMessage on User {
      userId
      myRelationshipWithUser {
        type
      }
    }
  `
}

export type SendPrivateMessageGQLData = {
  userId: string;
  myRelationshipWithUser: {
    // TODO: export this type from a helper file
    type: 'friend' | 'incoming_friend_request' | 'outgoing_friend_request' | 'incoming_blocking' | 'outgoing_blocking' | 'none';
  }
}

type SendPrivateMessageProps = {
  user: SendPrivateMessageGQLData
}
