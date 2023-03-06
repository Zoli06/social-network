import { gql, useMutation } from '@apollo/client';
import { openEditor } from '../Editor/Editor';
import { SvgButton } from '../../utilities/SvgButton';

// TODO: Refactor this
// Same code is used in MessageActions.tsx
const ADD_ROOT_MESSAGE_MUTATION = gql`
  mutation AddRootMessageMutation($message: MessageInput!) {
    sendMessage(message: $message) {
      messageId
    }
  }
`;

export const AddRootMessage = ({ group }: AddRootMessageProps) => {
  const { groupId } = group;
  const [AddRootMessageMutation] = useMutation(ADD_ROOT_MESSAGE_MUTATION);

  const handleAddRootMessage = (text: string) => {
    AddRootMessageMutation({
      variables: {
        message: {
          text,
          groupId,
        },
      },
    });
  };

  return (
    <div className='fixed bottom-8 right-8 rounded-full border-2 border-transparent hover:border-green-500'>
      <SvgButton icon='plus' onClick={() => openEditor(handleAddRootMessage)} customClass='!w-20 !h-20 bg-white !fill-green-500 rounded-full' />
    </div>
  );
};

AddRootMessage.fragments = {
  group: gql`
    fragment AddRootMessage on Group {
      groupId
    }
  `,
};

export type AddRootMessageGQLData = {
  groupId: string;
};

type AddRootMessageProps = {
  group: AddRootMessageGQLData;
};
