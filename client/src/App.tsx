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
      vote {
        type
      }
      medias {
        url
      }
      text
    }
  }
`; 

function App() {
  const { loading, error, data } = useQuery(MESSAGE_QUERY, {
    variables: {
      messageId: "1"
    }
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: ${error.toString()}</p>;
  
  return (
    <Message {...data.message}/>
  );
}

export default App;
