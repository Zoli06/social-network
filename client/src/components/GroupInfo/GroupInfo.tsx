import { gql, useQuery } from '@apollo/client';
import { GroupHeader, GroupHeaderGQLData } from '../Group/GroupHeader';
import { GroupMember, GroupMemberGQLData } from '../Group/GroupMember';

export const GroupInfo = ({ groupId }: GroupInfoProps) => {
  const { data, loading, error } = useQuery<GroupInfoQueryGQLData>(
    GROUP_INFO_QUERY,
    {
      variables: {
        groupId,
      },
    }
  );

  if (loading) return <p>Loading...</p>;
  if (error) {
    if (error.message === 'Not Authorised!') {
      console.log(error);
      return <h1>This group doesn't exist or is private</h1>;
    }
    console.error(error);
  }

  const { description, createdAt, visibility } = data!.group;

  return (
    <div className='w-fit bg-black/20 rounded-md p-4 flex flex-col gap-4'>
      <GroupHeader group={data!.group} />
      <div className='flex flex-col gap-2'>
        {/* TODO: remove reapeating code here */}
        <h1 className='text-xl font-bold'>Description</h1>
        <p>{description}</p>
        <h1 className='text-xl font-bold'>Creator user</h1>
        <GroupMember user={data!.group.creatorUser} />
        <h1 className='text-xl font-bold'>Created at</h1>
        <p>
          {new Date(createdAt).toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <p className='font-bold'>
          {visibility === 'hidden'
            ? 'This group is visible to members only'
            : 'This group is visible to everyone'}
        </p>
      </div>
    </div>
  );
};

const GROUP_INFO_QUERY = gql`
  query GetGroupInfo($groupId: ID!) {
    group(groupId: $groupId) {
      groupId
      name
      description
      creatorUser {
        ...GroupMember
      }
      createdAt
      visibility
      ...GroupActions
      ...GroupHeader
    }
  }

  ${GroupMember.fragments.user}
  ${GroupHeader.fragments.group}
`;

type GroupInfoQueryGQLData = {
  group: {
    groupId: string;
    description: string;
    creatorUser: GroupMemberGQLData;
    createdAt: string;
    visibility: 'visible' | 'hidden';
  } & GroupHeaderGQLData;
};

type GroupInfoProps = {
  groupId: string;
};
