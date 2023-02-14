import React, { useContext } from 'react';
import { gql, useMutation } from '@apollo/client';
import { openEditor } from '../Editor/Editor';
import { UserContext } from '../../App';

const EDIT_PRIVATE_MESSAGE_MUTATION = gql`
  mutation EditPrivateMessageMutation(
    $privateMessage: PrivateMessageEditInput!
  ) {
    editPrivateMessage(privateMessage: $privateMessage) {
      privateMessageId
      text
      createdAt
    }
  }
`;

const DELETE_PRIVATE_MESSAGE_MUTATION = gql`
  mutation DeletePrivateMessageMutation($privateMessageId: ID!) {
    deletePrivateMessage(privateMessageId: $privateMessageId)
  }
`;

export const PrivateMessageActions = ({
  privateMessage,
}: PrivateMessageActionsProps) => {
  const [editPrivateMessage] = useMutation(EDIT_PRIVATE_MESSAGE_MUTATION, {
    update(cache, { data: { editPrivateMessage: editedPrivateMessage } }) {
      console.log(cache.identify(privateMessage));
      cache.modify({
        id: cache.identify(privateMessage),
        fields: {
          text() {
            return editedPrivateMessage.text;
          },
        },
      });
    },
  });
  const [deletePrivateMessage] = useMutation(DELETE_PRIVATE_MESSAGE_MUTATION, {
    update(cache) {
      cache.evict({ id: cache.identify(privateMessage) });
    },
  });

  console.log(privateMessage)

  const { userId } = useContext(UserContext)!;

  return (
    <div>
      {privateMessage.senderUser.userId === userId && (
        <>
          <button
            onClick={() => {
              openEditor((text: string) => {
                editPrivateMessage({
                  variables: {
                    privateMessage: {
                      privateMessageId: privateMessage.privateMessageId,
                      text,
                    },
                  },
                });
              }, privateMessage.text);
            }}
          >
            Edit
          </button>
          <button
            onClick={() => {
              deletePrivateMessage({
                variables: {
                  privateMessageId: privateMessage.privateMessageId,
                },
              });
            }}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
};

PrivateMessageActions.fragments = {
  privateMessage: gql`
    fragment PrivateMessageActions on PrivateMessage {
      privateMessageId
      text
      senderUser {
        userId
      }
    }
  `,
};

export type PrivateMessageActionsGQLData = {
  privateMessageId: string;
  text: string;
  senderUser: {
    userId: string;
  };
};

type PrivateMessageActionsProps = {
  privateMessage: PrivateMessageActionsGQLData;
};
