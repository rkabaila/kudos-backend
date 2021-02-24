const getModalBlocks = require("../modal-blocks");
const apiUrl = "https://slack.com/api";
const qs = require("querystring");
const axios = require("axios");
require("dotenv").config();
const authToken = process.env.AUTH_TOKEN;
const appToken = process.env.APP_TOKEN;

const kudosRequest = async (req, res) => {
  const slackRequest = req.body;

  if (slackRequest.token !== appToken) {
    console.log("Invalid app token");
    return;
  }
  const modalBlocks = getModalBlocks(slackRequest.text);
  const view = {
    token: authToken,
    trigger_id: slackRequest.trigger_id,
    view: JSON.stringify({
      type: "modal",
      title: {
        type: "plain_text",
        text: "Kudos info",
      },
      callback_id: "submit-kudos",
      submit: {
        type: "plain_text",
        text: "Send kudos",
      },
      blocks: modalBlocks,
    }),
  };
  //TODO node fetch
  axios
    .post(`${apiUrl}/views.open`, qs.stringify(view))
    .then((result) => {
      // console.log("views.open:", result.data);
      res.send("");
    })
    .catch((err) => {
      // console.log("views.open call failed:", err);
      res.sendStatus(500);
    });
};

module.exports = kudosRequest;
