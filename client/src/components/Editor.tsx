import React, { useState } from 'react';
import './Editor.scss';
import { useMutation, gql } from '@apollo/client';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

// TODO: refactor this code
const ADD_RESPONSE_MUTATION = gql`
  mutation AddResponseMutation($message: MessageInput!) {
    sendMessage(message: $message) {
      messageId
    }
  }
`;

const EDIT_MESSAGE_MUTATION = gql`
  mutation EditMessageMutation($message: MessageEditInput!) {
    editMessage(message: $message) {
      messageId
    }
  }
`;

export enum EditorActions {
  ADD,
  EDIT,
}

// TODO: make this code DRY
export let openEditor = (
  _messageId: string | null,
  _groupId: string,
  _action: EditorActions,
  _textValue = ''
) => {};

export const Editor = () => {
  const [addResponseMutation] = useMutation(ADD_RESPONSE_MUTATION);
  const [editMessageMutation] = useMutation(EDIT_MESSAGE_MUTATION);
  const [textValue, setTextValue] = useState('');

  const [displayEditor, setDisplayEditor] = useState(false);
  const [editorAction, setEditorAction] = useState<EditorActions>(
    EditorActions.ADD
  );
  const [messageId, setMessageId] = useState<string | null>('');
  const [groupId, setGroupId] = useState('');

  openEditor = (
    _messageId: string | null,
    _groupId: string,
    _editorAction: EditorActions,
    _textValue = ''
  ) => {
    setMessageId(_messageId);
    setGroupId(_groupId);
    setEditorAction(_editorAction);

    if (_editorAction === EditorActions.EDIT) setTextValue(_textValue);

    setDisplayEditor(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (textValue === '') return;
    setTextValue('');

    if (editorAction === EditorActions.ADD) {
      addResponseMutation({
        variables: {
          message: {
            text: textValue,
            responseToMessageId: messageId,
            groupId,
          },
        },
      });
    } else if (editorAction === EditorActions.EDIT) {
      editMessageMutation({
        variables: {
          message: {
            text: textValue,
            messageId,
          },
        },
      });
    }

    setDisplayEditor(false);
  };

  const handleClose = () => {
    setTextValue('');
    setDisplayEditor(false);
  };

  return displayEditor ? (
    <div className='editor-container'>
      <form
        onSubmit={handleSubmit}
        className='editor'
        id='editor'
        name='editor'
      >
        <MDEditor
          value={textValue}
          // @ts-ignore
          onChange={setTextValue}
          id='editor-text'
          previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
          height={'25vh'}
        />
        <svg id='close-button' onClick={handleClose}>
          <use href='./assets/images/svg-bundle.svg#close-button-2' />
        </svg>
        <label>
          <input type='submit' style={{ display: 'none' }} />
          <svg id='submit-button'>
            <use
              href='./assets/images/svg-bundle.svg#ok'
              onClick={handleSubmit}
            />
          </svg>
        </label>
      </form>
    </div>
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

export type EditorGQLData = {
  messageId: string;
  group: { groupId: string };
};

export type EditorProps = {};
