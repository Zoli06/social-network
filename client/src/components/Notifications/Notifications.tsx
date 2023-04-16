import { gql, useMutation, useQuery } from '@apollo/client';
import { Button } from 'react-daisyui';
import { Notification, NotificationGQLData } from './Notification';

const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    me {
      userId
      notifications(showAll: true) {
        notificationId
        createdAt
        seenAt
        ...Notification
      }
    }
  }

  ${Notification.fragments.notification}
`;

const CHECK_ALL_NOTIFICATIONS_MUTATION = gql`
  mutation CheckAllNotifications {
    checkAllNotifications
  }
`;

export const Notifications = () => {
  const { data, loading, error } =
    useQuery<NotificationsQueryGQLData>(NOTIFICATIONS_QUERY);
  const [checkAllNotifications] = useMutation(
    CHECK_ALL_NOTIFICATIONS_MUTATION,
    {
      update(cache, { data: { checkAllNotifications } }) {
        if (checkAllNotifications) {
          cache.modify({
            id: cache.identify({
              __typename: 'User',
              userId: data!.me.userId,
            }),
            fields: {
              notifications(currentNotifications) {
                return currentNotifications.map(
                  (currentNotification: { seenAt: string }) => {
                    return { ...currentNotification, seenAt: Date.now() };
                  }
                );
              },
            },
          });
        }
      },
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div className='overflow-x-auto max-w-xl flex justify-center flex-col items-center pb-2 bg-black/20 p-4 rounded-md relative min-w-0 md:min-w-[30rem]'>
      <h1 className='text-2xl font-bold md:mb-4'>Notifications</h1>
      <Button
        className='md:absolute md:top-4 md:right-4 md:self-start md:w-auto md:mt-0 md:mb-0 w-full mt-2 mb-2 max-w-xs'
        onClick={() => checkAllNotifications()}
      >
        Check all
      </Button>
      <div className='w-full'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-xl font-bold'>Today</h2>
          {(() => {
            const todayNotifications = data!.me.notifications.filter(
              (
                notification: NotificationsQueryGQLData['me']['notifications'][0]
              ) => {
                const createdAt = new Date(notification.createdAt);
                const today = new Date();
                return (
                  createdAt.getDate() === today.getDate() &&
                  createdAt.getMonth() === today.getMonth() &&
                  createdAt.getFullYear() === today.getFullYear()
                );
              }
            );

            if (todayNotifications.length === 0) {
              return <p className='pl-2'>No notifications today</p>;
            } else {
              return todayNotifications.map(
                (notification: NotificationGQLData) => (
                  <Notification
                    notification={notification}
                    key={notification.notificationId.toString()}
                  />
                )
              );
            }
          })()}
        </div>
        <div className='flex flex-col gap-2'>
          <h2 className='text-xl font-bold'>Earlier</h2>
          {(() => {
            const earlierNotifications = data!.me.notifications.filter(
              (
                notification: NotificationsQueryGQLData['me']['notifications'][0]
              ) => {
                const createdAt = new Date(notification.createdAt);
                const today = new Date();
                return (
                  createdAt.getDate() !== today.getDate() ||
                  createdAt.getMonth() !== today.getMonth() ||
                  createdAt.getFullYear() !== today.getFullYear()
                );
              }
            );

            if (earlierNotifications.length === 0) {
              return <p className='pl-2'>No notifications earlier</p>;
            } else {
              return earlierNotifications.map(
                (notification: NotificationGQLData) => (
                  <Notification
                    notification={notification}
                    key={notification.notificationId.toString()}
                  />
                )
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

type NotificationsQueryGQLData = {
  me: {
    userId: string;
    notifications: ({
      notificationId: number;
      createdAt: string;
      seenAt: string | null;
    } & NotificationGQLData)[];
  };
};
