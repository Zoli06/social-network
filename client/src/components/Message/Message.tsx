import React from "react";
import "./Message.scss";
import { gql } from "@apollo/client";
import { MessageAuthor } from "./MessageAuthor";
import { MessageModify } from "./MessageModify";
import { MessageText } from "./MessageText";
import { MessageActions } from "./MessageActions";
import { Editor } from "../Editor/Editor";
import { MessagesContext } from "./MessagesWrapper";

import { MessageAuthorGQLData } from "./MessageAuthor";
import { MessageTextGQLData } from "./MessageText";
import { MessageModifyGQLData } from "./MessageModify";
import { MessageActionsGQLData } from "./MessageActions";
import { EditorGQLData } from "../Editor/Editor";

export function Message({
  messageId,
  subscribeToMore,
  className = "",
}: MessageProps) {
  const messages = React.useContext(MessagesContext)!;

  return (
    <div className={`message-container ${className}`}>
      <div className="message-content">
        <div className="message-header">
          <MessageAuthor messageId={messageId} />
          <MessageModify messageId={messageId} />
        </div>
        <MessageText messageId={messageId} />
        <MessageActions
          messageId={messageId}
          subscribeToMore={subscribeToMore}
        />
      </div>
      <div className="response-tree">
        {messages.map(
          (message: MessageGQLData) =>
            message.responseTo?.messageId === messageId && (
              <Message
                messageId={message.messageId}
                key={message.messageId}
                subscribeToMore={subscribeToMore}
              />
            )
        )}
      </div>
    </div>
  );
}

Message.fragments = {
  message: gql`
    fragment Message on Message {
      messageId
      author {
        ...MessageAuthor
      }
      ...AddResponse
      ...MessageActions
      ...MessageText
      ...MessageModify

      responseTo {
        messageId
      }
    }

    ${MessageActions.fragments.message}
    ${MessageAuthor.fragments.user}
    ${MessageText.fragments.message}
    ${Editor.fragments.message}
    ${MessageModify.fragments.message}
  `,
};

export type MessageGQLData = MessageAuthorGQLData &
  MessageTextGQLData &
  MessageModifyGQLData &
  MessageActionsGQLData &
  EditorGQLData & {
    responseTo?: { messageId: string };
  };

export type MessageProps = {
  messageId: string;
  subscribeToMore: Function;
  className?: string;
};
