import { gql } from '@apollo/client';
import { openEditor } from '../Editor/Editor';
import { useMutation } from '@apollo/client';
import { Select } from 'react-daisyui';
import { SvgButton } from '../../utilities/SvgButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  { value: 'visible', label: 'Visible to everyone' },
  { value: 'hidden', label: 'Only visible to members' },
];

export const GroupSettings = ({
  group: {
    groupId,
    name,
    description,
    visibility
  }
}: GroupSettingsProps) => {
  const [updateGroup] = useMutation(UPDATE_GROUP_MUTATION, {
    update(cache, { data: { updateGroup } }) {
      cache.modify({
        id: cache.identify({
          __typename: 'Group',
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

  const handleEditName = (name: string) => {
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
    <div>
      <div>
        <div className='flex justify-between items-start gap-2'>
          <div>
            <h2 className='text-lg font-bold'>Name</h2>
            <p>{name}</p>
          </div>
          <div>
            <SvgButton
              onClick={() => openEditor(handleEditName, name)}
              icon='edit'
            />
          </div>
        </div>
        <div className='flex justify-between items-start gap-2'>
          <div>
            <h2 className='text-lg font-bold'>Description</h2>
            <ReactMarkdown children={description} remarkPlugins={[remarkGfm]} />
          </div>
          <div>
            <SvgButton
              onClick={() => openEditor(handleEditDescription, description)}
              icon='edit'
            />
          </div>
        </div>
      </div>
      <div>
        <h2 className='text-lg font-bold'>Visibility</h2>
        <Select
          value={visibility}
          onChange={(visibility) => {
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
          }}
          className='w-full'
        >
          {groupVisibilityOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

GroupSettings.fragments = {
  group: gql`
    fragment GroupSettings on Group {
      groupId
      name
      description
      visibility
      notificationFrequency
      createdAt

      myRelationshipWithGroup {
        type
      }
    }
  `,
};

export type GroupSettingsGQLData = {
  groupId: string;
  name: string;
  description: string;
  visibility: string;
  notificationFrequency: 'off' | 'low' | 'frequent';
  createdAt: string;

  myRelationshipWithGroup: {
    type: string;
  };
};

type GroupSettingsProps = {
  group: GroupSettingsGQLData;
};
