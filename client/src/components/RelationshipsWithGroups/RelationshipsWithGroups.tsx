import { gql, useQuery } from '@apollo/client';
import {
  RelationshipWithGroupCategory,
  RelationshipWithGroupCategoryGQLData,
} from './RelationshipWithGroupCategory';

export const RelationshipsWithGroups = () => {
  const { data, loading, error } =
    useQuery<RelationshipsWithGroupsQueryGQLData>(
      RELATIONSHIP_WITH_GROUPS_QUERY
    );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error(error);
    return <div>Error</div>;
  }

  const {
    me: {
      createdGroups,
      adminOfGroups: _adminOfGroups,
      memberOfGroups,
      bannedFromGroups,
      sentMemberRequestsToGroups,
      groupsRejectedMemberRequest,
      invitedToGroups,
    },
  } = data!;
  const adminOfGroups = _adminOfGroups.filter((relationship) => {
    return !createdGroups.some((createdGroup) => {
      return createdGroup.group.groupId === relationship.group.groupId;
    });
  });

  return (
    <div className='bg-black/20 rounded-md p-4 flex flex-col gap-4'>
      <h1 className='text-3xl font-bold text-center'>
        My relationships with groups
      </h1>
      <RelationshipWithGroupCategory
        title='Groups created by you'
        groups={createdGroups.map((relationship) => relationship.group)}
        noGroupsMessage='You have not created any groups'
      />
      <RelationshipWithGroupCategory
        title='Groups you are an admin of'
        groups={adminOfGroups.map((relationship) => relationship.group)}
        noGroupsMessage='You are not an admin of any groups'
      />
      <RelationshipWithGroupCategory
        title='Groups you are a member of'
        groups={memberOfGroups.map((relationship) => relationship.group)}
        noGroupsMessage='You are not a member of any groups'
      />
      <RelationshipWithGroupCategory
        title='Groups you are banned from'
        groups={bannedFromGroups.map((relationship) => relationship.group)}
        noGroupsMessage='You are not banned from any groups'
      />
      <RelationshipWithGroupCategory
        title='Groups you sent a member request to'
        groups={sentMemberRequestsToGroups.map(
          (relationship) => relationship.group
        )}
        noGroupsMessage='You have not sent any member requests'
      />
      <RelationshipWithGroupCategory
        title='Groups that rejected your member request'
        groups={groupsRejectedMemberRequest.map(
          (relationship) => relationship.group
        )}
        noGroupsMessage='You have not been rejected from any groups'
      />
      <RelationshipWithGroupCategory
        title='Groups you were invited to'
        groups={invitedToGroups.map((relationship) => relationship.group)}
        noGroupsMessage='You have not been invited to any groups'
      />
    </div>
  );
};

const RELATIONSHIP_WITH_GROUPS_QUERY = gql`
  query GetRelationshipsWithGroups {
    me {
      userId

      createdGroups {
        group {
          groupId
          ...RelationshipWithGroupCategory
        }
      }

      adminOfGroups {
        group {
          groupId
          ...RelationshipWithGroupCategory
        }
      }

      memberOfGroups {
        group {
          groupId
          ...RelationshipWithGroupCategory
        }
      }

      bannedFromGroups {
        group {
          groupId
          ...RelationshipWithGroupCategory
        }
      }

      sentMemberRequestsToGroups {
        group {
          groupId
          ...RelationshipWithGroupCategory
        }
      }

      groupsRejectedMemberRequest {
        group {
          groupId
          ...RelationshipWithGroupCategory
        }
      }

      invitedToGroups {
        group {
          groupId
          ...RelationshipWithGroupCategory
        }
      }
    }
  }

  ${RelationshipWithGroupCategory.fragments.group}
`;

export type RelationshipsWithGroupsQueryGQLData = {
  me: {
    createdGroups: {
      group: {
        groupId: string;
      } & RelationshipWithGroupCategoryGQLData;
    }[];

    adminOfGroups: {
      group: {
        groupId: string;
      } & RelationshipWithGroupCategoryGQLData;
    }[];

    memberOfGroups: {
      group: {
        groupId: string;
      } & RelationshipWithGroupCategoryGQLData;
    }[];

    bannedFromGroups: {
      group: {
        groupId: string;
      } & RelationshipWithGroupCategoryGQLData;
    }[];

    sentMemberRequestsToGroups: {
      group: {
        groupId: string;
      } & RelationshipWithGroupCategoryGQLData;
    }[];

    groupsRejectedMemberRequest: {
      group: {
        groupId: string;
      } & RelationshipWithGroupCategoryGQLData;
    }[];

    invitedToGroups: {
      group: {
        groupId: string;
      } & RelationshipWithGroupCategoryGQLData;
    }[];
  };
};
