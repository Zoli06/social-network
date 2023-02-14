import './Login.scss';
import { gql, useMutation } from '@apollo/client';
import React from 'react';
// daisyui
import { Input, Button } from 'react-daisyui';

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
    // TODO: trace value with state
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
    // <form onSubmit={handleSubmit}>
    //   <label htmlFor='email'>Email</label>
    //   <input type='email' name='email' id='email' />
    //   <label htmlFor='password'>Password</label>
    //   <input type='password' name='password' id='password' />
    //   <button type='submit'>Login</button>
    //   <a href='/register'>Register</a>
    // </form>

    <form
      className='flex component-preview p-4 items-center justify-center gap-2 font-sans'
      onSubmit={handleSubmit}
    >
      <div className='form-control w-full max-w-xs flex flex-col gap-2'>
        <div>
          <h1 className='text-3xl font-bold'>Login</h1>
          <label className='label'>
            <span className='label-text'>Email address</span>
          </label>
          <Input type='email' name='email' id='email' />
          <label className='label'>
            <span className='label-text'>Password</span>
          </label>
          <Input type='password' name='password' id='password' />
        </div>

        <div>
          <Button type='submit' className='w-full btn-primary'>
            Login
          </Button>
          <a href='/register'>Register</a>
        </div>
      </div>
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
