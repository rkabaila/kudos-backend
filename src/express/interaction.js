const axios = require("axios");
const { prisma } = require("../../generated/prisma-client");
const _ = require("lodash");
require("dotenv").config();
const authToken = process.env.AUTH_TOKEN;
const appToken = process.env.APP_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

const interactionRequest = async (req, res) => {
  const ensureUsers = async () => {
    const users = await prisma.users();
    let author = users.find((user) => user.slackId === authorSlackId);
    let recipient = users.find((user) => user.slackId === recipientSlackId);
    if (!author) {
      response = await fetch(
        `https://slack.com/api/users.info?token=${authToken}&user=${authorSlackId}`
      );
      const info = await response.json();
      author = await prisma.createUser({
        slackId: authorSlackId,
        role: "user",
        email: info.user.profile.email,
        name: info.user.real_name,
      });
    }
    if (!recipient) {
      response = await fetch(
        `https://slack.com/api/users.info?token=${authToken}&user=${recipientSlackId}`
      );
      const info = await response.json();
      recipient = await prisma.createUser({
        slackId: recipientSlackId,
        role: "user",
        email: info.user.profile.email,
        name: info.user.real_name,
      });
    }
    return [author, recipient];
  };
  //TODO create user using

  //TODO map users using google account id

  const slackRequest = JSON.parse(req.body.payload);

  if (slackRequest.token !== appToken) {
    console.log("Invalid app token");
    return;
  }
  const authorSlackId = slackRequest.user.id;
  const recipientSlackId = _.get(
    slackRequest,
    "view.state.values.recipient_block.recipient.selected_user"
  );
  const kudosText = _.get(
    slackRequest,
    "view.state.values.kudos_text_block.kudos_text.value"
  );
  const category =
    slackRequest.view.state.values.category_block["static_select-action"]
      .selected_option.value;

  const [author, recipient] = await ensureUsers();

  if (author && recipient && kudosText) {
    const addedKudos = await prisma.createKudos({
      text: kudosText,
      author: {
        connect: { id: author.id },
      },
      recipient: {
        connect: { id: recipient.id },
      },
      category,
    });
    res.send("");
    axios.post(webhookUrl, {
      text: `${addedKudos.text} is sent to ${
        recipient.name
      }. To view kudoses login on http://localhost:3000/login`,
    });
  } else {
    res.sendStatus(500);
  }
};

module.exports = interactionRequest;
