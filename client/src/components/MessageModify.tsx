import React from 'react';
import './MessageModify.scss';

export const MessageModify = ({ messageId }: IMessageModifyProps) => {
  return (
    <div className='message-modify'>
      <svg className='message-edit icon'>
        <use href='./assets/images/svg-bundle.svg#edit' />
      </svg>
      <svg className='message-delete icon'>
        <use href='./assets/images/svg-bundle.svg#delete' />
      </svg>
    </div>
  );
};

export interface IMessageModifyGQLData {
  messageId: string;
}

export interface IMessageModifyProps extends IMessageModifyGQLData {}
