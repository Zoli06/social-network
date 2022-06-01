import React from 'react';
import './MessageActions.scss';

export const MessageActions = () => {
  return (
    <div className='message-actions'>
      <div className='upvote icon' />
      <div className='downvote icon' />
      <div className='comment icon' />
    </div>
  );
};
