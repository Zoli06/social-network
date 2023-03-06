import { gql, useQuery } from '@apollo/client';
import { UserCard, UserCardGQLData } from '../User/UserCard';
import { GroupCard, GroupCardGQLData } from '../Group/GroupCard';

const SearchQuery = gql`
  query SearchQuery($query: String!) {
    searchUsers(query: $query) {
      userId
      ...UserCard
    }

    searchGroups(query: $query) {
      groupId
      ...GroupCard
    }
  }

  ${UserCard.fragments.user}
  ${GroupCard.fragments.group}
`;

export const Search = ({ query, type }: SearchProps) => {
  const { data, loading, error } = useQuery<SearchQueryGQLData>(SearchQuery, {
    variables: {
      query,
    },
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error</p>;
  }

  return (
    <div className='max-w-fit bg-black/20 rounded-md p-4 flex flex-col gap-4'>
      <h1 className='text-2xl font-bold text-center'>Search results for {query}</h1>
      <div className={['groups', 'all'].includes(type) ? '' : 'hidden'}>
        <h2 className='text-lg font-bold'>Groups</h2>
        <div className='flex flex-col gap-4'>
          {data!.searchGroups.length > 0 ? (
            data!.searchGroups.map((group) => {
              return <GroupCard group={group} key={group.groupId} />;
            })
          ) : (
            <i>No groups found</i>
          )}
        </div>
      </div>
      <div className={['users', 'all'].includes(type) ? '' : 'hidden'}>
        <h2 className='text-lg font-bold'>Users</h2>
        <div className='flex flex-col gap-4'>
          {data!.searchUsers.length > 0 ? (
            data!.searchUsers.map((user) => {
              return <UserCard user={user} key={user.userId} />;
            })
          ) : (
            <i>No users found</i>
          )}
        </div>
      </div>
    </div>
  );
};

type SearchQueryGQLData = {
  searchUsers: ({
    userId: string;
  } & UserCardGQLData)[];
  searchGroups: ({
    groupId: string;
  } & GroupCardGQLData)[];
};

type SearchProps = {
  query: string;
  type: 'groups' | 'users' | 'all';
};
