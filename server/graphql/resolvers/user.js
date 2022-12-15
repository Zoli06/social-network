const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = {
  Query: {
    async user(_, { userId }, { user, connection }) {
      user.authenticate();
      return (
        await connection.query(`SELECT * FROM users WHERE user_id = ?`, [
          userId,
        ])
      )[0][0];
    },
    async me(_, __, { user, connection }) {
      user.authenticate();
      return await module.exports.Query.user(
        _,
        { userId: user.id },
        { user, connection }
      );
    },
  },
  Mutation: {
    async register(
      _,
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
      },
      { connection }
    ) {
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
      const user = await module.exports.Query.user(
        {},
        { userId },
        { user: { userId, authenticate: () => true }, connection }
      );
      const token = jsonwebtoken.sign(
        { id: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: "1y" }
      );
      return { token, user };
    },
    async login(_, { email, password }, { connection }) {
      const user = (
        await connection.query(`SELECT * FROM users WHERE email = ?`, [email])
      )[0][0];
      if (!user) {
        throw new Error("No user with that email");
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error("Incorrect password");
      }
      await connection.query(
        `UPDATE users SET last_login_at = DEFAULT WHERE user_id = ?`,
        [user.user_id]
      );
      const token = jsonwebtoken.sign(
        { id: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return {
        token,
        user,
      };
    },
    async updateUser(
      _,
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
      },
      { user, connection }
    ) {
      user.authenticate();
      await connection.query(
        `UPDATE users
          SET first_name = ?, last_name = ?, middle_name = ?, user_name = ?, mobile_number = ?, email = ?, password = ?, updated_at = DEFAULT, intro = ?, profile_image_media_id = ?
          WHERE user_id = ?`,
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
          user.id,
        ]
      );
      return await module.exports.Query.user(
        {},
        { userId: user.id },
        { user, connection }
      );
    },
    async createUserUserRelationship(
      _,
      { userId, type },
      { user, connection }
    ) {
      user.authenticate();
      if (type === "none") type = null;
      await connection.query(
        `INSERT INTO user_user_relationships (initiating_user_id, target_user_id, type) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE type = ?, updated_at = DEFAULT`,
        [user.id, userId, type, type]
      );
      return await module.exports.User.relationshipWithUser(
        { user_id: userId },
        {},
        { user, connection }
      );
    },
  },
  User: {
    async userRelationships(parent, _, { user, connection }) {
      user.authenticate();

      return [
        ...(await this.friends(parent, _, { user, connection })),
        ...(await this.incomingFriendRequests(parent, _, { user, connection })),
        ...(await this.outgoingFriendRequests(parent, _, { user, connection })),
        ...(await this.blockedUsers(parent, _, { user, connection })),
      ];
    },
    async friends({ user_id }, _, { user, connection }) {
      user.authenticate();
      return (
        (await connection.query(
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
      ))[0].map((record) => ({
        user: record,
        type: record.type,
        created_at: record.real_created_at,
        updated_at: record.real_updated_at,
      }));
    },
    async incomingFriendRequests({ user_id }, _, { user, connection }) {
      user.authenticate();
      return (
        (await connection.query(
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
      ))[0].map((record) => ({
        user: record,
        type: "incoming_friend_request",
        created_at: record.created_at,
        updated_at: record.updated_at,
      }));
    },
    async outgoingFriendRequests({ user_id }, _, { user, connection }) {
      user.authenticate();
      return (
        (await connection.query(
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
      ))[0].map((record) => ({
        user: record,
        type: "outgoing_friend_request",
        created_at: record.created_at,
        updated_at: record.updated_at,
      }));
    },
    async blockedUsers({ user_id }, _, { user, connection }) {
      user.authenticate();
      return (
        (await connection.query(
          `SELECT *
        FROM user_user_relationships
        JOIN users
        ON user_id = target_user_id
        WHERE type = 'outgoing_blocking' AND initiating_user_id = ?`,
          [user_id]
        )
      ))[0].map((record) => ({
        user: record,
        type: record.type,
        created_at: record.created_at,
        updated_at: record.updated_at,
      }));
    },
    async relationshipWithUser({ user_id }, _, { user, connection }) {
      user.authenticate();
      const relationship1 = (
        (await connection.query(
          `SELECT *
      FROM user_user_relationships
      WHERE initiating_user_id = ? AND target_user_id = ?`,
          [user.id, part.user_id]
        )
      ))[0][0];
      const relationship2 = (
        (await connection.query(
          `SELECT *
      FROM user_user_relationships
      WHERE initiating_user_id = ? AND target_user_id = ?`,
          [user_id, user.id]
        )
      ))[0][0];
      const type1 = relationship1?.type;
      const type2 = relationship2?.type;
      const updated_at1 = relationship1?.updated_at;
      const updated_at2 = relationship2?.updated_at;

      let type;
      if (type1 === "friend" && type2 === "friend") {
        type = "friend";
      } else if (type1 === "blocked") {
        type = "outgoing_blocking";
      } else if (type2 === "blocked") {
        type = "incoming_blocking";
      } else if (
        type1 === "friend" &&
        type2 !== "blocked" &&
        (updated_at1 > updated_at2 || updated_at2 === undefined)
      ) {
        type = "outgoing_friend_request";
      } else if (
        type2 === "friend" &&
        type1 !== "blocked" &&
        (updated_at2 > updated_at1 || updated_at1 === undefined)
      ) {
        type = "incoming_friend_request";
      } else {
        type = "none";
      }

      return {
        type,
        created_at: Math.min(
          relationship1?.created_at,
          relationship2?.created_at
        ),
        updated_at: Math.max(
          relationship1?.updated_at,
          relationship2?.updated_at
        ),
        user: module.exports.Query.user(
          {},
          { userId: user_id },
          { user, connection }
        ),
      };
    },
    async profileImage({ user_id }, __, { user, connection }) {
      user.authenticate();

      return (
        await connection.query(
          `SELECT * FROM users AS u
        JOIN medias
        ON profile_image_media_id = media_id AND u.user_id = ?`,
          [user_id]
        )
      )[0][0];
    },
  },
};
