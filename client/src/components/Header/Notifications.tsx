import React from 'react';
import { gql } from '@apollo/client';
import {
  NotificationElement,
  NotificationElementGQLData,
} from './NotificationElement';

export const Notifications = ({ user }: NotificationsProps) => {
  const { notifications } = user;

  return (
    <>
      <div>Notifications</div>
      {notifications.map((notification) => (
        <NotificationElement
          notification={notification}
          key={notification.notificationId.toString()}
        />
      ))}
    </>
  );
};

Notifications.fragments = {
  user: gql`
    fragment Notifications on User {
      notifications(showAll: true) {
        notificationId
        ...NotificationElement
      }
    }

    ${NotificationElement.fragments.notification}
  `,
};

export type NotificationsGQLData = {
  notifications: ({
    notificationId: String;
  } & NotificationElementGQLData)[];
};

type NotificationsProps = {
  user: NotificationsGQLData;
};
