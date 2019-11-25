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
    kudosByUser(root, args, context) {
      return context.prisma
        .user({
          id: args.userId
        })
        .ownKudos();
    },
    users(root, args, context) {
      return context.prisma.users();
    }
  },
  Mutation: {
    createKudos(root, args, context) {
      return context.prisma.createKudos({
        title: args.title,
        author: {
          connect: { id: args.userId }
        }
      });
    },
    createUser(root, args, context) {
      return context.prisma.createUser({ name: args.name });
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
