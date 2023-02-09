import { useParams, useSearchParams } from 'react-router-dom';
import { Group } from '../components/Group/Group';

export const GroupPage = () => {
  const { groupId, messageId } = useParams < {
    groupId: string;
    messageId?: string;
  }>();

  const [searchParams] = useSearchParams();
  const maxDepth = searchParams.get('max-depth');

  return (
    <>
      {groupId && (
        <Group
          groupId={groupId}
          onlyInterestedInMessageId={messageId}
          maxDepth={maxDepth ? parseInt(maxDepth) : undefined}
        />
      )}
    </>
  );
};
