import { gql, useQuery } from '@apollo/client';
import { UserCard, UserCardGQLData } from '../User/UserCard';
import { GroupCard, GroupCardGQLData } from '../Group/GroupCard';
import { Messages, MessagesGQLData } from '../Group/Messages/Messages';

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

    searchMessages(query: $query) {
      messageId
      ...Messages
    }
  }

  ${UserCard.fragments.user}
  ${GroupCard.fragments.group}
  ${Messages.fragments.message}
`;

export const Search = ({ query, type }: SearchProps) => {
  const { data, loading, error, subscribeToMore } = useQuery<SearchQueryGQLData>(SearchQuery, {
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
      <div className={['messages', 'all'].includes(type) ? '' : 'hidden'}>
        <h2 className='text-lg font-bold'>Messages</h2>
          {data!.searchMessages.length > 0 ? (
            <Messages
              messages={data!.searchMessages}
              subscribeToMore={subscribeToMore}
              maxDepth={0}
              queriedDepth={0}
              maxDisplayedResponses={0}
              renderedFromSearch={true}
            />
          ) : (
            <i>No messages found</i>
          )}
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
  searchMessages: ({
    messageId: string;
  } & MessagesGQLData)[]
};

type SearchProps = {
  query: string;
  type: 'groups' | 'users' | 'messages' | 'all';
};
