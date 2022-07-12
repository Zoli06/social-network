import './App.scss';
import {
  useQuery,
  gql
} from "@apollo/client";
import { Message } from './components/Message';

// const MESSAGE_QUERY = gql`
//   query GetMessage($messageId: ID!) {
//     message(messageId: $messageId) {
//       messageId
//       user {
//         firstName
//         lastName
//         middleName
//         userName
//         intro
//         profileImage {
//           url
//         }
//       }
//       group {
//         name
//       }
//       createdAt
//       updatedAt
//       responses {
//         messageId
//       }
//       responsesCount
//       reactions {
//         type
//       }
//       reaction {
//         type
//       }
//       upVotes
//       downVotes
//       vote
//       medias {
//         url
//       }
//       text
//     }
//   }
// `;

// const MESSAGE_VOTED_SUBSCRIPTION = gql`
//   subscription MessageVoted($messageId: ID!) {
//     messageVoted(messageId: $messageId) {
//       upVotes
//       downVotes
//     }
//   }
// `;

function App() {
  return (
    <>
      <Message messageId='1' />
      <Message messageId='11' />
    </>
  );
}

export default App;
