import { gql } from '@apollo/client';
import { useContext } from 'react';
import { ChatBubble } from 'react-daisyui';
import { UserContext } from '../../App';
import {
  PrivateMessageActions,
  PrivateMessageActionsGQLData
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
      <ChatBubble.Message color={isMe ? 'primary' : undefined}>
        {isDeleted ?
          <i>Message deleted</i> :
          text
        }
      </ChatBubble.Message>
      <div className='flex justify-end'>
        <PrivateMessageActions privateMessage={privateMessage} />
      </div>
      <ChatBubble.Footer>
        {
          (() => {
            const date = new Date(createdAt);
            const dateNow = new Date();
            const diff = dateNow.getTime() - date.getTime();
            const diffDays = Math.floor(diff / (1000 * 3600 * 24));
            const diffHours = Math.floor(diff / (1000 * 3600));
            const diffMinutes = Math.floor(diff / (1000 * 60));
            const diffSeconds = Math.floor(diff / 1000);

            if (diffDays > 0) {
              return `${diffDays} days ago`;
            }
            if (diffHours > 0) {
              return `${diffHours} hours ago`;
            }
            if (diffMinutes > 0) {
              return `${diffMinutes} minutes ago`;
            }
            if (diffSeconds > 0) {
              return `${diffSeconds} seconds ago`;
            }
          })()
        }
        {updatedAt > createdAt && ' (edited)'}
      </ChatBubble.Footer>
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
