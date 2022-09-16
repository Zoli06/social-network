import React from 'react';
import './MessageModify.scss';

export const MessageModify = (messageId: string) => {
  return (
    <div className='message-modify'>
      <svg className='message-edit icon'>
        <use href='./assets/images/svg-bundle.svg#edit' />
      </svg>
      <svg className='message-delete icon'>
      <use href='./assets/images/svg-bundle.svg#delete' />
      </svg>
    </div>
  )
}
