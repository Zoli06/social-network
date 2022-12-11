import { useContext } from "react";
import "./GroupInfos.scss";
import { GroupQueryResultContext } from "./Group";
import { gql, useMutation } from "@apollo/client";
import ReactMarkdown from "react-markdown";
import { openEditor } from "./Editor";
import remarkGfm from "remark-gfm";


const UPDATE_GROUP_MUTATION = gql`
  mutation UpdateGroup($group: GroupInput!, $groupId: ID!) {
    updateGroup(group: $group, groupId: $groupId) {
      groupId
      name
      description
      visibility
    }
  }
`;

const groupVisibilityOptions = [
  { value: "visible", label: "Visible to everyone" },
  { value: "hidden", label: "Only visible to members" },
];

export const GroupInfos = ({ className = "" }: GroupInfosProps) => {
  const {
    group: {
      groupId,
      name,
      description,
      visibility,
      createdAt,
      userRelationShipWithGroup: { type: userRelationShipWithGroupType },
    },
  } = useContext(GroupQueryResultContext)!;
  const [updateGroup] = useMutation(UPDATE_GROUP_MUTATION, {
    update(cache, { data: { updateGroup } }) {
      cache.modify({
        id: cache.identify({
          __typename: "Group",
          groupId,
        }),
        fields: {
          name: () => updateGroup.name,
          description: () => updateGroup.description,
          visibility: () => updateGroup.visibility,
        },
      });
    },
  });
  
  const isAdmin = userRelationShipWithGroupType === "admin";

  const renderVisibilityText = (visibility: string) => {
    return groupVisibilityOptions.find((option) => option.value === visibility)
      ?.label;
  };

  const handleEditDescription = (description: string) => {
    updateGroup({
      variables: {
        groupId,
        group: {
          name,
          description,
          visibility,
        },
      },
    });
  };

  return (
    <div className={`group-infos ${className}`}>
      <h2>Group Infos</h2>
      <div className="description">
          <h3>Description {isAdmin && (
            <svg
              className="message-edit icon"
              onClick={() => openEditor(handleEditDescription, description)}
            >
              <use href="/assets/images/svg-bundle.svg#edit" />
            </svg>
          )}</h3>
          
        <ReactMarkdown
          className="description-text"
          children={description}
          remarkPlugins={[remarkGfm]}
        />
      </div>
      <div className="visibility">
        <h3>Visibility</h3>
        {isAdmin ? (
          <select
            className="visibility-select"
            value={visibility}
            onChange={(e) => {
              updateGroup({
                variables: {
                  groupId,
                  group: {
                    name,
                    description,
                    visibility: e.target.value,
                  },
                },
              });
            }}
          >
            {groupVisibilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <p>{renderVisibilityText(visibility)}</p>
        )}
      </div>
      <div className="created-at">
        <h3>Created At</h3>
        <p>
          {new Date(createdAt).toLocaleDateString("en-us", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

GroupInfos.fragments = {
  group: gql`
    fragment GroupInfos on Group {
      groupId
      name
      description
      visibility
      createdAt

      userRelationShipWithGroup {
        type
      }
    }
  `,
};

export type GroupInfosGQLData = {
  groupId: string;
  name: string;
  description: string;
  visibility: string;
  createdAt: string;

  userRelationShipWithGroup: {
    type: string;
  };
};

export type GroupInfosProps = {
  className?: string;
};
