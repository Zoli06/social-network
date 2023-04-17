import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import context, { Context } from '../context';
import { deleteUser } from '../helpers/user';

const resolvers = {
  Query: {
    async user(
      _: any,
      { userId }: { userId: number },
      { connection }: Context
    ) {
      return (
        await connection.query(`SELECT * FROM users WHERE user_id = ?`, [
          userId,
        ])
      )[0][0];
    },
    async me(_: any, __: any, context: Context) {
      return await resolvers.Query.user(
        _,
        { userId: context.user.userId },
        context
      );
    },
    async searchUsers(
      _: any,
      { query }: { query: String },
      { connection }: Context
    ) {
      return (
        await connection.query(
          `
            SELECT * FROM users
            WHERE MATCH(first_name, last_name, middle_name, user_name, intro) AGAINST (? IN NATURAL LANGUAGE MODE)
          `,
          [query]
        )
      )[0];
    },
  },
  Mutation: {
    async register(
      _: any,
      {
        user: {
          firstName,
          lastName,
          middleName,
          userName,
          mobileNumber,
          email,
          password,
          intro,
          profileImageMediaId,
        },
      }: {
        user: {
          firstName: string;
          lastName: string;
          middleName: string;
          userName: string;
          mobileNumber: string;
          email: string;
          password: string;
          intro: string;
          profileImageMediaId: number;
        };
      },
      context: Context
    ) {
      const { connection } = context;
      const userId = (
        await connection.query(
          `INSERT INTO users (first_name, last_name, middle_name, user_name, mobile_number, email, password, intro, profile_image_media_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            firstName,
            lastName,
            middleName,
            userName,
            mobileNumber || null,
            email,
            await bcrypt.hash(password, 10),
            intro,
            profileImageMediaId,
          ]
        )
      )[0].insertId;
      const user = await resolvers.Query.user({}, { userId }, context);
      const token = jsonwebtoken.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET!,
        // TODO: move expiresIn to config
        { expiresIn: '1d' }
      );
      return { token, user };
    },
    async login(
      _: any,
      { email, password }: { email: string; password: string },
      { connection }: Context
    ) {
      const user = (
        await connection.query(`SELECT * FROM users WHERE email = ?`, [email])
      )[0][0];
      if (!user) {
        throw new Error('No user with that email');
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Incorrect password');
      }
      const token = jsonwebtoken.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' }
      );
      return {
        token,
        user,
      };
    },
    async updateMe(
      _: any,
      {
        user: {
          firstName,
          lastName,
          middleName,
          userName,
          mobileNumber,
          email,
          password,
          intro,
          profileImageMediaId,
        },
      }: {
        user: {
          firstName: string;
          lastName: string;
          middleName: string;
          userName: string;
          mobileNumber: string;
          email: string;
          password: string;
          intro: string;
          profileImageMediaId: number;
        };
      },
      context: Context
    ) {
      const { user, connection } = context;
      const _user = (
        await connection.query(`SELECT * FROM users WHERE user_id = ?`, [
          user.userId,
        ])
      )[0][0];
      await connection.query(
        `UPDATE users
          SET first_name = ?, last_name = ?, middle_name = ?, user_name = ?, mobile_number = ?, email = ?, password = ?, updated_at = DEFAULT, intro = ?, profile_image_media_id = ?
          WHERE user_id = ?`,
        [
          firstName,
          lastName,
          middleName,
          userName,
          mobileNumber || null,
          email,
          password ? await bcrypt.hash(password, 10) : _user.password,
          intro,
          profileImageMediaId,
          user.userId,
        ]
      );
      return await resolvers.Query.user({}, { userId: user.userId }, context);
    },
    async deleteMe(_: any, __: any, context: Context) {
      const { user, connection } = context;
      await deleteUser(user.userId, connection);
      return true;
    },
    async createUserUserRelationship(
      _: any,
      { userId, type }: { userId: number; type: string | null },
      context: Context
    ) {
      const { user, connection, sendNotifications } = context;
      if (type === 'none') type = null;
      await connection.query(
        `INSERT INTO user_user_relationships (initiating_user_id, target_user_id, type) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE type = ?, updated_at = DEFAULT`,
        [user.userId, userId, type, type]
      );
      const myRelationshipWithUser =
        await resolvers.User.myRelationshipWithUser(
          { user_id: userId },
          {},
          context
        );

      const myData = await resolvers.Query.user(
        {},
        { userId: user.userId },
        context
      );
      if (myRelationshipWithUser.type === 'friend') {
        await sendNotifications({
          userIds: [userId],
          title: `${myData.first_name} ${myData.last_name} accepted your friend request`,
          urlPath: `/user/${user.userId}`,
        });
      } else if (myRelationshipWithUser.type === 'outgoing_friend_request') {
        await sendNotifications({
          userIds: [userId],
          title: `${myData.first_name} ${myData.last_name} sent you a friend request`,
          urlPath: `/user/${user.userId}`,
        });
      }

      return myRelationshipWithUser;
    },
    async checkNotification(
      _: any,
      { notificationId }: { notificationId: number },
      context: Context
    ) {
      const { user, connection } = context;
      // TODO: auto update updated_at in database
      await connection.query(
        `UPDATE notifications as n
        JOIN user_notifications as un
        ON un.notification_id = n.notification_id
        SET un.seen_at = NOW(), n.updated_at = DEFAULT
        WHERE n.notification_id = ?`,
        [notificationId]
      );
      return true;
    },
    async checkAllNotifications(
      _: any,
      __: any,
      { user, connection }: Context
    ) {
      await connection.query(
        `UPDATE notifications as n
        JOIN user_notifications as un
        ON un.notification_id = n.notification_id
        SET un.seen_at = NOW(), n.updated_at = DEFAULT
        WHERE un.user_id = ?`,
        [user.userId]
      );
      return true;
    },
  },
  User: {
    async userRelationships(parent: any, _: any, context: Context) {
      return [
        ...(await this.friends(parent, _, context)),
        ...(await this.incomingFriendRequests(parent, _, context)),
        ...(await this.outgoingFriendRequests(parent, _, context)),
        ...(await this.blockedUsers(parent, _, context)),
      ];
    },
    async friends({ user_id }: { user_id: number }, _: any, context: Context) {
      const { connection } = context;
      const pointOfViewUser = await resolvers.Query.user(
        {},
        { userId: user_id },
        context
      );

      return (
        await connection.query(
          `SELECT users.*, uur1.*, LEAST(uur1.created_at, uur2.created_at) AS real_created_at, GREATEST(uur1.updated_at, uur2.updated_at) AS real_updated_at
      FROM user_user_relationships AS uur1
      JOIN user_user_relationships AS uur2
      ON uur1.initiating_user_id = uur2.target_user_id AND uur1.target_user_id = uur2.initiating_user_id
      JOIN users
      ON user_id = uur1.initiating_user_id
      WHERE 
        uur1.type = 'friend'
        AND uur2.type = 'friend'
        AND (uur1.initiating_user_id = :id OR uur1.target_user_id = :id)
        AND user_id != :id
      GROUP BY user_id`,
          { id: user_id }
        )
      )[0].map(
        (record: {
          user: any;
          type: any;
          real_created_at: any;
          real_updated_at: any;
        }) => {
          return {
            target_user: record,
            point_of_view_user: pointOfViewUser,
            type: record.type,
            created_at: record.real_created_at,
            updated_at: record.real_updated_at,
          };
        }
      );
    },
    async incomingFriendRequests(
      { user_id }: { user_id: number },
      _: any,
      context: Context
    ) {
      const { connection } = context;
      const pointOfViewUser = await resolvers.Query.user(
        {},
        { userId: user_id },
        context
      );

      return (
        await connection.query(
          `SELECT *
        FROM user_user_relationships AS uur1
        LEFT JOIN user_user_relationships AS uur2
        ON uur1.initiating_user_id = uur2.target_user_id AND uur1.target_user_id = uur2.initiating_user_id
        JOIN users
        ON user_id = uur1.initiating_user_id
        WHERE
          uur1.type = 'friend'
          AND ((uur2.type != 'friend' AND uur2.type != 'blocked' AND uur1.updated_at > uur2.updated_at) OR uur2.type IS NULL)
          AND uur1.target_user_id = :id
          AND user_id != :id`,
          { id: user_id }
        )
      )[0].map(
        (record: {
          user: any;
          type: any;
          created_at: any;
          updated_at: any;
        }) => ({
          target_user: record,
          point_of_view_user: pointOfViewUser,
          type: 'incoming_friend_request',
          created_at: record.created_at,
          updated_at: record.updated_at,
        })
      );
    },
    async outgoingFriendRequests(
      { user_id }: { user_id: number },
      _: any,
      context: Context
    ) {
      const { connection } = context;
      const pointOfViewUser = await resolvers.Query.user(
        {},
        { userId: user_id },
        context
      );

      return (
        await connection.query(
          `SELECT *
        FROM user_user_relationships AS uur1
        LEFT JOIN user_user_relationships AS uur2
        ON uur1.initiating_user_id = uur2.target_user_id AND uur1.target_user_id = uur2.initiating_user_id
        JOIN users
        ON user_id = uur1.target_user_id
        WHERE
          uur1.type = 'friend'
          AND ((uur2.type != 'friend' AND uur2.type != 'blocked' AND uur1.updated_at > uur2.updated_at) OR uur2.type IS NULL)
          AND uur1.initiating_user_id = :id
          AND user_id != :id`,
          { id: user_id }
        )
      )[0].map(
        (record: {
          user: any;
          type: any;
          created_at: any;
          updated_at: any;
        }) => ({
          target_user: record,
          point_of_view_user: pointOfViewUser,
          type: 'outgoing_friend_request',
          created_at: record.created_at,
          updated_at: record.updated_at,
        })
      );
    },
    async blockedUsers(
      { user_id }: { user_id: number },
      _: any,
      context: Context
    ) {
      const { connection } = context;
      const pointOfViewUser = await resolvers.Query.user(
        {},
        { userId: user_id },
        context
      );

      return (
        await connection.query(
          `SELECT *
        FROM user_user_relationships
        JOIN users
        ON user_id = target_user_id
        WHERE type = 'blocked' AND initiating_user_id = ?`,
          [user_id]
        )
      )[0].map(
        (record: {
          user: any;
          type: any;
          created_at: any;
          updated_at: any;
        }) => ({
          target_user: record,
          point_of_view_user: pointOfViewUser,
          type: record.type,
          created_at: record.created_at,
          updated_at: record.updated_at,
        })
      );
    },
    async myRelationshipWithUser(
      { user_id }: { user_id: number },
      _: any,
      context: Context
    ) {
      const { user, connection } = context;

      const query = `
      SELECT *
      FROM user_user_relationships
      WHERE initiating_user_id = ? AND target_user_id = ?`;

      const relationship1 = (
        await connection.query(query, [user.userId, user_id])
      )[0][0];
      const relationship2 = (
        await connection.query(query, [user_id, user.userId])
      )[0][0];
      const createdAt1 = relationship1?.created_at;
      const createdAt2 = relationship2?.created_at;

      const type1 = relationship1?.type;
      const type2 = relationship2?.type;
      const updatedAt1 = relationship1?.updated_at;
      const updatedAt2 = relationship2?.updated_at;

      let type;
      if (type1 === 'friend' && type2 === 'friend') {
        type = 'friend';
      } else if (type1 === 'blocked') {
        type = 'outgoing_blocking';
      } else if (type2 === 'blocked') {
        type = 'incoming_blocking';
      } else if (
        type1 === 'friend' &&
        type2 !== 'blocked' &&
        (updatedAt1 > updatedAt2 || updatedAt2 === undefined)
      ) {
        type = 'outgoing_friend_request';
      } else if (
        type2 === 'friend' &&
        type1 !== 'blocked' &&
        (updatedAt2 > updatedAt1 || updatedAt1 === undefined)
      ) {
        type = 'incoming_friend_request';
      } else {
        type = 'none';
      }

      return {
        type,
        created_at: Math.min(createdAt1, createdAt2),
        updated_at: Math.max(updatedAt1, updatedAt2),
        target_user: await resolvers.Query.user(
          {},
          { userId: user_id },
          context
        ),
        point_of_view_user: await resolvers.Query.me({}, {}, context),
      };
    },
    async profileImage(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM users AS u
        JOIN medias
        ON profile_image_media_id = media_id AND u.user_id = ?`,
          [user_id]
        )
      )[0][0];
    },
    async notifications(
      { user_id }: { user_id: number },
      { showAll }: { showAll: boolean },
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM notifications as n
          JOIN user_notifications as nuc
          ON n.notification_id = nuc.notification_id
          WHERE user_id = ? ${showAll ? '' : 'AND nuc.seen_at IS NULL'}
          ORDER BY created_at DESC`,
          [user_id]
        )
      )[0];
    },
    async myPrivateMessagesWithUser(
      { user_id }: { user_id: number },
      _: any,
      context: Context
    ) {
      const { user, connection } = context;

      const privateMessages = (
        await connection.query(
          `SELECT * FROM private_messages
          WHERE (sender_user_id = ? AND receiver_user_id = ?) OR (sender_user_id = ? AND receiver_user_id = ?)
          ORDER BY created_at ASC`,
          [user.userId, user_id, user_id, user.userId]
        )
      )[0];

      return privateMessages.map((privateMessage: any) => ({
        ...privateMessage,
        text: privateMessage.is_deleted ? '' : privateMessage.text,
      }));
    },
    async groupRelationships(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur
          ON g.group_id = gur.group_id
          WHERE user_id = ?`,
          [user_id]
        )
      )[0];
    },
    async createdGroups(
      { user_id }: { user_id: number },
      _: any,
      { connection, user }: Context
    ) {
      // if group is hidden only show it to creator, admins and members
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur
          ON g.group_id = gur.group_id
          WHERE
            gur.user_id = :querierUserId AND
            (
              g.visibility != 'hidden' OR
              gur.type = 'admin' OR
              gur.type = 'member' OR
              gur.type = 'invited' OR
              g.created_by_user_id = :querierUserId
            )
            AND g.created_by_user_id = :userId
          `,
          {
            querierUserId: user.userId,
            userId: user_id,
          }
        )
      )[0];
    },
    async adminOfGroups(
      { user_id }: { user_id: number },
      _: any,
      { connection, user }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur1
          ON g.group_id = gur1.group_id
          JOIN group_user_relationships AS gur2
          ON g.group_id = gur2.group_id
          WHERE
            (
              gur1.user_id = :querierUserId AND
              (
                g.visibility != 'hidden' OR
                gur1.type = 'admin' OR
                gur1.type = 'member' OR
                gur1.type = 'invited' OR
                g.created_by_user_id = :querierUserId
              )
            )
            AND (
              gur2.user_id = :userId AND
              gur2.type = 'admin'
            )
          `,
          {
            querierUserId: user.userId,
            userId: user_id,
          }
        )
      )[0];
    },
    async memberOfGroups(
      { user_id }: { user_id: number },
      _: any,
      { connection, user }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur1
          ON g.group_id = gur1.group_id
          JOIN group_user_relationships AS gur2
          ON g.group_id = gur2.group_id
          WHERE
            (
              gur1.user_id = :querierUserId AND
              (
                g.visibility != 'hidden' OR
                gur1.type = 'admin' OR
                gur1.type = 'member' OR
                gur1.type = 'invited' OR
                g.created_by_user_id = :querierUserId
              )
            )
            AND (
              gur2.user_id = :userId AND
              gur2.type = 'member'
            )
          `,
          {
            querierUserId: user.userId,
            userId: user_id,
          }
        )
      )[0];
    },
    // no need to check visibility because only users who have relationship with the group can see this field
    async bannedFromGroups(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur
          ON g.group_id = gur.group_id
          WHERE user_id = ? AND type = 'banned'`,
          [user_id]
        )
      )[0];
    },
    async sentMemberRequestsToGroups(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur
          ON g.group_id = gur.group_id
          WHERE user_id = ? AND type = 'member_request'`,
          [user_id]
        )
      )[0];
    },
    async groupsRejectedMemberRequest(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur
          ON g.group_id = gur.group_id
          WHERE user_id = ? AND type = 'rejected_member_request'`,
          [user_id]
        )
      )[0];
    },
    async invitedToGroups(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur
          ON g.group_id = gur.group_id
          WHERE user_id = ? AND type = 'invited'`,
          [user_id]
        )
      )[0];
    },
    async points(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      const points = (
        await connection.query(
          `SELECT SUM(v.type = 'up') - SUM(v.type = 'down') AS points FROM votes AS v
          JOIN messages AS m
          ON v.message_id = m.message_id
          WHERE m.user_id = ?`,
          [user_id]
        )
      )[0][0].points;

      return points || 0;
    },
    async friendSuggestions(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      // I have a mysql database. Two table is relevant. One is users table which has a user_id column. Other is user_user_relationships table. user_user_relationships table has three relevant column: initiating_user_id, target_user_id and type. type can be 'friend', 'blocked' or null. Two user are friends if both consider each other friend. For example user 1 and user 2 are friends if a record exists in user_user_relationships that 1 consider 2 a friend and an other record if 2 consider 1 a friend request. I want to make a query that returns suggested friends for user. One user is suggested if he is a friend of one of user's friend.

      // NOT IMPLEMENTED: If user1 has a null relationship with a user2, user2 will be suggested to user1 if but user1 will be suggested to user2
      // COMMENT OUT is not null condition in the query to activate this feature

      // good luck to debug this xd

      return (
        await connection.query(
          `SELECT * FROM users WHERE user_id IN(
            SELECT DISTINCT uur4.initiating_user_id FROM users AS u

            JOIN user_user_relationships AS uur1
              ON uur1.type = 'friend' AND uur1.initiating_user_id = u.user_id
            JOIN user_user_relationships AS uur2
              ON uur1.type = 'friend' AND uur1.target_user_id = uur2.initiating_user_id AND uur2.target_user_id = uur1.initiating_user_id

            JOIN user_user_relationships AS uur3
              ON uur3.type = 'friend' AND uur3.initiating_user_id = uur2.initiating_user_id
            JOIN user_user_relationships AS uur4
              ON uur1.type = 'friend' AND uur3.target_user_id = uur4.initiating_user_id AND uur4.target_user_id = uur3.initiating_user_id

            WHERE uur1.initiating_user_id = :userId
            AND uur4.initiating_user_id NOT IN (
              SELECT target_user_id FROM user_user_relationships
              WHERE initiating_user_id = :userId AND type IS NOT null
            )
            AND uur4.initiating_user_id NOT IN (
                SELECT initiating_user_id FROM user_user_relationships 
                WHERE target_user_id = :userId AND type IS NOT null
            )
            AND uur4.initiating_user_id != :userId
          )`,
          {
            userId: user_id,
          }
        )
      )[0];
    },
    async groupSuggestions(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      // user_user_relationships table. user_user_relationships table has three relevant column: initiating_user_id, target_user_id and type. type can be 'friend', 'blocked' or null. Two user are friends if both consider each other friend. For example user 1 and user 2 are friends if a record exists in user_user_relationships that 1 consider 2 a friend and an other record if 2 consider 1 a friend request. I want to make a query that returns suggested friends for user. One user is suggested if he is a friend of one of user's friend.

      // Select groups that user's friends are in

      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur
          ON g.group_id = gur.group_id
          WHERE gur.user_id IN (
            SELECT uur2.initiating_user_id FROM users AS u
            JOIN user_user_relationships AS uur1
              ON uur1.type = 'friend' AND uur1.initiating_user_id = u.user_id
            JOIN user_user_relationships AS uur2
              ON uur1.type = 'friend' AND uur1.target_user_id = uur2.initiating_user_id AND uur2.target_user_id = uur1.initiating_user_id
            WHERE uur1.initiating_user_id = :userId
          )
          AND gur.user_id != :userId
          AND (
            gur.type = 'member'
            OR gur.type = 'admin'
            )
            AND gur.group_id NOT IN (
              SELECT group_id FROM group_user_relationships
              WHERE user_id = :userId
            )
            AND g.visibility != 'hidden'
            `,
          {
            userId: user_id,
          }
        )
      )[0];
    },
  },
  Notification: {
    user: ({ user_id }: { user_id: number }, _: any, context: Context) =>
      resolvers.Query.user({}, { userId: user_id }, context),
  },
};

export default resolvers;
