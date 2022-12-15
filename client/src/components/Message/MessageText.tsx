import "./MessageText.scss";
import { gql } from "@apollo/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MessageText = ({ message: { text } }: MessageTextProps) => {
  return (
    <div className="message-text-container">
      <ReactMarkdown
        className="message-text"
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
