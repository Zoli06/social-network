import React from 'react';

export const LogoutPage = () => {
  // delete the token from local storage
  localStorage.removeItem('token');

  // redirect to the login page
  window.location.href = '/login';

  return <div>Logging out...</div>;
};
