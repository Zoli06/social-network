import './App.scss';
import {
  useQuery,
  gql
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
  
  return (
    <>
      <Message {...res1.data.message} />
      <Message {...res2.data.message} />
    </>
  );
}

export default App;
