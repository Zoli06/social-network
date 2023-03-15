import { gql } from '@apollo/client';
import { ProfileImage, ProfileImageGQLData } from '../User/ProfileImage';
import { Navbar, Button, Form, Input, Dropdown } from 'react-daisyui';
import { FormEvent, useState } from 'react';

export const Header = ({ user }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();

    window.location.href = `/search?q=${searchQuery}`;
  };

  return (
    <div className='flex w-full component-preview p-4 items-center justify-center gap-2 font-sans'>
      <Navbar>
        <div className='flex-1'>
          <a href='/'>
            <Button className='text-xl normal-case' color='ghost'>
              Social network
            </Button>
          </a>
        </div>
        <div className='flex-none gap-2'>
          <Form onSubmit={handleSearch}>
            {/* TODO: hide below md and show icon instead */}
            <Input
              bordered
              type='text'
              placeholder='Search'
              className='md:block hidden'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form>
          <Dropdown vertical='end'>
            <Button color='ghost' className='avatar' shape='circle'>
              <ProfileImage user={user} size='xs' />
            </Button>
            <Dropdown.Menu className='w-52 menu-compact'>
              <Dropdown.Item href={`/user/${user.userId}`}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item href='/notifications' className='justify-between'>
                Notifications
                <span
                  className={`badge badge-primary ${
                    user.notifications.length > 0 ? 'block' : 'hidden'
                  }`}
                >
                  {user.notifications.length}
                </span>
              </Dropdown.Item>
              <Dropdown.Item href='/create-group'>
                Create group
              </Dropdown.Item>
              <Dropdown.Item href='/logout'>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Navbar>
    </div>
  );
};

Header.fragments = {
  user: gql`
    fragment Header on User {
      userId
      ...ProfileImage

      # we query 'showAll: false' because we only want to show the badge if there are new notifications
      notifications(showAll: false) {
        notificationId
      }
    }

    ${ProfileImage.fragments.user}
  `,
};

export type HeaderGQLData = {
  userId: String;
  notifications: {
    notificationId: String;
  }[];
} & ProfileImageGQLData;

type HeaderProps = {
  user: HeaderGQLData;
};
