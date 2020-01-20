const { prisma } = require("./generated/prisma-client");
const { GraphQLServer } = require("graphql-yoga");
const bodyParser = require("body-parser");
const apiUrl = "https://slack.com/api";
const axios = require("axios");
const qs = require("querystring");

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
  .post("/command", async (req, res) => {
    //TODO need to check request token
    const slackRequest = req.body;
    console.group(slackRequest);

    const view = {
      //TODO token is disabled need to move to env
      token:
        "xoxp-864511312258-865826180771-913661876304-39ef75a80036654157d74cea21a81915",
      trigger_id: slackRequest.trigger_id,
      view: JSON.stringify({
        type: "modal",
        title: {
          type: "plain_text",
          text: "Kudos info"
        },
        callback_id: "submit-kudos",
        submit: {
          type: "plain_text",
          text: "Submit"
        },
        blocks: [
          {
            block_id: "description_block",
            type: "input",
            label: {
              type: "plain_text",
              text: "Description"
            },
            element: {
              action_id: "description",
              type: "plain_text_input",
              multiline: true
            },
            optional: true
          },
          {
            block_id: "recipient_block",
            type: "input",
            label: {
              type: "plain_text",
              text: "Users select"
            },
            element: {
              action_id: "recipient",
              type: "users_select",
              placeholder: {
                type: "plain_text",
                text: "Select user"
              }
            },
            optional: true
          }
        ]
      })
    };

    axios
      .post(`${apiUrl}/views.open`, qs.stringify(view))
      .then(result => {
        console.log("views.open:", result.data);
        res.send("");
      })
      .catch(err => {
        console.log("views.open call failed:", err);
        res.sendStatus(500);
      });
  })
  .post("/interaction", async (req, res) => {
    const slackRequest = req.body;
    console.group(slackRequest);

    // const commandText = slackRequest.text.split(" ");

    // const recipientName = commandText[1];
    // const kudosText = commandText.splice(2, commandText.length).join(" ");

    // const users = await prisma.users();
    // const author = users.find(
    //   user => user.name.toLowerCase() === username.toLowerCase()
    // );
    // const recipient = users.find(
    //   user => user.name.toLowerCase() === recipientName.toLowerCase()
    // );

    // const addedKudos = await prisma.createKudos({
    //   title: kudosText,
    //   author: {
    //     connect: { id: author.id }
    //   },
    //   recipient: {
    //     connect: { id: recipient.id }
    //   }
    // });

    res.status(200).send(``);
  });

server.start(() => console.log("Server is running on http://localhost:4000"));
