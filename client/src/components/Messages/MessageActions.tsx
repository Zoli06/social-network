import { useEffect, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { openEditor } from '../Editor/Editor';
import { GroupQueryGQLData } from '../Group/Group';
import { SvgButton } from '../../utilities/SvgButton';
import { EmojiButton } from '../../utilities/EmojiButton';
import { cache } from '../..';

const ADD_RESPONSE_MUTATION = gql`
  mutation AddResponseMutation($message: MessageInput!) {
    sendMessage(message: $message) {
      messageId
    }
  }
`;

const VOTE_MUTATION = gql`
  mutation VoteMutation($messageId: ID!, $type: VoteType) {
    createVote(messageId: $messageId, type: $type)
  }
`;

const REACTION_MUTATION = gql`
  mutation ReactionMutation($messageId: ID!, $type: Int) {
    createReaction(messageId: $messageId, type: $type) {
      type
    }
  }
`;

const MESSAGE_VOTED_SUBSCRIPTION = gql`
  subscription MessageVoted($messageId: ID!) {
    messageVoted(messageId: $messageId) {
      upVotes
      downVotes
    }
  }
`;

const MESSAGE_REACTED_SUBSCRIPTION = gql`
  subscription MessageReacted($messageId: ID!) {
    messageReacted(messageId: $messageId) {
      type
    }
  }
`;

export const MessageActions = ({
  message: {
    messageId,
    upVotes,
    downVotes,
    responsesCount,
    vote,
    reactions,
    reaction,
    group: { groupId },
  },
  subscribeToMore,
}: MessageActionsProps) => {
  const [displayReactions, setDisplayReactions] = useState(false);
  let hideReactionsTimeout: NodeJS.Timeout;

  const [voteMutation] = useMutation(VOTE_MUTATION, {
    update(cache, { data: { createVote } }) {
      cache.modify({
        id: cache.identify({ __typename: 'Message', messageId }),
        fields: {
          vote: () => createVote,
        },
      });
    },
  });

  const [reactionMutation] = useMutation(REACTION_MUTATION, {
    update(cache, { data: { createReaction } }) {
      cache.modify({
        id: cache.identify({ __typename: 'Message', messageId }),
        fields: {
          reaction: () => createReaction,
        },
      });
    },
  });

  const [addResponseMutation] = useMutation(ADD_RESPONSE_MUTATION);

  useEffect(() => {
    subscribeToMore({
      document: MESSAGE_VOTED_SUBSCRIPTION,
      variables: {
        messageId,
      },
      updateQuery: (
        prev: GroupQueryGQLData,
        { subscriptionData }: MessageVotedSubscriptionData
      ) => {
        if (!subscriptionData.data) return prev;
        const { messageVoted } = subscriptionData.data;

        // this was the old code
        // it only works in the group page

        // return {
        //   ...prev,
        //   group: {
        //     ...prev.group,
        //     messages: prev.group.messages.map((message: MessagesGQLData) => {
        //       if (message.messageId === messageId) {
        //         return {
        //           ...message,
        //           upVotes: messageVoted.upVotes,
        //           downVotes: messageVoted.downVotes,
        //         };
        //       } else {
        //         return message;
        //       }
        //     }),
        //   },
        // };

        // We don't know where the message is in the cache, so we have to find it in the prev object
        cache.modify({
          id: cache.identify({ __typename: 'Message', messageId }),
          fields: {
            upVotes: () => messageVoted.upVotes,
            downVotes: () => messageVoted.downVotes,
          }
        })

        // idk why it doesn't overwrite the cache
        // and it not just works but it resolves a bug where the upvotes and downvotes don't update on the home page
        return null;
      },
    });

    subscribeToMore({
      document: MESSAGE_REACTED_SUBSCRIPTION,
      variables: {
        messageId,
      },
      updateQuery: (
        prev: GroupQueryGQLData,
        { subscriptionData }: MessageReactedSubscriptionData
      ) => {
        if (!subscriptionData.data) return prev;
        const { messageReacted } = subscriptionData.data;

        cache.modify({
          id: cache.identify({ __typename: 'Message', messageId }),
          fields: {
            reactions: () => messageReacted,
          }
        })

        return null;
      },
    });
  }, [subscribeToMore, messageId]);

  const possibleReactions = ['👍', '❤', '🥰', '🤣', '😲', '😢', '😠'];

  const handleVote = (newVote: string | null) => {
    if (vote === newVote) newVote = null;
    voteMutation({ variables: { messageId, type: newVote } });
  };

  const handleAddReaction = (newVote: string | null) => {
    reactionMutation({
      variables: { messageId, type: newVote ? newVote.codePointAt(0) : null },
    });
  };

  const handleAddResponse = (text: string) => {
    addResponseMutation({
      variables: {
        message: {
          text,
          responseToMessageId: messageId,
          groupId,
        },
      },
    });
  };

  return (
    <div className='flex flex-row items-center'>
      <div className='flex flex-row items-center gap-4'>
        <SvgButton
          onClick={() => handleVote('up')}
          icon={`upvote${vote === 'up' ? '-active' : ''}`}
          customClass={vote === 'up' ? '!fill-red-500' : undefined}
        />
        <p>{upVotes}</p>
        <SvgButton
          onClick={() => handleVote('down')}
          icon={`downvote${vote === 'down' ? '-active' : ''}`}
          customClass={vote === 'down' ? '!fill-blue-500' : undefined}
        />
        <p>{downVotes}</p>
        <SvgButton onClick={() => openEditor(handleAddResponse)} icon='response' />
        <p>{responsesCount}</p>
      </div>

      <div className='flex flex-row items-center gap-4 ml-auto'>
        <EmojiButton.Wrapper>
          <div>
            {[...new Set(reactions.map((reaction) => reaction.type))]
              .slice(0, 2)
              .map((reactionType) => (
                <EmojiButton
                  key={uuidv4()}
                  onClick={() =>
                    handleAddReaction(String.fromCodePoint(reactionType))
                  }
                  emoji={String.fromCodePoint(reactionType)}
                  customClass='ml-[-1vmin] cursor-default'
                />
              ))}
          </div>
        </EmojiButton.Wrapper>
        <div className='relative' onMouseOver={() => {
          clearTimeout(hideReactionsTimeout);
          setDisplayReactions(true);
        }} onMouseLeave={() => {
          clearTimeout(hideReactionsTimeout);
          hideReactionsTimeout = setTimeout(() => setDisplayReactions(false), 1000);
        }}>
          <div className='flex flex-row items-center justify-center'>
            {reaction ? (
              <EmojiButton.Wrapper>
                <EmojiButton emoji={String.fromCodePoint(reaction.type)} />
              </EmojiButton.Wrapper>
            ) : (
              <SvgButton icon='plus' />
            )}
          </div>
          <EmojiButton.Wrapper>
            <div className={`flex-row items-center justify-center absolute w-fit top-[-4rem] gap-2 right-0 dark:bg-gray-800 bg-gray-100 rounded-md p-2 shadow-md ${displayReactions ? 'flex' : 'hidden'}`}>
              {possibleReactions.map((reaction) => (
                <EmojiButton
                  key={uuidv4()}
                  onClick={() => handleAddReaction(reaction)}
                  emoji={reaction}
                  customClass='transform hover:scale-125 transition-transform duration-200'
                />
              ))}
              {reaction && (
                <SvgButton
                  icon='close-button-3'
                  onClick={() => handleAddReaction(null)}
                />
              )}
            </div>
          </EmojiButton.Wrapper>
        </div>
      </div>
    </div>
  );
};

type MessageVotedSubscriptionData = {
  subscriptionData: {
    data: { messageVoted: { upVotes: number; downVotes: number } };
  };
};

type MessageReactedSubscriptionData = {
  subscriptionData: {
    data: { messageReacted: number };
  };
};

MessageActions.fragments = {
  message: gql`
    fragment MessageActions on Message {
      upVotes
      downVotes
      responsesCount
      vote
      reactions {
        type
      }
      reaction {
        type
      }
      group {
        groupId
      }
    }
  `,
};

export type MessageActionsGQLData = {
  upVotes: number;
  downVotes: number;
  responsesCount: number;
  messageId: string;
  vote: string;
  reactions: {
    type: number;
  }[];
  reaction: {
    type: number;
  } | null;
  group: {
    groupId: string;
  };
};

type MessageActionsProps = {
  message: MessageActionsGQLData;
  subscribeToMore: Function;
};
