const { prisma } = require("./generated/prisma-client");
const { GraphQLServer } = require("graphql-yoga");

const resolvers = {
  Query: {
    kudos(root, args, context) {
      return context.prisma.kudos({ id: args.kudosId });
    },
    kudoses(root, args, context) {
      return context.prisma.kudoses();
    },
    ownKudosByUser(root, args, context) {
      return context.prisma
        .user({
          id: args.userId
        })
        .ownKudos();
    },
    writtenKudosByUser(root, args, context) {
      return context.prisma
        .user({
          id: args.userId
        })
        .writtenKudos();
    },
    getUserById(root, args, context) {
      return context.prisma.user({ id: args.id });
    },
    users(root, args, context) {
      return context.prisma.users();
    }
  },
  Mutation: {
    addKudos(root, args, context) {
      return context.prisma.createKudos({
        title: args.title,
        author: {
          connect: { id: args.authorId }
        },
        recipient: {
          connect: { id: args.recipientId }
        }
      });
    },
    deleteKudos(root, args, context) {
      return context.prisma.deleteKudos({ id: args.id });
    },
    addUser(root, args, context) {
      return context.prisma.createUser({ name: args.name });
    },
    deleteUser(root, args, context) {
      return context.prisma.deleteUser({ id: args.id });
    }
  },
  User: {
    ownKudos(root, args, context) {
      return context.prisma
        .user({
          id: root.id
        })
        .ownKudos();
    },
    writtenKudos(root, args, context) {
      return context.prisma
        .user({
          id: root.id
        })
        .writtenKudos();
    }
  },
  Kudos: {
    author(root, args, context) {
      return context.prisma
        .kudos({
          id: root.id
        })
        .author();
    },
    recipient(root, args, context) {
      return context.prisma
        .kudos({
          id: root.id
        })
        .recipient();
    }
  }
};

const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers,
  context: {
    prisma
  }
});

server.start(() => console.log("Server is running on http://localhost:4000"));
