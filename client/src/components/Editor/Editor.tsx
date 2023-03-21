import { useState } from 'react';
import { gql } from '@apollo/client';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { Form, Button } from 'react-daisyui';

export let openEditor = (_onSubmit: OnSubmit, _textValue?: string) => {};

export const Editor = () => {
  const [textValue, setTextValue] = useState('');
  const [onSubmit, setOnSubmit] = useState<OnSubmit>(() => {});
  const [displayEditor, setDisplayEditor] = useState(false);

  openEditor = (_onSubmit, _textValue = '') => {
    setTextValue(_textValue);
    // Bit of hack
    // https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
    setOnSubmit(() => (textValue: string) => _onSubmit(textValue));
    setDisplayEditor(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (textValue === '') return;

    onSubmit(textValue);

    setDisplayEditor(false);
  };

  const handleClose = () => {
    setTextValue('');
    setDisplayEditor(false);
  };

  return displayEditor ? (
    <Form
      onSubmit={handleSubmit}
      className='fixed top-0 left-0 w-full h-full z-50 bg-black/50 flex flex-col justify-center items-center gap-4 p-4'
    >
      <div className='md:w-3/4 w-full max-w-2xl md:h-[50vh] flex-grow md:flex-grow-0'>
        <MDEditor
          value={textValue}
          // @ts-ignore
          onChange={setTextValue}
          previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
          preview='edit'
          height='100%'
        />
      </div>
      <div className='md:w-3/4 w-full max-w-2xl grid md:grid-cols-2 grid-cols-1 gap-4'>
        <Button onClick={handleClose} className='btn-secondary'>
          Cancel
        </Button>
        <Button type='submit' className='btn-primary'>
          Submit
        </Button>
      </div>
    </Form>
  ) : (
    <></>
  );
};

Editor.fragments = {
  message: gql`
    fragment AddResponse on Message {
      messageId
      group {
        groupId
      }
    }
  `,
};

export type OnSubmit = (text: string) => any;

export type EditorGQLData = {
  messageId: string;
  group: { groupId: string };
};

type EditorProps = {};
