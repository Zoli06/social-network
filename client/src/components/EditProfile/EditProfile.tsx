import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import {
  Input,
  Button,
  Textarea,
  Form,
  Avatar,
} from 'react-daisyui';

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

const CREATE_MEDIA_MUTATION = gql`
  mutation CreateMedia($media: MediaInput!) {
    createMedia(media: $media) {
      mediaId
      url
    }
  }
`;

export const EditProfile = () => {
  const { data, loading, error } =
    useQuery<EditProfileQueryGQLData>(EDIT_PROFILE_QUERY);
  const [editProfile] = useMutation(EDIT_PROFILE_MUTATION, {
    refetchQueries: [{ query: EDIT_PROFILE_QUERY }],
  });
  const [createMedia] = useMutation(CREATE_MEDIA_MUTATION, {
    context: {
      headers: {
        'Apollo-Require-Preflight': 'true',
      },
    },
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [userName, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [intro, setIntro] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isProfileImageRemoved, setIsProfileImageRemoved] = useState(false);

  const profileImageRef = useRef<HTMLInputElement>(null);

  const updateProfileImageURL = useCallback(() => {
    if (isProfileImageRemoved) {
      return '/assets/images/blank-profile-image.webp';
    } else if (profileImageFile) {
      return URL.createObjectURL(profileImageFile);
    } else if (data?.me?.profileImage?.url) {
      return data.me.profileImage.url;
    } else {
      return '/assets/images/blank-profile-image.webp';
    }
  }, [data, profileImageFile, isProfileImageRemoved]);

  const profileImageURL = useMemo(() => {
    return updateProfileImageURL();
  }, [updateProfileImageURL]);

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
      } = data.me;
      setFirstName(firstName);
      setLastName(lastName);
      setMiddleName(middleName || '');
      setUsername(userName || '');
      setMobileNumber(mobileNumber || '');
      setEmail(email);
      setIntro(intro || '');
      setProfileImageFile(null);
    }
  }, [data]);

  const onChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setProfileImageFile(file);
      }
      setIsProfileImageRemoved(false);
    },
    []
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      alert('Passwords do not match');
      return;
    }

    let profileImageMediaId = data?.me?.profileImage?.mediaId || null;

    if (isProfileImageRemoved) {
      profileImageMediaId = null;
    } else if (profileImageFile) {
      const { data } = await createMedia({
        variables: {
          media: {
            file: profileImageFile,
          },
        },
      });

      profileImageMediaId = data?.createMedia?.mediaId;
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
          profileImageMediaId,
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
    setPassword('');
    setPasswordConfirm('');
  };

  return (
    <div className='bg-black/20 rounded-md p-4'>
      <h1 className='text-3xl font-bold text-center mb-2'>Update profile</h1>
      <Form onSubmit={handleSubmit} className='grid md:grid-cols-2 gap-2'>
        <div className='form-control'>
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
          <label className='label'>
            <span className='label-text'>Intro</span>
          </label>
          <Textarea
            name='intro'
            id='intro'
            value={intro}
            className='h-24'
            onChange={(e) => setIntro(e.target.value)}
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
          <label className='label'>
            <span className='label-text'>Profile Image</span>
          </label>
          <div className='flex items-center gap-4'>
            <Avatar
              src={profileImageURL}
              shape='circle'
              size='md'
              onClick={() => profileImageRef.current?.click()}
              className='cursor-pointer'
            />
            <input
              onChange={onChange}
              type='file'
              accept='image/*'
              alt='Profile Image'
              className='hidden'
              ref={profileImageRef}
            />
            <Button
              type='button'
              color='secondary'
              className={`flex-grow ${profileImageRef.current?.value ? '' : 'hidden'}`}
              onClick={() => {
                profileImageRef.current?.value &&
                  (profileImageRef.current.value = '');
                setProfileImageFile(null);
                setIsProfileImageRemoved(true);
              }}
            >
              Remove
            </Button>
          </div>
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
    middleName?: string;
    userName: string;
    mobileNumber?: string;
    email: string;
    intro?: string;
    profileImage?: {
      mediaId: string;
      url: string;
    };
    registratedAt: string;
  };
};
