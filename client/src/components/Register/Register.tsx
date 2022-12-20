import { gql, useMutation } from '@apollo/client';
import React from 'react';
import './Register.scss';

const REGISTER_MUTATION = gql`
  mutation Register($user: UserInput!) {
    register(user: $user) {
      token
    }
  }
`;

export const Register = () => {
  const [register] = useMutation<RegisterMutationGQLData, RegisterMutationGQLVariables>(
    REGISTER_MUTATION
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const middleName = formData.get('middleName');
    const phone = formData.get('phone');
    const username = formData.get('username');
    const intro = formData.get('intro');

    if (typeof email === 'string' && typeof password === 'string' && typeof confirmPassword === 'string' && typeof firstName === 'string' && typeof lastName === 'string' && typeof middleName === 'string' && typeof phone === 'string' && typeof username === 'string' && typeof intro === 'string') {
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      // get the token from the server
      const { data } = await register({
        variables: {
          user: {
            email,
            password,
            firstName,
            lastName,
            userName: username,
            middleName,
            mobileNumber: phone,
            intro,
          },
        },
      });

      // check if registration was successful
      if (!data) {
        alert('Registration failed');
        return;
      }

      // store the token in local storage
      localStorage.setItem('token', data!.register.token);

      // redirect to the home page
      window.location.href = '/';
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='email'>Email</label>
      <input type='email' name='email' id='email' />
      <label htmlFor='password'>Password</label>
      <input type='password' name='password' id='password' />
      <label htmlFor='confirmPassword'>Confirm Password</label>
      <input type='password' name='confirmPassword' id='confirmPassword' />
      <label htmlFor='firstName'>First Name</label>
      <input type='text' name='firstName' id='firstName' />
      <label htmlFor='lastName'>Last Name</label>
      <input type='text' name='lastName' id='lastName' />
      <label htmlFor='middleName'>Middle Name</label>
      <input type='text' name='middleName' id='middleName' />
      <label htmlFor='phone'>Phone</label>
      <input type='tel' name='phone' id='phone' />
      <label htmlFor='username'>Username</label>
      <input type='text' name='username' id='username' />
      <label htmlFor='intro'>Intro</label>
      <textarea name='intro' id='intro' />
      <button type='submit'>Register</button>
    </form>
  );
};

type RegisterMutationGQLData = {
  register: {
    token: string;
  };
};

type RegisterMutationGQLVariables = {
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    middleName: string;
    userName: string;
    mobileNumber: string;
    intro: string;
  };
};
