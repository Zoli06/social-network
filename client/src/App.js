import './App.css';
import {
  useQuery,
  gql
} from "@apollo/client";
import { Message } from './components/Message';

const MESSAGE_QUERY = gql`
  query GetMessage($messageId: ID!) {
    message(messageId: $messageId) {
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
    <Message text = {data.message.text}/>
  );
}

export default App;
