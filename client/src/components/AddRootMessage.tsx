import { useContext } from "react";
import { gql } from "@apollo/client";
import "./AddRootMessage.scss";
import { openEditor, EditorActions } from "./Editor";
import { GroupQueryResultContext } from "./Group";

export const AddRootMessage = () => {
  const {
    group: { groupId },
  } = useContext(GroupQueryResultContext)!;

  return (
    <div className="add-root-message">
      <svg onClick={() => openEditor(null, groupId, EditorActions.ADD)}>
        <use href="./assets/images/svg-bundle.svg#plus" />
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
