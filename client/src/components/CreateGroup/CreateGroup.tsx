import { Input, Select, Button } from 'react-daisyui';
import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const CREATE_GROUP_MUTATION = gql`
  mutation CreateGroup($group: GroupInput!) {
    createGroup(group: $group) {
      groupId
      name
      description
      visibility
    }
  }
`;

type CreateGroupMutationGQLData = {
  createGroup: {
    groupId: string;
    name: string;
    description: string;
    visibility: string;
  };
};

export const CreateGroup = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');

  const [createGroup] = useMutation<CreateGroupMutationGQLData>(CREATE_GROUP_MUTATION);

  const groupVisibilityOptions = [
    { value: 'visible', label: 'Visible to everyone' },
    { value: 'hidden', label: 'Only visible to members' },
    { value: 'open', label: 'Open to everyone' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (name.length > 0 && description.length > 0) {
      const { data } = await createGroup({
        variables: {
          group: {
            name,
            description,
            visibility,
          },
        },
      });

      if (data) {
        window.location.href = `/group/${data.createGroup.groupId}`;
      }
    }
  };

  return (
    <div className='container max-w-fit bg-black/20 rounded-md p-4'>
      <h1 className='text-3xl font-bold text-center mb-4'>Create Group</h1>
      <form
        className='flex items-center justify-center gap-2'
        onSubmit={handleSubmit}
      >
        <div className='form-control max-w-xs'>
          <label className='label pt-0'>
            <span className='label-text'>Group Name</span>
          </label>
          <Input
            type='text'
            name='name'
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>Description</span>
          </label>
          <Input
            type='text'
            name='description'
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className='label'>
            <span className='label-text'>Visibility</span>
          </label>
          <Select
            name='visibility'
            id='visibility'
            value={visibility}
            onChange={(value) => setVisibility(value)}
          >
            {groupVisibilityOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
          <div className='pt-2'>
            <Button type='submit' className='w-full btn-primary'>
              Create Group
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
