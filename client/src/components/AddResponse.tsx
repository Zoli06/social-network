import React, { useState } from 'react';
import './AddResponse.scss';
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

export const AddResponse = ({ messageData: {messageId, group: {groupId}} }: IAddResponseProps) => {
  const [addResponseMutation] = useMutation(ADD_RESPONSE_MUTATION);
  const [value, setValue] = useState('');
  const [displayEditor, setDisplayEditor] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (value === '') return;
    setValue('');

    addResponseMutation({
      variables: {
        message: {
          text: value,
          responseToMessageId: messageId,
          groupId,
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className='add-response'>
      {/* <textarea placeholder="Add a response" id="response-text" /> */}
      {displayEditor && (
        <MDEditor
          value={value}
          // @ts-ignore
          onChange={setValue}
          id='response-text'
          previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
        />
      )}
      <div
        className={`add-response-buttons ${displayEditor ? 'open' : 'close'}`}
      >
        <button
          id='editor-toggle-button'
          onClick={() => setDisplayEditor(!displayEditor)}
        >
          {displayEditor ? 'Close editor' : 'Open editor'}
        </button>
        {displayEditor && (
          <button type='submit' id='submit-button'>
            Add
          </button>
        )}
      </div>
    </form>
  );
};

AddResponse.fragments = {
  group: gql`
    fragment AddResponse on Group {
      groupId
    }
  `
}

export interface IAddResponseGQLData {
  messageId: string;
  group: { groupId: string; };
}

export interface IAddResponseProps {
  messageData: IAddResponseGQLData;
}
