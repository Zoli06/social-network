import React from 'react';
import './MessageText.scss';
import { gql } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MessageText = ({ text }: IMessageTextProps) => {
  return (
    <div className='message-text-container'>
      <ReactMarkdown className='message-text' children={text} remarkPlugins={[remarkGfm]}/>
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
