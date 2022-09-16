import React, { useEffect } from 'react';
import { useQuery, gql, useLazyQuery } from '@apollo/client';
import { Message } from './Message';
import { cache } from '../index';

const POST_QUERY = gql`
  query GetMessage($messageId: ID!) {
    message(messageId: $messageId) {
      ...Message
      group {
        groupId
      }

      responseTree {
        ...Message
      }
    }
  }

  ${Message.fragments.message}
`;

const MESSAGE_QUERY = gql`
  query GetMessage($messageId: ID!) {
    message(messageId: $messageId) {
      ...Message
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

  const [getMessage] = useLazyQuery(MESSAGE_QUERY);

  useEffect(() => {
    if (loading || error) return;

    subscribeToMore({
      document: gql`
        subscription OnMessageAdded($groupId: ID!) {
          messageAdded(groupId: $groupId)
        }
      `,
      variables: {
        groupId: data.message.group.groupId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        getMessage({
          variables: {
            messageId: subscriptionData.data.messageAdded,
          },
          onCompleted: (data) => {
            // push message to apollo cache in responseTree

            const { message } = data;
            const { responseTree } = prev.message;
            const newResponseTree = [...responseTree, message];
            cache.writeQuery({
              query: POST_QUERY,
              variables: {
                messageId,
              },
              data: {
                message: {
                  ...prev.message,
                  responseTree: newResponseTree,
                },
              },
            });
          },
        });

        return prev;
      },
    });
  }, [loading, error, data, subscribeToMore, getMessage, messageId]);

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
