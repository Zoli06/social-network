import { gql } from '@apollo/client';
import { UserCard, UserCardGQLData } from '../User/UserCard';

export const FriendSuggestions = ({ me }: FriendSuggestionsProps) => {
  return (
    <div>
      <h1 className='text-3xl font-bold text-center mb-2'>
        Friend suggestions
      </h1>
      <div className='flex flex-row gap-4 overflow-x-auto'>
        {me.friendSuggestions.length > 0 ? (
          me.friendSuggestions.map((friend) => (
            <UserCard key={friend.userId} user={friend} />
          ))
        ) : (
          <i>No friend suggestions</i>
        )}
      </div>
    </div>
  );
};

FriendSuggestions.fragments = {
  me: gql`
    fragment FriendSuggestions on User {
      userId
      friendSuggestions {
        userId
        ...UserCard
      }
    }

    ${UserCard.fragments.user}
  `,
};

export type FriendSuggestionsGQLData = {
  userId: string;
  friendSuggestions: ({
    userId: string;
  } & UserCardGQLData)[];
};

type FriendSuggestionsProps = {
  me: FriendSuggestionsGQLData;
};
