import { and } from 'graphql-shield';
import { isAuthenticated, isMediaOwner } from './rules';

export default {
  // TODO: When media is fully implemented, add permissions for media
  // Maybe I will need to add new columns to the 'medias' table
  Query: {
    media: and(isAuthenticated, isMediaOwner),
  },
  Mutation: {
    createMedia: isAuthenticated,
    deleteMedia: and(isAuthenticated, isMediaOwner),
  },
  Media: {
    mediaId: isAuthenticated,
    createdAt: isAuthenticated,
    updatedAt: isAuthenticated,
    url: isAuthenticated,
    user: isAuthenticated,
    caption: isAuthenticated,
  },
};
