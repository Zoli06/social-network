import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate,
} from 'react-router-dom';

import { createContext, useState } from 'react';

// import { Post } from './components/Post';
import { GroupPage } from './pages/GroupPage';
import { HomePage } from './pages/HomePage';
import { UserPage } from './pages/UserPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LogoutPage } from './pages/LogoutPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { GroupAdministrationPage } from './pages/GroupAdministrationPage';
import { GroupInfoPage } from './pages/GroupInfoPage';
import { SearchPage } from './pages/SearchPage';
import { CreateGroupPage } from './pages/CreateGroupPage';
import { RelationshipsWithUsersPage } from './pages/RelationshipsWithUsersPage';
import { RelationshipsWithGroupsPage } from './pages/RelationshipsWithGroupsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useQuery, gql } from '@apollo/client';
import { Editor } from './components/Editor/Editor';
import { Header, HeaderGQLData } from './components/Header/Header';
import { Theme } from 'react-daisyui';
import { Notification } from './utilities/Notification';

// This context stores the user ID of the current user
export const UserContext = createContext<MeQueryGQLData['me'] | undefined>(
  undefined
);

// This is the main application component. It is used to render the main page
export function App() {
  // This function makes a request to the server to get the user ID of the current user
  const { data, loading, error } = useQuery<MeQueryGQLData>(ME_QUERY);
  const [isDark, setIsDark] = useState(
    window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // detect if the user has changed their preferred color scheme
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      setIsDark(e.matches);
    });

  if (loading) return <p>Loading...</p>;
  if (error) {
    if (
      error.message === 'Not Authorised!' ||
      error.message === 'You are not authenticated!'
    ) {
      return (
        <Theme dataTheme={isDark ? 'dark' : 'light'}>
          <Notification />
          <Router>
            <div className='flex flex-col items-center p-8'>
              <Routes>
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
                <Route path='*' element={<LoginPage />} />
              </Routes>
            </div>
          </Router>
        </Theme>
      );
    }

    console.error(error);
    return <p>Error!</p>;
  }

  const { me } = data!;

  return (
    <Theme dataTheme={isDark ? 'dark' : 'light'}>
      <Notification />
      <Router>
        <UserContext.Provider value={me}>
          <Editor />
          <Header user={me} />
          <div className='flex flex-col items-center p-8 md:pt-8 pt-0'>
            <Routes>
              {/* TODO: convert to nested routes */}
              <Route path='/group/:groupId' element={<GroupPage />} />
              <Route
                path='/group/:groupId/message/:messageId'
                element={<GroupPage />}
              />
              <Route path='/group/:groupId/info' element={<GroupInfoPage />} />
              <Route
                path='/group/:groupId/admin'
                element={<GroupAdministrationPage />}
              />
              <Route path='/create-group' element={<CreateGroupPage />} />
              <Route path='/user/:userId' element={<UserPage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route
                path='/me'
                element={<Navigate to={`/user/${me.userId}`} />}
              />
              <Route path='/me/edit' element={<EditProfilePage />} />
              <Route
                path='/relationships-with-users'
                element={<RelationshipsWithUsersPage />}
              />
              <Route
                path='/relationships-with-groups'
                element={<RelationshipsWithGroupsPage />}
              />

              <Route path='/logout' element={<LogoutPage />} />

              <Route path='/notifications' element={<NotificationsPage />} />

              <Route path='/search' element={<SearchPage />} />

              <Route index element={<HomePage />} />

              <Route path='*' element={<NotFoundPage />} />
            </Routes>
          </div>
        </UserContext.Provider>
      </Router>
    </Theme>
  );
}

const ME_QUERY = gql`
  query MeQuery {
    me {
      userId
      ...Header
    }
  }

  ${Header.fragments.user}
`;

type MeQueryGQLData = {
  me: {
    userId: string;
  } & HeaderGQLData;
};
