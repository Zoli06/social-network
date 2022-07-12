import './App.scss';
import {
  useQuery,
  gql,
  useSubscription
} from "@apollo/client";
import { Message } from './components/Message';

const MESSAGE_QUERY = gql`
  query GetMessage($messageId: ID!) {
    message(messageId: $messageId) {
      messageId
      user {
        firstName
        lastName
        middleName
        userName
        intro
        profileImage {
          url
        }
      }
      group {
        name
      }
      createdAt
      updatedAt
      responses {
        messageId
      }
      responsesCount
      reactions {
        type
      }
      reaction {
        type
      }
      upVotes
      downVotes
      vote
      medias {
        url
      }
      text
    }
  }
`;

const MESSAGE_VOTED_SUBSCRIPTION = gql`
  subscription MessageVoted($messageId: ID!) {
    messageVoted(messageId: $messageId) {
      upVotes
      downVotes
    }
  }
`;

function App() {
  const res1 = useQuery(MESSAGE_QUERY, {
    variables: {
      messageId: "1"
    }
  });
  const res2 = useQuery(MESSAGE_QUERY, {
    variables: {
      messageId: "11"
    }
  });
  
  if (res1.loading || res2.loading) return <p>Loading...</p>;
  if (res1.error || res2.error) {
    console.log(res1?.error);
    console.log(res2?.error);
    return <p>Error</p>;
  }
  // console.log('ok')
  // console.log(res1.subscribeToMore)
  res1.subscribeToMore({
    document: MESSAGE_VOTED_SUBSCRIPTION,
    variables: {
      messageId: "1"
    },
    updateQuery: (prev, { subscriptionData }) => {
      console.log(subscriptionData);
      if (!subscriptionData.data) return prev;
      const { messageVoted } = subscriptionData.data;
      return {
        ...prev,
        message: {
          ...prev.message,
          upVotes: messageVoted.upVotes,
          downVotes: messageVoted.downVotes
        }
      };
    }
  });

  return (
    <>
      <Message {...res1.data.message} />
      <Message {...res2.data.message} />
    </>
  );
}

export default App;
