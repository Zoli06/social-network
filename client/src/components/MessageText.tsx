import React from 'react';
import './MessageText.scss';
import { gql } from '@apollo/client';

export const MessageText = ({ text }: IMessageTextProps) => {
  return (
    <div className='message-text-container'>
      <p className='message-text'>{text}</p>
    </div>
  );
};

MessageText.fragments = {
  message: gql`
    fragment MessageText on Message {
      text
    }
  `,
};

export interface IMessageTextGQLData {
  text: string;
}

export interface IMessageTextProps extends IMessageTextGQLData {}
