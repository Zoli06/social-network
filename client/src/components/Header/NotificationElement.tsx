import { gql, useMutation } from '@apollo/client';
import React from 'react';
import { Navigate } from 'react-router-dom';

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
    <div
      style={{ backgroundColor: seenAt ? '' : 'lightblue' }}
      onClick={handleCheckNotification}
    >
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
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
  notificationId: String;
  title: String;
  description?: String;
  seenAt: String | null;
  urlPath: String;
};

type NotificationElementProps = {
  notification: NotificationElementGQLData;
};
