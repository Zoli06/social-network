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

  const messageVotedUpdateFunc = (
    prev: any,
    { subscriptionData }: { subscriptionData: any },
    messageId: string
  ) => {
    if (!subscriptionData.data) return prev;
    const { messageVoted } = subscriptionData.data;
    if (prev.message.messageId === messageId) {
      return {
        ...prev,
        message: {
          ...prev.message,
          upVotes: messageVoted.upVotes,
          downVotes: messageVoted.downVotes,
        },
      };
    } else {
      return {
        ...prev,
        message: {
          ...prev.message,
          responseTree: prev.message.responseTree.map((message: any) => {
            if (message.messageId === messageId) {
              return {
                ...message,
                upVotes: messageVoted.upVotes,
                downVotes: messageVoted.downVotes,
              };
            } else {
              return message;
            }
          }),
        },
      };
    }
  };

  const messageReactedUpdateFunc = (
    prev: any,
    { subscriptionData }: { subscriptionData: any },
    messageId: string
  ) => {
    if (!subscriptionData.data) return prev;
    const { messageReacted } = subscriptionData.data;
    if (prev.message.messageId === messageId) {
      return {
        ...prev,
        message: {
          ...prev.message,
          reactions: messageReacted,
        },
      };
    } else {
      return {
        ...prev,
        message: {
          ...prev.message,
          responseTree: prev.message.responseTree.map((message: any) => {
            if (message.messageId === messageId) {
              return {
                ...message,
                reactions: messageReacted,
              };
            } else {
              return message;
            }
          }),
        },
      };
    }
  };

  return (
    <Message
      messageData={data.message}
      responseTree={data.message.responseTree}
      subscribeToMore={subscribeToMore}
      className='root-message'
      messageVotedUpdateFunc={messageVotedUpdateFunc}
      messageReactedUpdateFunc={messageReactedUpdateFunc}
    />
  );
}
