import React, { useEffect, useState } from 'react';
import './EditProfile.scss';
import { gql, useMutation, useQuery } from '@apollo/client';

const EDIT_PROFILE_QUERY = gql`
  query EditProfileQuery {
    me {
      userId
      firstName
      lastName
      middleName
      userName
      mobileNumber
      email
      intro
      profileImage {
        mediaId
        url
      }
      registratedAt
      lastLoginAt
    }
  }
`;

const EDIT_PROFILE_MUTATION = gql`
  mutation EditProfileMutation(
    $user: UserUpdateInput!
  ) {
    updateUser(user: $user) {
      userId
    }
  }
`;

export const EditProfile = () => {
  const { data, loading, error } = useQuery(EDIT_PROFILE_QUERY);
  const [editProfile] = useMutation(EDIT_PROFILE_MUTATION, {
    refetchQueries: [{ query: EDIT_PROFILE_QUERY }],
  });
  const [me, editMe] = useState<EditProfileQueryGQLData['me'] | undefined>(
    undefined
  );
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');

  useEffect(() => {
    if (data) {
      editMe(data.me);
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  if (!me) return <div>Loading...</div>;

  const {
    firstName,
    lastName,
    middleName,
    userName,
    mobileNumber,
    email,
    intro,
    profileImage,
    registratedAt,
    lastLoginAt,
  } = me;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      alert('Passwords do not match');
      return;
    }
    const _password = password.length > 0 ? password : undefined;
    await editProfile({
      variables: {
        user: {
          firstName,
          lastName,
          middleName,
          userName,
          mobileNumber,
          email,
          intro,
          password: _password,
        }
      },
    });
  };

  return (
    <div className='edit-profile'>
      <form onSubmit={handleSubmit}>
        <label htmlFor='firstName'>First Name</label>
        <input
          type='text'
          name='firstName'
          id='firstName'
          value={firstName}
          onChange={(e) => editMe({ ...me, firstName: e.target.value })}
        />
        <label htmlFor='lastName'>Last Name</label>
        <input
          type='text'
          name='lastName'
          id='lastName'
          value={lastName}
          onChange={(e) => editMe({ ...me, lastName: e.target.value })}
        />
        <label htmlFor='middleName'>Middle Name</label>
        <input
          type='text'
          name='middleName'
          id='middleName'
          value={middleName}
          onChange={(e) => editMe({ ...me, middleName: e.target.value })}
        />
        <label htmlFor='userName'>User Name</label>
        <input
          type='text'
          name='userName'
          id='userName'
          value={userName}
          onChange={(e) => editMe({ ...me, userName: e.target.value })}
        />
        <label htmlFor='mobileNumber'>Mobile Number</label>
        <input
          type='tel'
          name='mobileNumber'
          id='mobileNumber'
          value={mobileNumber}
          onChange={(e) => editMe({ ...me, mobileNumber: e.target.value })}
        />
        <label htmlFor='email'>Email</label>
        <input
          type='email'
          name='email'
          id='email'
          value={email}
          onChange={(e) => editMe({ ...me, email: e.target.value })}
        />
        <label htmlFor='intro'>Intro</label>
        <textarea
          name='intro'
          id='intro'
          value={intro}
          onChange={(e) => editMe({ ...me, intro: e.target.value })}
        />
        <label htmlFor='profileImage'>Profile Image</label>
        <input
          type='url'
          name='profileImage'
          id='profileImage'
          value={profileImage?.url || ''}
          onChange={(e) =>
            editMe({
              ...me,
              profileImage: { ...profileImage, url: e.target.value },
            })
          }
        />
        <label htmlFor='password'>Password</label>
        <input
          type='password'
          name='password'
          id='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor='passwordConfirm'>Password Confirm</label>
        <input
          type='password'
          name='passwordConfirm'
          id='passwordConfirm'
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
        <p>
          Registrated At:{' '}
          {new Date(registratedAt).toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <p>
          Last Login At:{' '}
          {new Date(lastLoginAt).toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <button type='submit'>Save</button>
      </form>
    </div>
  );
};

type EditProfileQueryGQLData = {
  me: {
    userId: string;
    firstName: string;
    lastName: string;
    middleName: string;
    userName: string;
    mobileNumber: string;
    email: string;
    intro: string;
    profileImage: {
      mediaId: string;
      url: string;
    };
    registratedAt: string;
    lastLoginAt: string;
  };
};
