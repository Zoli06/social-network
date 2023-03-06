import { gql, useMutation } from '@apollo/client';
import { Artboard } from 'react-daisyui';

const CHECK_NOTIFICATION_MUTATION = gql`
  mutation CheckNotificationMutation($notificationId: ID!) {
    checkNotification(notificationId: $notificationId)
  }
`;

export const NotificationElement = ({
  notification: { notificationId, seenAt, title, description, urlPath },
}: NotificationElementProps) => {
  const [checkNotification] = useMutation(CHECK_NOTIFICATION_MUTATION);

  const handleCheckNotification = async () => {
    await checkNotification({
      variables: {
        notificationId,
      },
    });

    window.location.href = window.location.origin + urlPath;
  };

  return (
    <Artboard
      onClick={handleCheckNotification}
      className={`rounded-md p-2 cursor-pointer dark:hover:bg-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 w-full
      ${!seenAt ? 'dark:bg-gray-600 dark:text-gray-300 bg-gray-200' : ''}
      `}
    >
      <h1 className='text-xl font-bold w-full text-left'>{title}</h1>
      <p className='text-sm w-full text-left'>{description}</p>
    </Artboard>
  );
};

NotificationElement.fragments = {
  notification: gql`
    fragment NotificationElement on Notification {
      notificationId
      title
      description
      seenAt
      urlPath
    }
  `,
};

export type NotificationElementGQLData = {
  notificationId: string;
  title: string;
  description?: string;
  seenAt: string | null;
  urlPath: string;
};

type NotificationElementProps = {
  notification: NotificationElementGQLData;
};
