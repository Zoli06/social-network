import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { MessageAuthor } from './MessageAuthor';
import { MessageText } from './MessageText';
import { MessageActions } from './MessageActions';
import { Message } from './Message';

const POST_QUERY = gql`
  query GetMessage($messageId: ID!) {
    message(messageId: $messageId) {
      # responseTree {
      #   user {
      #     ...MessageAuthor
      #   }
      #   ...MessageActions
      #   ...MessageText
      #   responseTo {
      #     messageId
      #   }
      # }
      ...MessageData

      responseTree {
        ...MessageData
        responseTo {
          messageId
        }
      }
    }
  }

  fragment MessageData on Message {
    messageId
    user {
      ...MessageAuthor
    }
    ...MessageActions
    ...MessageText
  }

  ${MessageActions.fragments.message}
  ${MessageAuthor.fragments.user}
  ${MessageText.fragments.text}
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
    <Message messageData={data.message} responseTree={data.message.responseTree} subscribeToMore={subscribeToMore} />
  );
}
