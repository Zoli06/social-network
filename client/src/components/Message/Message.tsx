import './Message.scss';
import { gql } from '@apollo/client';
import { Editor, EditorGQLData } from '../Editor/Editor';
import { MessageAuthor, MessageAuthorGQLData } from './MessageAuthor';
import { MessageModify, MessageModifyGQLData } from './MessageModify';
import { MessageText, MessageTextGQLData } from './MessageText';
import { MessageActions, MessageActionsGQLData } from './MessageActions';

// If messages is provided, message responses will be rendered
export function Message({
  message,
  messages,
  subscribeToMore,
  className = '',
}: MessageProps) {
  return (
    <div className={`message-container ${className}`}>
      <div className='message-content'>
        <div className='message-header'>
          <MessageAuthor user={message.author} />
          <MessageModify message={message} />
        </div>
        <MessageText message={message} />
        <MessageActions message={message} subscribeToMore={subscribeToMore} />
      </div>
      {messages && (
        <div className='response-tree'>
          {messages.map(
            (_message: MessageGQLData) =>
              _message.responseTo?.messageId === message.messageId && (
                <Message
                  message={_message}
                  messages={messages}
                  key={_message.messageId}
                  subscribeToMore={subscribeToMore}
                />
              )
          )}
        </div>
      )}
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

export type MessageGQLData = MessageTextGQLData &
  MessageModifyGQLData &
  MessageActionsGQLData &
  EditorGQLData & {
    responseTo?: { messageId: string };
  } & {
    author: MessageAuthorGQLData;
  };

export type MessageProps = {
  message: MessageGQLData;
  messages?: MessageGQLData[];
  subscribeToMore: Function;
  className?: string;
};
