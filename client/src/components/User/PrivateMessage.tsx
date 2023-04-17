import { gql } from '@apollo/client';
import { useContext } from 'react';
import { ChatBubble } from 'react-daisyui';
import { UserContext } from '../../App';
import {
  PrivateMessageActions,
  PrivateMessageActionsGQLData,
} from './PrivateMessageActions';

export const PrivateMessage = ({
  privateMessage,
  privateMessage: { text, createdAt, updatedAt, senderUser, isDeleted },
}: PrivateMessageProps) => {
  const { userId } = useContext(UserContext)!;
  const isMe = senderUser.userId === userId;

  return (
    <ChatBubble end={isMe}>
      <ChatBubble.Avatar
        src={
          senderUser.progileImage?.url ||
          '/assets/images/blank-profile-image.webp'
        }
      />
      <div className='flex items-center gap-2'>
        <div className={isMe && !isDeleted ? '' : 'hidden'}>
          <PrivateMessageActions privateMessage={privateMessage} />
        </div>
        <ChatBubble.Message
          color={isMe ? 'primary' : undefined}
          className='max-w-md'
        >
          {isDeleted ? <i>Message deleted</i> : text}
        </ChatBubble.Message>
      </div>
      <ChatBubble.Time>
        {(() => {
          const date = new Date(createdAt);
          const dateNow = new Date();
          const diff = dateNow.getTime() - date.getTime();
          const diffDays = Math.floor(diff / (1000 * 3600 * 24));
          const diffHours = Math.floor(diff / (1000 * 3600));
          const diffMinutes = Math.floor(diff / (1000 * 60));
          const diffSeconds = Math.floor(diff / 1000);

          if (diffDays > 0) {
            return `${diffDays} day(s) ago`;
          }
          if (diffHours > 0) {
            return `${diffHours} hour(s) ago`;
          }
          if (diffMinutes > 0) {
            return `${diffMinutes} minute(s) ago`;
          }
          if (diffSeconds > 0) {
            return `${diffSeconds} second(s) ago`;
          }
          return 'Now';
        })()}
        {updatedAt > createdAt && ' (edited)'}
      </ChatBubble.Time>
    </ChatBubble>
  );
};

PrivateMessage.fragments = {
  privateMessage: gql`
    fragment PrivateMessage on PrivateMessage {
      privateMessageId
      text
      createdAt
      updatedAt
      seenAt
      isDeleted
      senderUser {
        userId
        profileImage {
          mediaId
          url
        }
      }

      ...PrivateMessageActions
    }

    ${PrivateMessageActions.fragments.privateMessage}
  `,
};

export type PrivateMessageGQLData = {
  privateMessageId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  seenAt: string;
  isDeleted: boolean;
  senderUser: {
    userId: string;
    progileImage: {
      mediaId: string;
      url: string;
    };
  };
} & PrivateMessageActionsGQLData;

type PrivateMessageProps = {
  privateMessage: PrivateMessageGQLData;
};
