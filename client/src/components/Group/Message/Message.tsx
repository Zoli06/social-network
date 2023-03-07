import { gql } from '@apollo/client';
import { Editor, EditorGQLData } from '../../Editor/Editor';
import { MessageAuthor, MessageAuthorGQLData } from './MessageAuthor';
import { MessageModify, MessageModifyGQLData } from './MessageModify';
import { MessageText, MessageTextGQLData } from './MessageText';
import { MessageActions, MessageActionsGQLData } from './MessageActions';
import { useState } from 'react';

// If messages is provided, message responses will be rendered
export const Message = ({
  message,
  messages,
  subscribeToMore,
  currentDepth,
  maxDepth,
  queriedDepth,
  maxDisplayedResponses,
}: MessageProps) => {
  const [currentMaxDepth, setCurrentMaxDepth] = useState(maxDepth);
  const [currentMaxDisplayedResponses, setCurrentMaxDisplayedResponses] =
    useState(maxDisplayedResponses);

  return (
    <div
      className={`flex flex-col gap-4 w-full ${
        currentDepth === 0 ? 'mb-4 rounded-lg' : ''
      }`}
    >
      <div>
        <div className='flex gap-4 items-center justify-between'>
          <MessageAuthor user={message.author} />
          <MessageModify message={message} />
        </div>
        <MessageText message={message} />
        <MessageActions message={message} subscribeToMore={subscribeToMore} />
      </div>
      {messages &&
        (() => {
          if (currentDepth < currentMaxDepth) {
            let displayedResponses = [];
            let willRenderMoreButton = false;
            for (let _message of messages) {
              if (_message.responseTo?.messageId === message.messageId) {
                if (displayedResponses.length >= currentMaxDisplayedResponses) {
                  willRenderMoreButton = true;
                  break;
                }
                displayedResponses.push(
                  <Message
                    message={_message}
                    messages={messages}
                    key={_message.messageId}
                    subscribeToMore={subscribeToMore}
                    currentDepth={currentDepth + 1}
                    maxDepth={currentMaxDepth}
                    queriedDepth={queriedDepth}
                    maxDisplayedResponses={maxDisplayedResponses}
                  />
                );
              }
            }

            return (
              <div className='flex flex-col gap-4 border-l dark:border-white/20 border-black/20 pl-4'>
                {displayedResponses}
                {willRenderMoreButton && (
                  <div
                    className='text-blue-500 cursor-pointer'
                    onClick={() =>
                      setCurrentMaxDisplayedResponses(
                        currentMaxDisplayedResponses + 2
                      )
                    }
                  >
                    Show more
                  </div>
                )}
              </div>
            );
          } else if (
            currentDepth >= currentMaxDepth &&
            currentDepth < queriedDepth &&
            message.responsesCount > 0
          ) {
            return (
              <div className='flex flex-col gap-4 border-l dark:border-white/20 border-black/20 pl-4'>
                <div
                  className='text-blue-500 cursor-pointer'
                  onClick={() => setCurrentMaxDepth(currentMaxDepth + 1)}
                >
                  Show more
                </div>
              </div>
            );
          } else if (message.responsesCount > 0) {
            return (
              <a
                className='text-blue-500 cursor-pointer border-l dark:border-white/20 border-black/20 pl-4'
                href={`/group/${message.group.groupId}/message/${message.messageId}`}
              >
                Continue this thread
              </a>
            );
          }
        })()}
    </div>
  );
};

Message.fragments = {
  message: gql`
    fragment Message on Message {
      messageId
      group {
        groupId
      }
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
      responsesCount
      createdAt
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
    messageId: string;
    group: {
      groupId: string;
    };
    responseTo?: { messageId: string };
    responsesCount: number;
    author: MessageAuthorGQLData;
    createdAt: number;
  };

export type MessageProps = {
  message: MessageGQLData;
  messages?: MessageGQLData[];
  subscribeToMore: Function;
  currentDepth: number;
  maxDepth: number;
  queriedDepth: number;
  maxDisplayedResponses: number;
};