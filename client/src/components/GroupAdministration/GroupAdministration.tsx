import { gql, useQuery } from '@apollo/client';
import { Button } from 'react-daisyui';
import {
  GroupMembersAdministration,
  GroupMembersAdministrationGQLData,
} from './GroupMembersAdministration';
import { GroupSettings, GroupSettingsGQLData } from './GroupSettings';

export const GroupAdministration = ({ groupId }: GroupAdministrationProps) => {
  const { data, loading, error } = useQuery<GroupAdministrationQueryGQLData>(
    GROUP_ADMINISTRATION_QUERY,
    {
      variables: {
        groupId,
      },
    }
  );

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>{error.message}</div>;
  }

  return (
    <div>
      <div className='mb-2'>
        <a href={`/group/${groupId}`}>
          <Button>Back to group</Button>
        </a>
      </div>
      <div className='bg-black/20 p-4 rounded-md'>
        <h1 className='text-2xl font-bold text-center'>Group Administration</h1>
        <h2 className='text-2xl font-bold text-center'>{data!.group.name}</h2>
        <h2 className='text-xl font-bold text-center'>Permissions</h2>
        <GroupMembersAdministration group={data!.group} />
        <h2 className='text-xl font-bold text-center mt-4'>Settings</h2>
        <GroupSettings group={data!.group} />
      </div>
    </div>
  );
};

const GROUP_ADMINISTRATION_QUERY = gql`
  query GetGroupAdministration($groupId: ID!) {
    group(groupId: $groupId) {
      groupId
      name
      myRelationshipWithGroup {
        type
      }

      ...GroupMembersAdministration
      ...GroupSettings
    }
  }

  ${GroupMembersAdministration.fragments.group}
  ${GroupSettings.fragments.group}
`;

type GroupAdministrationQueryGQLData = {
  group: {
    groupId: string;
    name: string;
    myRelationshipWithGroup: {
      type: string;
    };
  } & GroupMembersAdministrationGQLData &
    GroupSettingsGQLData;
};

type GroupAdministrationProps = {
  groupId: string;
};
