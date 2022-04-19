import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";

const client = new ApolloClient({
  uri: 'localhost:3000/api',
  cache: new InMemoryCache()
});

function App() {
  return (
    <p>Hello world</p>
  );
}

export default App;
