import React from 'react';
import './Message.scss';
import { useQuery, gql } from '@apollo/client';
import { MessageAuthor } from './MessageAuthor';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';

const MESSAGE_QUERY = gql`
  query GetMessage($messageId: ID!) {
    message(messageId: $messageId) {
      messageId
      user {
        ...MessageAuthor
      }
      ...MessageActions
      ...MessageText
    }
  }
  ${MessageActions.fragments.message}
  ${MessageAuthor.fragments.user}
  ${MessageText.fragments.text}
`;

export const Message = ({ messageId }: { messageId: string }) => {
  const { data, loading, error, subscribeToMore } = useQuery(MESSAGE_QUERY, {
    variables: {
      messageId,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <>
      <div className='message-container'>
        <MessageAuthor user={data.message.user} />
        <MessageText text={data.message.text} />
        <MessageActions
          { ...data.message }
          subscribeToMore={subscribeToMore}
        />
      </div>
    </>
  );
};
