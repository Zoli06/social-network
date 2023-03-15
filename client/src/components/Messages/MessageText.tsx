import { gql } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MessageText = ({ message: { text } }: MessageTextProps) => {
  return (
    <div className='min-h-8 flex items-center flex-wrap overflow-scroll'>
      <ReactMarkdown
        children={text}
        remarkPlugins={[remarkGfm]}
      />
    </div>
  );
};

MessageText.fragments = {
  message: gql`
    fragment MessageText on Message {
      messageId
      text
    }
  `,
};

export type MessageTextGQLData = {
  messageId: string;
  text: string;
};

type MessageTextProps = {
  message: MessageTextGQLData;
};
