import React from 'react';
import './MessageActions.scss';

export const MessageActions = ({
  upVotes,
  downVotes,
  responsesCount,
}: {
  upVotes: number;
  downVotes: number;
  responsesCount: number;
}) => {
  return (
    <div className='message-actions'>
      <div className='upvote icon' />
      <p className='upvote-count'>{upVotes}</p>
      <div className='downvote icon' />
      <p className='downvote-count'>{downVotes}</p>
      <div className='response icon' />
      <p className='responses-count'>{downVotes}</p>
    </div>
  );
};
