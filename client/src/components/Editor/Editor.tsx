import { useState } from 'react';
import { gql } from '@apollo/client';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { Form, Button, Input } from 'react-daisyui';
import { PopupWrapper } from '../../utilities/PopupWrapper';

export let openEditor = (
  _onSubmit: OnSubmit,
  _textValue?: string,
  markdown?: boolean
) => {};

export const Editor = () => {
  const [textValue, setTextValue] = useState('');
  const [markdown, setMarkdown] = useState(true);
  const [onSubmit, setOnSubmit] = useState<OnSubmit>(() => () => {});
  const [displayEditor, setDisplayEditor] = useState(false);

  openEditor = (_onSubmit, _textValue = '', markdown = true) => {
    setTextValue(_textValue);
    // Bit of hack
    // https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
    setOnSubmit(() => (textValue: string) => _onSubmit(textValue));
    setMarkdown(markdown);
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
    <Form onSubmit={handleSubmit}>
      <PopupWrapper>
        <div className={`md:w-3/4 w-full flex-grow md:flex-grow-0 ${markdown ? 'md:h-[50vh] max-w-2xl' : 'max-w-md flex-grow-0'}`}>
          {markdown ? (
            <MDEditor
              value={textValue}
              onChange={(text) => setTextValue(text || '')}
              previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
              preview='edit'
              className='!h-full'
            />
          ) : (
            <Input
              value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className='w-full'
            />
          )}
        </div>
        <div className={`md:w-3/4 w-full grid md:grid-cols-2 grid-cols-1 gap-4 ${markdown ? '' : 'max-w-md'}`}>
          <Button onClick={handleClose} className='btn-secondary'>
            Cancel
          </Button>
          <Button type='submit' className='btn-primary'>
            Submit
          </Button>
        </div>
      </PopupWrapper>
    </Form>
  ) : null;
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
