const { prisma } = require("./generated/prisma-client");
const { GraphQLServer } = require("graphql-yoga");
const bodyParser = require("body-parser");

const resolvers = {
  Query: {
    kudosById(root, args, context) {
      return context.prisma.kudos({ id: args.kudosId });
    },
    kudoses(root, args, context) {
      return context.prisma.kudoses();
    },
    userOwnKudoses(root, args, context) {
      return context.prisma
        .user({
          id: args.userId
        })
        .ownKudoses();
    },
    userWrittenKudoses(root, args, context) {
      return context.prisma
        .user({
          id: args.userId
        })
        .writtenKudoses();
    },
    userById(root, args, context) {
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
    ownKudoses(root, args, context) {
      return context.prisma
        .user({
          id: root.id
        })
        .ownKudoses();
    },
    writtenKudoses(root, args, context) {
      return context.prisma
        .user({
          id: root.id
        })
        .writtenKudoses();
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
server.express
  .use(bodyParser.urlencoded({ extended: true }))
  .post("/slack", async (req, res) => {
    const slackRequest = req.body;
    const commandText = slackRequest.text.split(" ");
    const authorName = commandText[0];
    const recipientName = commandText[1];
    const kudosText = commandText.splice(2, commandText.length).join(" ");

    const users = await prisma.users();
    const author = users.find(
      user => user.name.toLowerCase() === authorName.toLowerCase()
    );
    const recipient = users.find(
      user => user.name.toLowerCase() === recipientName.toLowerCase()
    );

    const addedKudos = await prisma.createKudos({
      title: kudosText,
      author: {
        connect: { id: author.id }
      },
      recipient: {
        connect: { id: recipient.id }
      }
    });

    res
      .status(200)
      .send(`Kudos "${addedKudos.title}" is sent to ${recipientName}.`);
  });

server.start(() => console.log("Server is running on http://localhost:4000"));
