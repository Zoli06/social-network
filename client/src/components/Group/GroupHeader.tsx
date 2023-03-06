import { gql } from '@apollo/client';
import { Avatar } from 'react-daisyui';
import { SvgButton } from '../../utilities/SvgButton';
import { useContext } from 'react';
import { UserContext } from '../../App';
import { GroupActions, GroupActionsGQLData } from './GroupActions';

export const GroupHeader = ({
  group: {
    groupId,
    name,
    indexImage: { url: indexImageUrl },
    bannerImage: { url: bannerImageUrl },
    creatorUser,
    myRelationshipWithGroup: { type: myRelationShipWithGroupType },
  },
  group,
  displayActions = true,
  redirectToInfoPage = false,
}: GroupHeaderProps) => {
  const { userId: loggedInUserId } = useContext(UserContext)!;

  const isAdmin = myRelationShipWithGroupType === 'admin';
  const isCreator = creatorUser.userId === loggedInUserId;

  return (
    <div className='w-full'>
      <img
        src={bannerImageUrl}
        alt='Banner'
        className='w-full h-32 object-cover'
      />
      <div className='flex justify-between items-center gap-4'>
        <div>
          <div className='-mt-6 flex items-center gap-4 pl-4 w-max'>
            <a href={`/group/${groupId}`}>
              <Avatar
                src={indexImageUrl}
                shape='circle'
                className='rounded-full border-4 border-white'
              />
            </a>
            <h1 className='text-2xl font-bold'>{name}</h1>
            {(isAdmin || isCreator) && (
              <SvgButton
                icon='settings'
                onClick={() => {
                  window.location.href = `/group/${groupId}/admin`;
                }}
              />
            )}
          </div>
        </div>
        <div className={`${displayActions ? '' : 'hidden'} -mt-6`}>
          <GroupActions group={group} redirectToInfoPage={redirectToInfoPage} />
        </div>
      </div>
    </div>
  );
};

GroupHeader.fragments = {
  group: gql`
    fragment GroupHeader on Group {
      groupId
      name
      creatorUser {
        userId
      }
      myRelationshipWithGroup {
        type
      }
      indexImage {
        mediaId
        url
      }
      bannerImage {
        mediaId
        url
      }

      ...GroupActions
    }

    ${GroupActions.fragments.group}
  `,
};

export type GroupHeaderGQLData = {
  groupId: number;
  name: string;
  creatorUser: {
    userId: string;
  };
  myRelationshipWithGroup: {
    type:
      | 'member'
      | 'banned'
      | 'admin'
      | 'member_request'
      | 'member_request_rejected'
      | 'invited'
      | null;
  };
  indexImage: {
    mediaId: number;
    url: string;
  };
  bannerImage: {
    mediaId: number;
    url: string;
  };
} & GroupActionsGQLData;

type GroupHeaderProps = {
  group: GroupHeaderGQLData;
  displayActions?: boolean;
  redirectToInfoPage?: boolean;
};
