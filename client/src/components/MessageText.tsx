import React from 'react';
import './MessageText.scss';
import { gql } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { GroupQueryResultContext } from './Group';

export const MessageText = ({ messageId }: MessageTextProps) => {
  const { group: { messages } } = React.useContext(GroupQueryResultContext)!;
  const { text } = messages.find((message) => message.messageId === messageId)!;

  return (
    <div className='message-text-container'>
      <ReactMarkdown className='message-text' children={text} remarkPlugins={[remarkGfm]} />
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

export type MessageTextGQLData = {
  text: string;
}

export type MessageTextProps = {
  messageId: string;
}
