import { merge, camelCase } from 'lodash';
import { shield, deny, allow, rule } from 'graphql-shield';

import groupPermissions from './permissions/group';
import messagePermissions from './permissions/message';
import mediaPermissions from './permissions/media';
import userPermissions from './permissions/user';
import { ShieldRule } from 'graphql-shield/typings/types';

const { NODE_ENV } = process.env;

const permissions = merge(
  groupPermissions,
  messagePermissions,
  mediaPermissions,
  userPermissions
);
const isProduction = NODE_ENV === 'production';

export default shield(permissions as unknown as ShieldRule, {
  debug: !isProduction,
  allowExternalErrors: !isProduction,
  fallbackRule: isProduction
    ? deny
    : rule()((parent, args, ctx, info) => {
        console.error(
          `Error: No permission defined for field '${camelCase(
            info.fieldName
          )}'. Resolving this field will be disabled in production`
        );
        return true;
      }),
});
