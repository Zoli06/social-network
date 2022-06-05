import React, { useEffect, useState } from 'react';
import './MessageActions.scss';
import { gql, useMutation } from '@apollo/client';

const VOTE_MUTATION = gql`
  mutation VoteMutation($messageId: ID!, $type: VoteType) {
    createVote(messageId: $messageId, type: $type)
  }
`;

export const MessageActions = ({
  upVotes,
  downVotes,
  responsesCount,
  messageId,
  myVote,
  reactions,
}: {
  upVotes: number;
  downVotes: number;
  responsesCount: number;
  messageId: string;
  myVote: string | null;
  reactions: {
    type: number;
  }[];
}) => {
  // TODO: get current vote from server
  const [myVoteType, setMyVoteType] = useState(myVote);
  const [voteMutation, { data, loading, error }] = useMutation(VOTE_MUTATION);

  useEffect(() => {
    console.log(myVoteType);
  }, [myVoteType]);

  const handleVote = (type: string | null) => {
    if (myVoteType === type) type = null;
    voteMutation({ variables: { messageId, type } });
    setMyVoteType(type);
  };

  return (
    <div className='message-actions'>
      <svg className='upvote icon' onClick={() => handleVote('up')}>
        <use href='./assets/images/svg-bundle.svg#upvote' />
      </svg>
      <p className='upvote-count'>{upVotes}</p>
      <svg className='downvote icon' onClick={() => handleVote('down')}>
        <use href='./assets/images/svg-bundle.svg#downvote' />
      </svg>
      <p className='downvote-count'>{downVotes}</p>
      <svg className='response icon'>
        <use href='./assets/images/svg-bundle.svg#response' />
      </svg>
      <p className='responses-count'>{responsesCount}</p>
      <div className='reactions-container'>
        {[...new Set(reactions.map(reaction => reaction.type))].map(
          reactionType => (
            <span className='reaction-emoji' dangerouslySetInnerHTML={{ __html: `&#${reactionType + 8986};` }} />
          )
        )}
      </div>
    </div>
  );
};
