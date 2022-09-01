import React from 'react';

export const AddResponse = ({ messageId }: { messageId: string }) => {
  const handleSubmit = (event: any) => {
    event.preventDefault();
    // const text = event.target.elements.text.value;
    // if (text === '') return;
    // event.target.elements.text.value = '';
    console.log(event.target.elements['response-text'].value);
  };

  return (
    <div className='add-response'>
      <form onSubmit={handleSubmit}>
        <textarea placeholder='Add a response' id='response-text' />
        <button type='submit'>Add</button>
      </form>
    </div>
  );
};
