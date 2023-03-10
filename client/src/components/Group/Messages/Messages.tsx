// god help me

import { gql } from '@apollo/client';
import { Message, MessageOnGroupGQLData } from './Message';

export const Messages = ({
  group,
  subscribeToMore,
  maxDepth = 2,
  onlyInterestedInMessageId: _onlyInterestedInMessageId = null,
  queriedDepth,
  maxDisplayedResponses,
}: MessagesProps) => {
  const onlyInterestedInMessageId = _onlyInterestedInMessageId || null;

  const rootMessages = group.messages.filter((message) =>
    onlyInterestedInMessageId
      ? message.messageId === onlyInterestedInMessageId
      : message.responseTo === null
  );

  return (
    <div>
      {rootMessages.map((message) => (
        <Message
          key={message.messageId}
          group={group}
          messageId={message.messageId}
          subscribeToMore={subscribeToMore}
          currentDepth={0}
          maxDepth={maxDepth}
          queriedDepth={queriedDepth}
          maxDisplayedResponses={maxDisplayedResponses}
        />
      ))}
    </div>
  );
};

Messages.fragments = {
  group: gql`
    fragment Messages on Group {
      groupId
      ...MessageOnGroup
    }

    ${Message.fragments.group}
  `,
};

export type MessagesGQLData = {
  groupId: string;
} & MessageOnGroupGQLData;

export type MessagesProps = {
  group: MessagesGQLData;
  subscribeToMore: Function;
  onlyInterestedInMessageId?: string | null;
  queriedDepth: number;
  maxDepth: number;
  maxDisplayedResponses: number;
};
