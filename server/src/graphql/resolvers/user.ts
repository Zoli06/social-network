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
      // console.log('me', context.user)
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
    }
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
            mobileNumber,
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
          firstName || _user.first_name,
          lastName || _user.last_name,
          middleName || _user.middle_name,
          userName || _user.user_name,
          mobileNumber || _user.mobile_number,
          email || _user.email,
          password ? await bcrypt.hash(password, 10) : _user.password,
          intro || _user.intro,
          profileImageMediaId || _user.profile_image_media_id,
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
      const myRelationshipWithUser = await resolvers.User.myRelationshipWithUser(
        { user_id: userId },
        {},
        context
      );

      const myData = await resolvers.Query.user({}, { userId: user.userId }, context);
      console.log(myData)

      if (myRelationshipWithUser.type === 'friend') {
        await sendNotifications(
          {
            userIds: [userId],
            title: `${myData.first_name} ${myData.last_name} accepted your friend request`,
            urlPath: `/user/${user.userId}`,
          }
        );
      } else if (myRelationshipWithUser.type === 'outgoing_friend_request') {
        await sendNotifications(
          {
            userIds: [userId],
            title: `${myData.first_name} ${myData.last_name} sent you a friend request`,
            urlPath: `/user/${user.userId}`,
          }
        );
      }

      return myRelationshipWithUser;
    },        
    checkNotification: async (
      _: any,
      { notificationId }: { notificationId: number },
      context: Context
    ) => {
      const { user, connection } = context;
      // TODO: auto update updated_at in database
      await connection.query(
        `UPDATE notifications as n
        JOIN user_notifications as nuc
        ON nuc.notification_id = n.notification_id
        SET seen_at = NOW(), updated_at = DEFAULT
        WHERE n.notification_id = ?`,
        [notificationId, user.userId]
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
      const me = await resolvers.Query.me({}, {}, context);

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
            point_of_view_user: me,
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
      const me = await resolvers.Query.me({}, {}, context);

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
          point_of_view_user: me,
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
      const me = await resolvers.Query.me({}, {}, context);

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
          point_of_view_user: me,
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
      const me = await resolvers.Query.me({}, {}, context);

      return (
        await connection.query(
          `SELECT *
        FROM user_user_relationships
        JOIN users
        ON user_id = target_user_id
        WHERE type = 'outgoing_blocking' AND initiating_user_id = ?`,
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
          point_of_view_user: me,
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

      return (
        await connection.query(
          `SELECT * FROM private_messages
        WHERE (sender_user_id = ? AND receiver_user_id = ?) OR (sender_user_id = ? AND receiver_user_id = ?)
        ORDER BY created_at ASC`,
          [user.userId, user_id, user_id, user.userId]
        )
      )[0];
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
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\`
          WHERE created_by_user_id = ?`,
          [user_id]
        )
      )[0];
    },
    async memberOfGroups(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur
          ON g.group_id = gur.group_id
          WHERE user_id = ? AND type = 'member' AND visibility = 'visible'`,
          [user_id]
        )
      )[0];
    },
    async adminOfGroups(
      { user_id }: { user_id: number },
      _: any,
      { connection }: Context
    ) {
      return (
        await connection.query(
          `SELECT * FROM \`groups\` AS g
          JOIN group_user_relationships AS gur
          ON g.group_id = gur.group_id
          WHERE user_id = ? AND type = 'admin' AND visibility = 'visible'`,
          [user_id]
        )
      )[0];
    },
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
          WHERE user_id = ? AND type = 'banned' AND visibility = 'visible'`,
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
          WHERE user_id = ? AND type = 'member_request' AND visibility = 'visible'`,
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
          WHERE user_id = ? AND type = 'rejected_member_request' AND visibility = 'visible'`,
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
          WHERE user_id = ? AND type = 'invite' AND visibility = 'visible'`,
          [user_id]
        )
      )[0];
    }
  },
  Notification: {
    user: ({ user_id }: { user_id: number }, _: any, context: Context) =>
      resolvers.Query.user({}, { userId: user_id }, context),
  },
};

export default resolvers;
