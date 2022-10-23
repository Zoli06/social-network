import './App.scss';
// import { Post } from './components/Post';
import { Group } from './components/Group';
import { useQuery, gql } from '@apollo/client';
import React from 'react';
import { Editor } from './components/Editor';

const ME = gql`
  query {
    me {
      userId
    }
  }
`;

export const UserContext = React.createContext({ userId: '' });

export function App() {
  const { data, loading, error } = useQuery(ME);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <UserContext.Provider value={data?.me}>
      <Group groupId='1' onlyInterestedInMessageId='41' />
      <Group groupId='1' onlyInterestedInMessageId='111' />
      <Editor />
    </UserContext.Provider>
  );
}
