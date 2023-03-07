import { gql, useQuery } from '@apollo/client';
import {
  Notification,
  NotificationGQLData,
} from './Notification';

const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    me {
      userId
      notifications(showAll: true) {
        notificationId
        createdAt
        ...Notification
      }
    }
  }

  ${Notification.fragments.notification}
`;

export const Notifications = () => {
  const { data, loading, error } =
    useQuery<NotificationsQueryGQLData>(NOTIFICATIONS_QUERY);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div className='overflow-x-auto flex justify-center flex-col items-center pb-2 bg-black/20 p-4 rounded-md'>
      <h1 className='text-2xl font-bold mb-4'>Notifications</h1>
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
    notifications: ({
      notificationId: number;
      createdAt: string;
    } & NotificationGQLData)[];
  };
};
