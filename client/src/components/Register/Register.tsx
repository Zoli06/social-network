import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Input, Button, Textarea, Link } from 'react-daisyui';
import { showNotification } from '../../utilities/Notification';

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [phone, setPhone] = useState('');
  const [userName, setUsername] = useState('');
  const [intro, setIntro] = useState('');

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
        onError: (err) => {
          console.error(err);
          showNotification({
            title: 'Error',
            description: 'An error occurred while registering',
            backgroundColor: '#ff0000',
            textColor: '#fff',
            borderColor: '#ff0000',
          });
        },
      });

      // store the token in local storage
      localStorage.setItem('token', data!.register.token);

      // redirect to the home page
      window.location.href = '/';
    }
  };

  return (
    <div className='max-w-fit bg-black/20 rounded-md p-4'>
      <h1 className='text-3xl font-bold text-center mb-4'>Register</h1>
      <form onSubmit={handleSubmit} className='grid md:grid-cols-2 gap-2'>
        <div className='form-control'>
          {/* TODO: refactor repeating code */}
          <label className='label pt-0'>
            <span className='label-text'>
              Email address <sup className='text-red-500'>*</sup>
            </span>
          </label>
          <Input
            type='email'
            name='email'
            id='email'
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>
              Password <sup className='text-red-500'>*</sup>
            </span>
          </label>
          <Input
            type='password'
            name='password'
            id='password'
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>
              Confirm Password <sup className='text-red-500'>*</sup>
            </span>
          </label>
          <Input
            type='password'
            name='confirmPassword'
            id='confirmPassword'
            value={confirmPassword}
            required
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
            <span className='label-text'>
              First Name <sup className='text-red-500'>*</sup>
            </span>
          </label>
          <Input
            type='text'
            name='firstName'
            id='firstName'
            value={firstName}
            required
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>
              Last Name <sup className='text-red-500'>*</sup>
            </span>
          </label>
          <Input
            type='text'
            name='lastName'
            id='lastName'
            value={lastName}
            required
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
            <span className='label-text'>
              Username <sup className='text-red-500'>*</sup>
            </span>
          </label>
          <Input
            type='text'
            name='username'
            id='username'
            value={userName}
            required
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
            Already have an account? <Link href='/login'>Login</Link>
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
