import { gql, useQuery } from '@apollo/client';
import { ReactNode } from 'react';
import { GroupHeader, GroupHeaderGQLData } from '../Group/GroupHeader';
import { UserListElement, UserListElementGQLData } from '../User/UserListElement';

const GroupInfoElement = ({ title, child }: { title: string, child: ReactNode }) => {
  return (
    <>
      <h1 className='text-xl font-bold'>{title}</h1>
      {child}
    </>
  );
};

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
        <GroupInfoElement title='Description' child={<p>{description}</p>} />
        <GroupInfoElement title='Creator user' child={<UserListElement user={data!.group.creatorUser} />} />
        <GroupInfoElement title='Created at' child={<p>
          {new Date(createdAt).toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        } />

        {/* <p className='font-bold'>
          {visibility === 'hidden'
            ? 'This group is visible to members only'
            : 'This group is visible to everyone'}
        </p> */}

        <GroupInfoElement title='Visibility' child={<p className='font-bold'>
          {visibility === 'hidden'
            ? 'This group is visible to members only'
            : visibility === 'visible'
              ? 'This group is visible to everyone'
              : 'This group is open to everyone'}
        </p>
        } />
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
        ...UserListElement
      }
      createdAt
      visibility
      ...GroupHeader
    }
  }

  ${UserListElement.fragments.user}
  ${GroupHeader.fragments.group}
`;

type GroupInfoQueryGQLData = {
  group: {
    groupId: string;
    description: string;
    creatorUser: UserListElementGQLData;
    createdAt: string;
    visibility: 'visible' | 'hidden' | 'open';
  } & GroupHeaderGQLData;
};

type GroupInfoProps = {
  groupId: string;
};
