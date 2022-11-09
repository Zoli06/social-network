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

export const UserContext = React.createContext<MeQueryGQLData | undefined>(
  undefined
);

export function App() {
  const { data, loading, error } = useQuery<MeQueryGQLData>(ME);

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
    <UserContext.Provider value={data!}>
      <Group groupId="1" />
      <Editor />
    </UserContext.Provider>
  );
}

type MeQueryGQLData = {
  me: {
    userId: string;
  };
};
