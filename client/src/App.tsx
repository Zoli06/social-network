import './App.scss';
import { Post } from './components/Post';
import { Group } from './components/Group';

export function App() {
  return (
    <>
      {/* <Post messageId='1' /> */}
      <Post messageId='11' />
      <Group groupId='1' />
    </>
  );
}
