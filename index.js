const { prisma } = require("./generated/prisma-client");
const { GraphQLServer } = require("graphql-yoga");
const bodyParser = require("body-parser");
const apiUrl = "https://slack.com/api";
const axios = require("axios");
const qs = require("querystring");
const _ = require("lodash");
require("dotenv").config();
const authToken = process.env.AUTH_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

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
        text: args.text,
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
      return context.prisma.createUser({
        slackId: args.slackId,
        name: args.name
      });
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
const expressServer = server.express.use(
  bodyParser.urlencoded({ extended: true })
);

expressServer.post("/command", async (req, res) => {
  //TODO need to check request token
  const slackRequest = req.body;

  const view = {
    token: authToken,
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
        text: "Send kudos"
      },
      blocks: [
        {
          block_id: "kudos_text_block",
          type: "input",
          label: {
            type: "plain_text",
            text: "Kudos text:"
          },
          element: {
            action_id: "kudos_text",
            type: "plain_text_input",
            initial_value: slackRequest.text,
            multiline: true
          }
        },
        {
          block_id: "recipient_block",
          type: "input",
          label: {
            type: "plain_text",
            text: "Send to user:"
          },
          element: {
            action_id: "recipient",
            type: "users_select",
            placeholder: {
              type: "plain_text",
              text: "Select user"
            }
          }
        }
      ]
    })
  };

  axios
    .post(`${apiUrl}/views.open`, qs.stringify(view))
    .then(result => {
      // console.log("views.open:", result.data);
      res.send("");
    })
    .catch(err => {
      // console.log("views.open call failed:", err);
      res.sendStatus(500);
    });
});

expressServer.post("/interaction", async (req, res) => {
  const slackRequest = JSON.parse(req.body.payload);

  const authorSlackId = slackRequest.user.id;
  const recipientSlackId = _.get(
    slackRequest,
    "view.state.values.recipient_block.recipient.selected_user"
  );
  const kudosText = _.get(
    slackRequest,
    "view.state.values.kudos_text_block.kudos_text.value"
  );

  const users = await prisma.users();
  const author = users.find(user => user.slackId === authorSlackId);
  const recipient = users.find(user => user.slackId === recipientSlackId);

  if (author && recipient && kudosText) {
    const addedKudos = await prisma.createKudos({
      text: kudosText,
      author: {
        connect: { id: author.id }
      },
      recipient: {
        connect: { id: recipient.id }
      }
    });
    res.send("");
    axios.post(webhookUrl, {
      text: `${addedKudos.text} is sent to ${recipient.name}`
    });
  } else {
    res.sendStatus(500);
  }
});

server.start(() => console.log("Server is running on http://localhost:4000"));
