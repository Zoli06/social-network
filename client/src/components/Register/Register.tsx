import { gql, useMutation } from '@apollo/client';
import React from 'react';
import { Input, Button, Textarea } from 'react-daisyui';

const REGISTER_MUTATION = gql`
  mutation Register($user: UserInput!) {
    register(user: $user) {
      token
    }
  }
`;

export const Register = () => {
  const [register] = useMutation<
    RegisterMutationGQLData,
    RegisterMutationGQLVariables
  >(REGISTER_MUTATION);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [middleName, setMiddleName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [userName, setUsername] = React.useState('');
  const [intro, setIntro] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      email.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      firstName.length > 0 &&
      lastName.length > 0 &&
      middleName.length > 0 &&
      phone.length > 0 &&
      userName.length > 0 //&&
      // not necessary
      // intro.length > 0
    ) {
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
            userName,
            middleName,
            mobileNumber: phone,
            intro,
          },
        },
      });

      // check if registration was successful
      if (!data) {
        // TODO: make a toast
        alert('Registration failed');
        return;
      }

      // store the token in local storage
      localStorage.setItem('token', data!.register.token);

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
    //   <label htmlFor='confirmPassword'>Confirm Password</label>
    //   <input type='password' name='confirmPassword' id='confirmPassword' />
    //   <label htmlFor='firstName'>First Name</label>
    //   <input type='text' name='firstName' id='firstName' />
    //   <label htmlFor='lastName'>Last Name</label>
    //   <input type='text' name='lastName' id='lastName' />
    //   <label htmlFor='middleName'>Middle Name</label>
    //   <input type='text' name='middleName' id='middleName' />
    //   <label htmlFor='phone'>Phone</label>
    //   <input type='tel' name='phone' id='phone' />
    //   <label htmlFor='username'>Username</label>
    //   <input type='text' name='username' id='username' />
    //   <label htmlFor='intro'>Intro</label>
    //   <textarea name='intro' id='intro' />
    //   <button type='submit'>Register</button>
    // </form>

    <div>
      <h1 className='text-3xl font-bold text-center mb-2'>Register</h1>
      <form onSubmit={handleSubmit} className='grid md:grid-cols-2 gap-2'>
        <div className='form-control'>
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
          <label className='label'>
            <span className='label-text'>Confirm Password</span>
          </label>
          <Input
            type='password'
            name='confirmPassword'
            id='confirmPassword'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>Phone</span>
          </label>
          <Input
            type='tel'
            name='phone'
            id='phone'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className='form-control'>
          <label className='label pt-0'>
            <span className='label-text'>First Name</span>
          </label>
          <Input
            type='text'
            name='firstName'
            id='firstName'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>Last Name</span>
          </label>
          <Input
            type='text'
            name='lastName'
            id='lastName'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>Middle Name</span>
          </label>
          <Input
            type='text'
            name='middleName'
            id='middleName'
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>Username</span>
          </label>
          <Input
            type='text'
            name='username'
            id='username'
            value={userName}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className='md:col-span-2 form-control'>
          <label className='label pt-0'>
            <span className='label-text'>Intro</span>
          </label>
          <Textarea
            name='intro'
            id='intro'
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
          />
        </div>
        <div className='md:col-span-2 form-control'>
          <Button type='submit' className='btn-primary'>
            Register
          </Button>
          <p>
            Already have an account? <a href='/login' className='hover:underline'>Login</a>
          </p>
        </div>
      </form>
    </div>
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
