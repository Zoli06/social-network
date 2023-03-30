import { useContext } from 'react';
import { gql, useMutation } from '@apollo/client';
import { openEditor } from '../Editor/Editor';
import { UserContext } from '../../App';
import { SvgButton } from '../../utilities/SvgButton';

const EDIT_PRIVATE_MESSAGE_MUTATION = gql`
  mutation EditPrivateMessageMutation(
    $privateMessage: PrivateMessageEditInput!
  ) {
    editPrivateMessage(privateMessage: $privateMessage) {
      privateMessageId
      text
      isDeleted
      createdAt
      updatedAt
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
      cache.modify({
        id: cache.identify(privateMessage),
        fields: {
          text() {
            return editedPrivateMessage.text;
          },
          updatedAt() {
            return editedPrivateMessage.updatedAt;
          },
        },
      });
    },
  });
  const [deletePrivateMessage] = useMutation(DELETE_PRIVATE_MESSAGE_MUTATION, {
    update(cache) {
      cache.modify({
        id: cache.identify(privateMessage),
        fields: {
          isDeleted() {
            return true;
          }
        },
      });
    },
  });

  const { userId } = useContext(UserContext)!;

  // TODO: show icons instead text
  return (
    <div className='flex gap-2'>
      {privateMessage.senderUser.userId === userId && (
        <>
          <SvgButton
            onClick={() => {
              deletePrivateMessage({
                variables: {
                  privateMessageId: privateMessage.privateMessageId,
                },
              });
            }}
            icon='delete'
            customClass='!h-5 !w-5'
          />
          <SvgButton
            onClick={() => {
              openEditor(
                (text: string) => {
                  editPrivateMessage({
                    variables: {
                      privateMessage: {
                        privateMessageId: privateMessage.privateMessageId,
                        text,
                      },
                    },
                  });
                },
                privateMessage.text,
                false
              );
            }}
            icon='edit'
            customClass='!h-5 !w-5'
          />
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
      isDeleted
      senderUser {
        userId
      }
    }
  `,
};

export type PrivateMessageActionsGQLData = {
  privateMessageId: string;
  text: string;
  isDeleted: boolean;
  senderUser: {
    userId: string;
  };
};

type PrivateMessageActionsProps = {
  privateMessage: PrivateMessageActionsGQLData;
};
