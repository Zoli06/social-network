// god help me

import { gql } from '@apollo/client';
import { Artboard } from 'react-daisyui';
import { Message, MessageGQLData } from './Message';

export const Messages = ({
  messages,
  subscribeToMore,
  maxDepth = 2,
  onlyInterestedInMessageId: _onlyInterestedInMessageId = null,
  queriedDepth,
  maxDisplayedResponses,
  renderedFromSearch = false,
}: MessagesProps) => {
  const onlyInterestedInMessageId = _onlyInterestedInMessageId || null;

  const rootMessages = messages.filter((message) =>
    onlyInterestedInMessageId
      ? message.messageId === onlyInterestedInMessageId
      : !messages.some(
          ({ messageId }) => messageId === message.responseTo?.messageId
        )
  );

  return (
    <div>
      {renderedFromSearch ? (
        <div className='flex flex-col gap-4'>
          {rootMessages.map((message) => (
            <a
              href={`/group/${message.group.groupId}/message/${message.messageId}`}
            >
              <Artboard className='rounded-md cursor-pointer p-4 flex gap-2 w-96'>
                <Message
                  key={message.messageId}
                  messages={messages}
                  messageId={message.messageId}
                  subscribeToMore={subscribeToMore}
                  currentDepth={0}
                  maxDepth={maxDepth}
                  queriedDepth={queriedDepth}
                  maxDisplayedResponses={maxDisplayedResponses}
                  renderedFromSearch={renderedFromSearch}
                />
              </Artboard>
            </a>
          ))}
        </div>
      ) : (
        rootMessages.map((message) => (
          <Message
            key={message.messageId}
            messages={messages}
            messageId={message.messageId}
            subscribeToMore={subscribeToMore}
            currentDepth={0}
            maxDepth={maxDepth}
            queriedDepth={queriedDepth}
            maxDisplayedResponses={maxDisplayedResponses}
            renderedFromSearch={renderedFromSearch}
          />
        ))
      )}
    </div>
  );
};

Messages.fragments = {
  message: gql`
    fragment Messages on Message {
      messageId
      group {
        groupId
      }
      ...Message
    }

    ${Message.fragments.message}
  `,
};

export type MessagesGQLData = {
  messageId: string;
  group: {
    groupId: string;
  };
} & MessageGQLData;

export type MessagesProps = {
  messages: MessagesGQLData[];
  subscribeToMore: Function;
  onlyInterestedInMessageId?: string | null;
  queriedDepth: number;
  maxDepth: number;
  maxDisplayedResponses: number;
  renderedFromSearch?: boolean;
};
