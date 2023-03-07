import { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Input, Button, Textarea, Form } from 'react-daisyui';

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
    }
  }
`;

const EDIT_PROFILE_MUTATION = gql`
  mutation EditProfileMutation($user: UserUpdateInput!) {
    updateMe(user: $user) {
      userId
    }
  }
`;

export const EditProfile = () => {
  const { data, loading, error } = useQuery<EditProfileQueryGQLData>(EDIT_PROFILE_QUERY);
  const [editProfile] = useMutation(EDIT_PROFILE_MUTATION, {
    refetchQueries: [{ query: EDIT_PROFILE_QUERY }],
  });
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [userName, setUsername] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [intro, setIntro] = useState<string>('');
  // profileImageURL is not used yet
  // TODO: provide option to set profile image
  const [profileImageURL, setProfileImageURL] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');

  useEffect(() => {
    if (data?.me) {
      const {
        firstName,
        lastName,
        middleName,
        userName,
        mobileNumber,
        email,
        intro,
        profileImage,
      } = data.me;
      setFirstName(firstName);
      setLastName(lastName);
      setMiddleName(middleName);
      setUsername(userName);
      setMobileNumber(mobileNumber);
      setEmail(email);
      setIntro(intro);
      setProfileImageURL(profileImage?.url || '');
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      alert('Passwords do not match');
      return;
    }
    const _password = password.length > 0 ? password : undefined;
    // XXX: Bug here: if not required filled is empty, it won't be updated
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
        },
      },
    });
  };

  const handleDiscard = () => {
    setFirstName(data?.me?.firstName || '');
    setLastName(data?.me?.lastName || '');
    setMiddleName(data?.me?.middleName || '');
    setUsername(data?.me?.userName || '');
    setMobileNumber(data?.me?.mobileNumber || '');
    setEmail(data?.me?.email || '');
    setIntro(data?.me?.intro || '');
    setProfileImageURL(data?.me?.profileImage?.url || '');
    setPassword('');
    setPasswordConfirm('');
  };

  return (
    <div className='bg-black/20 rounded-md p-4'>
      <h1 className='text-3xl font-bold text-center mb-2'>Update profile</h1>
      <Form onSubmit={handleSubmit} className='grid md:grid-cols-2 gap-2'>
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
            <span className='label-text'>Phone</span>
          </label>
          <Input
            type='tel'
            name='phone'
            id='phone'
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
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
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
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
        <div className='form-control'>
          <Button
            type='button'
            className='btn-secondary'
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </div>
        <div className='form-control'>
          <Button type='submit' className='btn-primary'>
            Save
          </Button>
        </div>
      </Form>
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
  };
};
