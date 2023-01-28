import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate,
} from 'react-router-dom';

import './App.scss';
// import { Post } from './components/Post';
import { GroupPage } from './pages/GroupPage';
import { HomePage } from './pages/HomePage';
import { UserPage } from './pages/UserPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LogoutPage } from './pages/LogoutPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { GroupInfoPage } from './pages/GroupInfoPage';
import { useQuery, gql } from '@apollo/client';
import React from 'react';
import { Editor } from './components/Editor/Editor';

const ME_QUERY = gql`
  query {
    me {
      userId
    }
  }
`;

// This context stores the user ID of the current user
export const UserContext = React.createContext<
  MeQueryGQLData['me'] | undefined
>(undefined);

// This is the main application component. It is used to render the main page
export function App() {
  // This function makes a request to the server to get the user ID of the current user
  const { data, loading, error } = useQuery<MeQueryGQLData>(ME_QUERY);

  // If the user has set their preferred color scheme to dark mode, we set the dark theme
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    document.documentElement.className = 'darkTheme';
  } else {
    document.documentElement.className = 'lightTheme';
  }

  // detect if the user has changed their preferred color scheme
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      const newColorScheme = e.matches ? 'darkTheme' : 'lightTheme';
      document.documentElement.className = newColorScheme;
    });

  if (loading) return <p>Loading...</p>;
  if (error) {
    if (error.message === 'Not Authorised!' || error.message === 'You are not authenticated!') {
      return (
        <Router>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='*' element={<LoginPage />} />
          </Routes>
        </Router>
      );
    }

    console.error(error);
    return <p>Error!</p>;
  }

  const { me } = data!;

  return (
    <Router>
      <UserContext.Provider value={me}>
        <Editor />
        <Routes>
          <Route path='/group/:groupId' element={<GroupPage />} />
          <Route path='/group/:groupId/:messageId' element={<GroupPage />} />
          <Route
            path='/group/:groupId/:messageId/:maxDepth'
            element={<GroupPage />}
          />
          <Route path='group-info/:groupId' element={<GroupInfoPage />} />
          <Route path='/user/:userId' element={<UserPage />} />
          <Route path='/edit-profile' element={<EditProfilePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/me' element={<Navigate to={`/user/${me.userId}`} />} />
          <Route path='/logout' element={<LogoutPage />} />
          <Route path='*' element={<HomePage />} />
        </Routes>
      </UserContext.Provider>
    </Router>
  );
}

type MeQueryGQLData = {
  me: {
    userId: string;
  };
};
