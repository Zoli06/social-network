import { useState, FormEvent } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Input, Button, Link } from 'react-daisyui';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    <div className='container max-w-fit bg-black/20 rounded-md p-4'>
      <h1 className='text-3xl font-bold text-center mb-4'>Login</h1>
      <form
        className='flex items-center justify-center gap-2'
        onSubmit={handleSubmit}
      >
        <div className='form-control max-w-xs'>
          <label className='label pt-0'>
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

          <div className='pt-2'>
            <Button type='submit' className='w-full btn-primary'>
              Login
            </Button>
            <Link href='/register'>Register</Link>
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
