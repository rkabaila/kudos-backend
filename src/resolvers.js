const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

const resolvers = {
  Query: {
    kudosById(root, args, context) {
      return context.prisma.kudos({ id: args.kudosId });
    },
    kudoses(root, args, context) {
      if (!context.authenticatedUser) {
        throw new Error("Not Authenticated");
      }
      return context.prisma.kudoses();
    },
    userOwnKudoses(root, args, context) {
      if (!context.authenticatedUser) {
        throw new Error("Not Authenticated");
      }
      return context.prisma
        .user({
          id: context.authenticatedUser.id,
        })
        .ownKudoses();
    },
    userWrittenKudoses(root, args, context) {
      if (!context.authenticatedUser) {
        throw new Error("Not Authenticated");
      }
      return context.prisma
        .user({
          id: context.authenticatedUser.id,
        })
        .writtenKudoses();
    },
    userById(root, args, context) {
      return context.prisma.user({ id: args.id });
    },
    users(root, args, context) {
      if (!context.authenticatedUser) {
        throw new Error("Not Authenticated");
      }
      return context.prisma.users();
    },
  },
  Mutation: {
    addKudos(root, args, context) {
      return context.prisma.createKudos({
        text: args.text,
        author: {
          connect: { id: args.authorId },
        },
        recipient: {
          connect: { id: args.recipientId },
        },
        category: args.category,
      });
    },
    deleteKudos(root, args, context) {
      return context.prisma.deleteKudos({ id: args.id });
    },
    async addUser(root, args, context) {
      const hashedPassword = await bcrypt.hash(args.password, 10);

      return await context.prisma.createUser({
        slackId: args.slackId,
        email: args.email,
        name: args.name,
        role: args.role,
        password: hashedPassword,
      });
    },

    async login(root, args, context) {
      try {
        const user = await context.prisma.user({ name: args.name });
        if (!user || !user.password) {
          throw new Error("Invalid Login");
        }
        const passwordMatch = await bcrypt.compare(
          args.password,
          user.password
        );
        if (!passwordMatch) {
          throw new Error("Invalid Login");
        }
        const token = jwt.sign(
          {
            id: user.id,
            name: user.name,
            role: user.role,
          },
          jwtSecret,
          {
            expiresIn: "30d",
          }
        );

        return {
          token,
          user,
        };
      } catch (error) {
        return {
          token: undefined,
          user: undefined,
        };
      }
    },

    async googleLogin(root, args, context) {
      const googleToken = args.token;
      //TODO for prod use Google API Client Library
      //https://developers.google.com/identity/sign-in/web/backend-auth
      let response;
      let tokenInfo;
      try {
        response = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`
        );
        tokenInfo = await response.json();
      } catch (error) {
        console.log(error);
        return {
          token: undefined,
          user: undefined,
        };
      }
      if (tokenInfo.hd !== "telesoftas.com") {
        return {
          token: undefined,
          user: undefined,
        };
      }
      const user = await context.prisma.user({ email: tokenInfo.email });

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          role: user.role,
        },
        jwtSecret,
        {
          expiresIn: "30d",
        }
      );

      return {
        token,
        user,
      };
    },

    deleteUser(root, args, context) {
      return context.prisma.deleteUser({ id: args.id });
    },
  },
  User: {
    ownKudoses(root, args, context) {
      return context.prisma
        .user({
          id: root.id,
        })
        .ownKudoses();
    },
    writtenKudoses(root, args, context) {
      return context.prisma
        .user({
          id: root.id,
        })
        .writtenKudoses();
    },
  },
  Kudos: {
    author(root, args, context) {
      return context.prisma
        .kudos({
          id: root.id,
        })
        .author();
    },
    recipient(root, args, context) {
      return context.prisma
        .kudos({
          id: root.id,
        })
        .recipient();
    },
  },
};

module.exports = resolvers;
