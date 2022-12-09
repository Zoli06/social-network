import "./App.scss";
// import { Post } from './components/Post';
import { Group } from "./components/Group";
import { useQuery, gql } from "@apollo/client";
import React from "react";
import { Editor } from "./components/Editor";

const ME = gql`
  query {
    me {
      userId
    }
  }
`;

// This context stores the user ID of the current user
export const UserContext = React.createContext<
  MeQueryGQLData["me"] | undefined
>(undefined);

// This is the main application component. It is used to render the main page
export function App() {
  // This function makes a request to the server to get the user ID of the current user
  const { data, loading, error } = useQuery<MeQueryGQLData>(ME);

  // If the user has set their preferred color scheme to dark mode, we set the dark theme
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.className = "darkTheme";
  } else {
    document.documentElement.className = "lightTheme";
  }

  // detect if the user has changed their preferred color scheme
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const newColorScheme = e.matches ? "darkTheme" : "lightTheme";
      document.documentElement.className = newColorScheme;
    });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log(error);
    return <p>Error!</p>;
  }

  return (
    // This context provider makes the user ID of the current user available to all child components
    <UserContext.Provider value={data!.me}>
      {
        // This renders the group component, which renders the posts in the group
      }
      <Group groupId="1" />
      {
        // This renders the editor component, which allows the user to create new posts
      }
      <Editor />
    </UserContext.Provider>
  );
}

type MeQueryGQLData = {
  me: {
    userId: string;
  };
};
