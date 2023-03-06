import { gql, useMutation } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Select } from 'react-daisyui';

const SET_NOTIFICATION_FREQUENCY_MUTATION = gql`
  mutation SetNotificationFrequency(
    $frequency: NotificationFrequency!
    $groupId: ID!
  ) {
    setNotificationFrequency(frequency: $frequency, groupId: $groupId)
  }
`;

const groupVisibilityOptions = [
  { value: 'visible', label: 'Visible to everyone' },
  { value: 'hidden', label: 'Only visible to members' },
];

export const GroupInfos = ({ group }: GroupInfosProps) => {
  const {
    groupId,
    name,
    description,
    visibility,
    notificationFrequency,
    createdAt,
  } = group;
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

  const renderVisibilityText = (visibility: string) => {
    return groupVisibilityOptions.find((option) => option.value === visibility)
      ?.label;
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
    <div>
      <h1 className='text-2xl font-bold text-center'>Group Infos</h1>
      <div>
        <h2 className='text-lg font-bold'>Name</h2>
        <p>{name}</p>
      </div>
      <div>
        <h2 className='text-lg font-bold'>Description</h2>
        <ReactMarkdown children={description} remarkPlugins={[remarkGfm]} />
      </div>
      <div>
        <h2 className='text-lg font-bold'>Visibility</h2>
        <p>{renderVisibilityText(visibility)}</p>
      </div>
      <div>
        <h2 className='text-lg font-bold'>Created At</h2>
        <p>
          {new Date(createdAt).toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
      <div>
        <h2 className='text-lg font-bold'>Notification Frequency</h2>
        <Select
          value={notificationFrequency}
          onChange={(frequency) => {
            handleSetNotificationFrequency(frequency);
          }}
          className='w-full'
        >
          <Select.Option value='off'>Off</Select.Option>
          <Select.Option value='low'>Low</Select.Option>
          <Select.Option value='frequent'>Frequent</Select.Option>
        </Select>
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
};

type GroupInfosProps = {
  group: GroupInfosGQLData;
};
