import './GroupInfos.scss';
import { gql, useMutation } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import { openEditor } from '../Editor/Editor';
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

const SET_NOTIFICATION_FREQUENCY_MUTATION = gql`
  mutation SetNotificationFrequency(
    $frequency: NotificationFrequency!
    $groupId: ID!
  ) {
    setNotificationFrequency(
      frequency: $frequency
      groupId: $groupId
    )
  }
`;

const groupVisibilityOptions = [
  { value: 'visible', label: 'Visible to everyone' },
  { value: 'hidden', label: 'Only visible to members' },
];

export const GroupInfos = ({ className = '', group }: GroupInfosProps) => {
  const {
    groupId,
    name,
    description,
    visibility,
    notificationFrequency,
    createdAt,
    myRelationshipWithGroup: { type: myRelationShipWithGroupType },
  } = group;
  console.log(notificationFrequency)
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

  const [setNotificationFrequency] = useMutation(
    SET_NOTIFICATION_FREQUENCY_MUTATION,
    {
      update(cache, { data: { setNotificationFrequency } }) {
        cache.modify({
          id: cache.identify({
            __typename: 'Group',
            groupId,
          }),
          fields: {
            notificationFrequency: () => setNotificationFrequency,
          },
        });
      },
    }
  );

  const isAdmin = myRelationShipWithGroupType === 'admin';

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

  const handleSetNotificationFrequency = (frequency: string) => {
    setNotificationFrequency({
      variables: {
        groupId,
        frequency,
      },
    });
  };

  return (
    <div className={`group-infos ${className}`}>
      <h2>Group Infos</h2>
      <div className='description'>
        <h3>
          Description{' '}
          {isAdmin && (
            <svg
              className='message-edit icon'
              onClick={() => openEditor(handleEditDescription, description)}
            >
              <use href='/assets/images/svg-bundle.svg#edit' />
            </svg>
          )}
        </h3>

        <ReactMarkdown
          className='description-text'
          children={description}
          remarkPlugins={[remarkGfm]}
        />
      </div>
      <div className='notification-frequency'>
        <h3>Notification Frequency</h3>
        <select
          className='notification-frequency-select'
          value={notificationFrequency}
          onChange={(e) => {
            handleSetNotificationFrequency(e.target.value);
          }}
        >
          <option value='off'>Off</option>
          <option value='low'>Low</option>
          <option value='frequent'>Frequent</option>
        </select>
      </div>
      <div className='visibility'>
        <h3>Visibility</h3>
        {isAdmin ? (
          <select
            className='visibility-select'
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
      <div className='created-at'>
        <h3>Created At</h3>
        <p>
          {new Date(createdAt).toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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
      notificationFrequency
      createdAt

      myRelationshipWithGroup {
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
  notificationFrequency: 'off' | 'low' | 'frequent';
  createdAt: string;

  myRelationshipWithGroup: {
    type: string;
  };
};

type GroupInfosProps = {
  className?: string;
  group: GroupInfosGQLData;
};
