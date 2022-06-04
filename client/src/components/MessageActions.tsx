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
}: {
  upVotes: number;
  downVotes: number;
  responsesCount: number;
  messageId: string;
}) => {
  // TODO: get current vote from server
  const [myVoteType, setMyVoteType] = useState<string | null>(null);
  const [voteMutation, { data, loading, error }] = useMutation(VOTE_MUTATION);

  const handleVote = (type: string | null) => {
    if (myVoteType === type) type = null;
    voteMutation({ variables: { messageId, type } });
    setMyVoteType(type);
  };

  return (
    <div className='message-actions'>
      <div className='upvote icon' onClick={() => handleVote('up')}/>
      <p className='upvote-count'>{upVotes}</p>
      <div className='downvote icon' onClick={() => handleVote('down')}/>
      <p className='downvote-count'>{downVotes}</p>
      <div className='response icon' />
      <p className='responses-count'>{responsesCount}</p>
    </div>
  );
};
