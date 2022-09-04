import React from 'react';
import './AddResponse.scss';
import { useMutation, gql } from '@apollo/client';

// TODO: refactor this code
const ADD_RESPONSE_MUTATION = gql`
  mutation AddResponseMutation($message: MessageInput!) {
    sendMessage(message: $message) {
      messageId
    }
  }
`;

export const AddResponse = ({ messageId }: { messageId: string }) => {
  const [addResponseMutation] = useMutation(ADD_RESPONSE_MUTATION);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const text = event.target.elements['response-text'].value;
    if (text === '') return;
    event.target.elements['response-text'].value = '';

    addResponseMutation({
      variables: {
        message: {
          text,
          responseToMessageId: messageId,
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className='add-response'>
      <textarea placeholder='Add a response' id='response-text' />
      <button type='submit' id='submit-button'>
        Add
      </button>
    </form>
  );
};
