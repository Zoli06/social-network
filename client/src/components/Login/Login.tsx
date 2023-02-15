import { gql, useMutation } from '@apollo/client';
import React from 'react';
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
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    <div>
      <h1 className='text-3xl font-bold'>Login</h1>
      <form
        className='flex items-center justify-center gap-2'
        onSubmit={handleSubmit}
      >
        <div className='form-control max-w-xs'>
          <label className='label'>
            <span className='label-text'>Email address</span>
          </label>
          <Input
            type='email'
            name='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>Password</span>
          </label>
          <Input
            type='password'
            name='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className='py-2'>
            <Button type='submit' className='w-full btn-primary'>
              Login
            </Button>
            <a href='/register' className='hover:underline'>Register</a>
          </div>
        </div>
      </form>
    </div>
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
