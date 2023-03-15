import { gql, useQuery } from '@apollo/client';
import { HomeMessages, HomeMessagesGQLData } from './HomeMessages';
import {
  FriendSuggestions,
  FriendSuggestionsGQLData,
} from './FriendSuggestions';
import { GroupSuggestions, GroupSuggestionsGQLData } from './GroupSuggestions';

const topMessagesLimit = 5;
const trendingMessagesLimit = 5;
const topMessagesOffset = 0;
const trendingMessagesOffset = 0;

export const Home = () => {
  // TODO: add pagination
  const { data, loading, error, subscribeToMore } = useQuery<HomeQueryGQLData>(
    HOME_QUERY,
    {
      variables: {
        topMessagesLimit,
        topMessagesOffset,
        trendingMessagesLimit,
        trendingMessagesOffset,
      },
    }
  );

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error(error);
  }

  return (
    <div className='container bg-black/20 rounded-md p-4 flex flex-col gap-4 max-w-2xl'>
      <FriendSuggestions me={data!.me} />
      <GroupSuggestions me={data!.me} />
      <HomeMessages
        topMessages={data!.topMessages}
        trendingMessages={data!.trendingMessages}
        subscribeToMore={subscribeToMore}
        topMessagesLimit={topMessagesLimit}
        topMessagesOffset={topMessagesOffset}
        trendingMessagesLimit={trendingMessagesLimit}
        trendingMessagesOffset={trendingMessagesOffset}
      />
    </div>
  );
};

const HOME_QUERY = gql`
  query HomeQuery(
    $topMessagesLimit: Int!
    $topMessagesOffset: Int!
    $trendingMessagesLimit: Int!
    $trendingMessagesOffset: Int!
  ) {
    topMessages(limit: $topMessagesLimit, offset: $topMessagesOffset) {
      messageId
      ...HomeMessages
    }
    trendingMessages(
      limit: $trendingMessagesLimit
      offset: $trendingMessagesOffset
    ) {
      messageId
      ...HomeMessages
    }
    me {
      userId
      ...FriendSuggestions
      ...GroupSuggestions
    }
  }

  ${HomeMessages.fragments.message}
  ${FriendSuggestions.fragments.me}
  ${GroupSuggestions.fragments.me}
`;

type HomeQueryGQLData = {
  topMessages: ({
    messageId: string;
  } & HomeMessagesGQLData)[];
  trendingMessages: ({
    messageId: string;
  } & HomeMessagesGQLData)[];
  me: {
    userId: string;
  } & FriendSuggestionsGQLData &
    GroupSuggestionsGQLData;
};
