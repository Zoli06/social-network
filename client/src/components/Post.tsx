import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Message } from './Message';

const POST_QUERY = gql`
  query GetMessage($messageId: ID!) {
    message(messageId: $messageId) {
      ...Message

      responseTree {
        ...Message
      }
    }
  }

  ${Message.fragments.message}
`;

export function Post({ messageId }: { messageId: string }) {
  const { data, loading, error, subscribeToMore } = useQuery(POST_QUERY, {
    variables: {
      messageId,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.log(error);
    return <div>Error!</div>;
  }

  return (
    <Message
      messageData={data.message}
      responseTree={data.message.responseTree}
      subscribeToMore={subscribeToMore}
      className='root-message'
    />
  );
}
