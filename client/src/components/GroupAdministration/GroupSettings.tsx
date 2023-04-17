import { gql } from '@apollo/client';
import { openEditor } from '../Editor/Editor';
import { useMutation } from '@apollo/client';
import { Avatar, Button, Select } from 'react-daisyui';
import { SvgButton } from '../../utilities/SvgButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const UPDATE_GROUP_MUTATION = gql`
  mutation UpdateGroup($group: GroupInput!, $groupId: ID!) {
    updateGroup(group: $group, groupId: $groupId) {
      groupId
      name
      description
      visibility
      indexImage {
        mediaId
        url
      }
      bannerImage {
        mediaId
        url
      }
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

const groupVisibilityOptions = [
  { value: 'visible', label: 'Visible to everyone' },
  { value: 'hidden', label: 'Only visible to members' },
  { value: 'open', label: 'Open to everyone' },
];

export const GroupSettings = ({
  group: { groupId, name, description, visibility, indexImage, bannerImage },
}: GroupSettingsProps) => {
  const [updateGroup] = useMutation(UPDATE_GROUP_MUTATION, {
    update(cache, { data: { updateGroup } }) {
      cache.modify({
        id: cache.identify({
          __typename: 'Group',
          groupId,
        }),
        fields: {
          name: () => updateGroup.name,
          description: () => updateGroup.description,
          visibility: () => updateGroup.visibility,
          indexImage: () => updateGroup.indexImage,
          bannerImage: () => updateGroup.bannerImage,
        },
      });
    },
  });

  const [createMedia] = useMutation(CREATE_MEDIA_MUTATION, {
    context: {
      headers: {
        'Apollo-Require-Preflight': 'true',
      },
    },
  });

  const handleEditName = (name: string) => {
    updateGroup({
      variables: {
        groupId,
        group: {
          name,
          description,
          visibility,
          indexImageMediaId: indexImage?.mediaId,
          bannerImageMediaId: bannerImage?.mediaId,
        },
      },
    });
  };

  const handleEditDescription = (description: string) => {
    updateGroup({
      variables: {
        groupId,
        group: {
          name,
          description,
          visibility,
          indexImageMediaId: indexImage?.mediaId,
          bannerImageMediaId: bannerImage?.mediaId,
        },
      },
    });
  };

  const handleEditIndexImage = async (indexImage: File) => {
    const {
      data: {
        createMedia: { mediaId },
      },
    } = await createMedia({
      variables: {
        media: {
          file: indexImage,
        },
      },
    });

    updateGroup({
      variables: {
        groupId,
        group: {
          name,
          description,
          visibility,
          indexImageMediaId: mediaId,
          bannerImageMediaId: bannerImage?.mediaId,
        },
      },
    });
  };

  const handleEditBannerImage = async (bannerImage: File) => {
    const {
      data: {
        createMedia: { mediaId },
      },
    } = await createMedia({
      variables: {
        media: {
          file: bannerImage,
        },
      },
    });

    updateGroup({
      variables: {
        groupId,
        group: {
          name,
          description,
          visibility,
          indexImageMediaId: indexImage?.mediaId,
          bannerImageMediaId: mediaId,
        },
      },
    });
  };

  const handleRemoveIndexImage = () => {
    updateGroup({
      variables: {
        groupId,
        group: {
          name,
          description,
          visibility,
          indexImageMediaId: null,
          bannerImageMediaId: bannerImage?.mediaId,
        },
      },
    });
  };

  const handleRemoveBannerImage = () => {
    updateGroup({
      variables: {
        groupId,
        group: {
          name,
          description,
          visibility,
          indexImageMediaId: indexImage?.mediaId,
          bannerImageMediaId: null,
        },
      },
    });
  };

  return (
    <div>
      <h1 className='text-xl font-bold text-center mt-4'>Settings</h1>
      <div className='flex justify-between items-start gap-2'>
        <div>
          <h2 className='text-lg font-bold'>Name</h2>
          <p>{name}</p>
        </div>
        <div>
          <SvgButton
            onClick={() => openEditor(handleEditName, name, false)}
            icon='edit'
          />
        </div>
      </div>
      <div className='flex justify-between items-start gap-2'>
        <div>
          <h2 className='text-lg font-bold'>Description</h2>
          <ReactMarkdown children={description} remarkPlugins={[remarkGfm]} />
        </div>
        <div>
          <SvgButton
            onClick={() => openEditor(handleEditDescription, description)}
            icon='edit'
          />
        </div>
      </div>
      <div>
        <h2 className='text-lg font-bold'>Visibility</h2>
        <Select
          value={visibility}
          onChange={(visibility) => {
            updateGroup({
              variables: {
                groupId,
                group: {
                  name,
                  description,
                  visibility,
                },
              },
            });
          }}
          className='w-full'
        >
          {groupVisibilityOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div>
        <h2 className='text-lg font-bold'>Index image</h2>
        <div className='flex justify-between items-center gap-4'>
          <label>
            <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                e.target.files && handleEditIndexImage(e.target.files[0]);
              }}
            />
            {indexImage ? (
              <Avatar
                src={indexImage?.url}
                shape='circle'
                size='md'
                className='cursor-pointer'
              />
            ) : (
              <p className='btn'>Upload image</p>
            )}
          </label>
          {indexImage && (
            <Button
              color='secondary'
              className='flex-grow'
              onClick={handleRemoveIndexImage}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      <div>
        <h2 className='text-lg font-bold'>Banner image</h2>
        <div className='flex flex-col gap-4'>
          <label>
            <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                e.target.files && handleEditBannerImage(e.target.files[0]);
              }}
            />
            {bannerImage ? (
              <img
                src={bannerImage?.url}
                className='cursor-pointer'
                alt='Banner'
              />
            ) : (
              <p className='btn'>Upload image</p>
            )}
          </label>
          {bannerImage && (
            <Button
              color='secondary'
              className='w-full'
              onClick={handleRemoveBannerImage}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

GroupSettings.fragments = {
  group: gql`
    fragment GroupSettings on Group {
      groupId
      name
      description
      visibility
      notificationFrequency
      createdAt
      indexImage {
        mediaId
        url
      }
      bannerImage {
        mediaId
        url
      }

      myRelationshipWithGroup {
        type
      }
    }
  `,
};

export type GroupSettingsGQLData = {
  groupId: string;
  name: string;
  description: string;
  visibility: 'visible' | 'hidden' | 'open';
  notificationFrequency: 'off' | 'low' | 'frequent';
  createdAt: string;
  indexImage?: {
    mediaId: string;
    url: string;
  };
  bannerImage?: {
    mediaId: string;
    url: string;
  };

  myRelationshipWithGroup: {
    type: string;
  };
};

type GroupSettingsProps = {
  group: GroupSettingsGQLData;
};
