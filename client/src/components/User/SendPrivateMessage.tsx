import { gql } from '@apollo/client';
import { Form, Input, Button } from 'react-daisyui';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { PrivateMessage } from './PrivateMessage';

const SEND_PRIVATE_MESSAGE_MUTATION = gql`
  mutation SendPrivateMessageMutation($privateMessage: PrivateMessageInput!) {
    sendPrivateMessage(privateMessage: $privateMessage) {
      privateMessageId
      ...PrivateMessage
    }
  }

  ${PrivateMessage.fragments.privateMessage}
`;

export const SendPrivateMessage = ({ user }: SendPrivateMessageProps) => {
  const [text, setText] = useState('');
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    await sendPrivateMessage({
      variables: {
        privateMessage: {
          text,
          receiverUserId: user.userId
        }
      }
    });

    setText('');
  }

  return (
    <>
      {relationshipType === 'friend' && (
        <Form onSubmit={handleSubmit} className="flex gap-2 flex-row">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a private message"
            className='flex-grow'
          />
          <Button type="submit">Send</Button>
        </Form>
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
