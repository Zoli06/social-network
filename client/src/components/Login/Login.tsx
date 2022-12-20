import './Login.scss';
import { gql, useMutation } from '@apollo/client';
import React from 'react';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export const Login = () => {
  const [login] = useMutation<LoginMutationGQLData, LoginMutationGQLVariables>(
    LOGIN_MUTATION
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (typeof email === 'string' && typeof password === 'string') {
      // get the token from the server
      const { data } = await login({
        variables: {
          email,
          password,
        },
      });

      // store the token in local storage
      localStorage.setItem('token', data!.login.token);

      // redirect to the home page
      window.location.href = '/';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='email'>Email</label>
      <input type='email' name='email' id='email' />
      <label htmlFor='password'>Password</label>
      <input type='password' name='password' id='password' />
      <button type='submit'>Login</button>
      <a href='/register'>Register</a>
    </form>
  );
};

type LoginMutationGQLData = {
  login: {
    token: string;
  };
};

type LoginMutationGQLVariables = {
  email: string;
  password: string;
};
