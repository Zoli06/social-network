import { gql, useQuery } from '@apollo/client';
import { Button } from 'react-daisyui';
import {
  GroupMembersAdministration,
  GroupMembersAdministrationGQLData,
} from './GroupMembersAdministration';
import { GroupSettings, GroupSettingsGQLData } from './GroupSettings';
import {
  GroupInvitationPopup, GroupInvitationPopupOnGroupGQLData, GroupInvitationPopupOnMeGQLData,
  openInvitationPopup
} from './GroupInvitationPopup';

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
    <div className='max-w-2xl'>
      <div className='mb-2'>
        <a href={`/group/${groupId}`}>
          <Button>Back to group</Button>
        </a>
      </div>
      <GroupInvitationPopup group={data!.group} me={data!.me} />
      <div className='mb-2'>
        <Button onClick={() => openInvitationPopup()}>Invite users to group</Button>
      </div>
      <div className='bg-black/20 p-4 rounded-md min-w-0 md:min-w-[30rem]'>
        <h1 className='text-2xl font-bold text-center'>Group Administration</h1>
        <h2 className='text-2xl font-bold text-center'>{data!.group.name}</h2>
        <GroupMembersAdministration group={data!.group} />
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
      ...GroupInvitationPopupOnGroup
    }

    me {
      userId
      ...GroupInvitationPopupOnMe
    }
  }

  ${GroupMembersAdministration.fragments.group}
  ${GroupSettings.fragments.group}
  ${GroupInvitationPopup.fragments.group}
  ${GroupInvitationPopup.fragments.me}
`;

type GroupAdministrationQueryGQLData = {
  group: {
    groupId: string;
    name: string;
    myRelationshipWithGroup: {
      type: string;
    };
  } & GroupMembersAdministrationGQLData &
  GroupSettingsGQLData &
  GroupInvitationPopupOnGroupGQLData;
  
  me: {
    userId: string;
  } & GroupInvitationPopupOnMeGQLData;
};

type GroupAdministrationProps = {
  groupId: string;
};
