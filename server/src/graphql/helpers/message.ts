export const deleteMessageAndReplies = async (
  messageId: number,
  connection: any
) => {
  let messagesToDelete: string[] = [];

  const findMessagesToDeleteRecursively = async (messageId: number) => {
    messagesToDelete.push(messageId.toString());
    const responses = (
      await connection.query(
        `SELECT message_id FROM messages WHERE response_to_message_id = ? `,
        [messageId]
      )
    )[0];
    if (responses.length > 0) {
      for (const response of responses) {
        await findMessagesToDeleteRecursively(response.message_id);
      }
    }
  };

  await findMessagesToDeleteRecursively(messageId);

  //TODO: maybe we can execute the first three query simultaneously
  await connection.query(`DELETE FROM reactions WHERE message_id IN (?) `, [
    messagesToDelete,
  ]);

  await connection.query(
    `DELETE FROM mentioned_users WHERE message_id IN (?) `,
    [messagesToDelete]
  );

  await connection.query(
    `DELETE FROM message_medias WHERE message_id IN (?) `,
    [messagesToDelete]
  );

  await connection.query(`DELETE FROM votes WHERE message_id IN (?) `, [
    messagesToDelete,
  ]);

  messagesToDelete = messagesToDelete.reverse();

  for (const message of messagesToDelete) {
    await connection.query(`DELETE FROM messages WHERE message_id = ? `, [
      message,
    ]);
  }

  return messagesToDelete;
};

export const deleteAllMessagesFromGroup = async (
  groupId: number,
  connection: any
) => {
  const rootMessageIds = (
    await connection.query(
      `
      SELECT message_id FROM messages
      WHERE group_id = ?
    `,
      [groupId]
    )
  )[0].map(({ message_id }: { message_id: number }) => {
    return message_id;
  });

  rootMessageIds.forEach(async (rootMessageId: number) => {
    await deleteMessageAndReplies(rootMessageId, connection);
  });

  return rootMessageIds;
};

export const deleteUserReactions = async (userId: number, connection: any) => {
  await connection.query(`DELETE FROM reactions WHERE user_id = ?`, [userId]);
}
