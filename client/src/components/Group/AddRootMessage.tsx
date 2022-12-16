import { gql, useMutation } from "@apollo/client";
import "./AddRootMessage.scss";
import { openEditor } from "../Editor/Editor";

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
    <div className="add-root-message">
      <svg onClick={() => openEditor(handleAddRootMessage)}>
        <use href="/assets/images/svg-bundle.svg#plus" />
      </svg>
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
}
