import React, { useEffect, useState } from 'react';
import './MessageActions.scss';
import { gql, useMutation } from '@apollo/client';
import Twemoji from 'react-twemoji';
import { v4 as uuidv4 } from 'uuid';

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
  upVotes,
  downVotes,
  responsesCount,
  messageId,
  myVote,
  reactions,
  subscribeToMore,
}: {
  upVotes: number;
  downVotes: number;
  responsesCount: number;
  messageId: string;
  myVote: string | null;
  reactions: {
    type: number;
  }[];
  subscribeToMore: any;
}) => {
  const [
    voteMutation,
    {
      data: voteMutationData,
      loading: voteMutationLoading,
      error: voteMutationError,
    },
  ] = useMutation(VOTE_MUTATION, {
    update(cache, { data: { createVote } }) {
      cache.modify({
        id: cache.identify({ __typename: 'Message', messageId }),
        fields: {
          vote: () => createVote,
        },
      })
      
    },
  });
  const [
    reactionMutation,
    {
      data: reactionMutationData,
      loading: reactionMutationLoading,
      error: reactionMutationError,
    },
  ] = useMutation(REACTION_MUTATION);

  useEffect(() => {
    subscribeToMore({
      document: MESSAGE_VOTED_SUBSCRIPTION,
      variables: {
        messageId,
      },
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev;
        const { messageVoted } = subscriptionData.data;
        return {
          ...prev,
          message: {
            ...prev.message,
            upVotes: messageVoted.upVotes,
            downVotes: messageVoted.downVotes,
          },
        };
      },
    });

    subscribeToMore({
      document: MESSAGE_REACTED_SUBSCRIPTION,
      variables: {
        messageId,
      },
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev;
        const { messageReacted } = subscriptionData.data;
        return {
          ...prev,
          message: {
            ...prev.message,
            reactions: messageReacted,
          },
        };
      },
    });
  }, []);

  const possibleReactions = ['👍', '❤', '🥰', '🤣', '😲', '😢', '😠'];

  const handleVote = (type: string | null) => {
    if (myVote === type) type = null;
    voteMutation({ variables: { messageId, type } });
  };

  const handleAddReaction = (type: string) => {
    reactionMutation({ variables: { messageId, type: type.codePointAt(0) } });
  };

  return (
    <div className='message-actions'>
      <svg className={`upvote icon ${myVote === 'up' ? 'active' : ''}`} onClick={() => handleVote('up')}>
        <use
          href={`./assets/images/svg-bundle.svg#upvote${
            myVote === 'up' ? '_active' : ''
          }`}
        />
      </svg>
      <p className='upvote-count'>{upVotes}</p>
      <svg className={`downvote icon ${myVote === 'down' ? 'active' : ''}`} onClick={() => handleVote('down')}>
      <use
          href={`./assets/images/svg-bundle.svg#downvote${
            myVote === 'down' ? '_active' : ''
          }`}
        />
      </svg>
      <p className='downvote-count'>{downVotes}</p>
      <svg className='response icon'>
        <use href='./assets/images/svg-bundle.svg#response' />
      </svg>
      <p className='responses-count'>{responsesCount}</p>
      <div className='reactions-container'>
        <div className='common-reactions'>
          <Twemoji options={{ className: 'reaction-emoji' }} noWrapper>
            {[...new Set(reactions.map((reaction) => reaction.type))].map(
              (reactionType) => (
                <div className='common-reaction-emoji' key={uuidv4()}>
                  {String.fromCodePoint(reactionType)}
                </div>
              )
            )}
          </Twemoji>
        </div>
        <div className='add-reaction-container'>
          <div className='add-reaction-button'>
            <div className='space-holder' />
            <svg className='add-reaction-icon icon'>
              <use href='./assets/images/svg-bundle.svg#plus' />
            </svg>
          </div>
          <div className='add-reaction-popup'>
            <Twemoji
              options={{ className: 'add-reaction-popup-emoji' }}
              noWrapper
            >
              {possibleReactions.map((reaction) => (
                <span
                  key={uuidv4()}
                  onClick={() => handleAddReaction(reaction)}
                >
                  {reaction}
                </span>
              ))}
            </Twemoji>
          </div>
        </div>
      </div>
    </div>
  );
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
    }
  `,
};
