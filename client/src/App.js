import './App.css';
import {
  useQuery,
  gql
} from "@apollo/client";

const TEST_QUERY = gql`
  query{
    me {
      userId
    }
  }
`; 

function App() {
  const { loading, error, data } = useQuery(TEST_QUERY);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: ${error.toString()}</p>;

  return (
    <p>${data}</p>
  );
}

export default App;
