const { prisma } = require("../../generated/prisma-client");
require("dotenv").config();
const appToken = process.env.APP_TOKEN;

const top5Request = async (req, res) => {
  const slackRequest = req.body;

  if (slackRequest.token !== appToken) {
    console.log("Invalid app token");
    return;
  }

  const users = await prisma.users();

  const data = await Promise.all(
    users.map(async (user) => {
      const kudoses = await prisma.user({ id: user.id }).ownKudoses();

      return {
        name: user.name,
        kudoses: kudoses.length,
      };
    })
  );

  const top5 = data
    .sort((a, b) => (a.kudoses > b.kudoses ? -1 : 1))
    .slice(0, 5);

  const fields = top5.map((entry) => ({
    type: "plain_text",
    text: Object.values(entry).join(" - "),
  }));

  return res.send({
    blocks: [
      {
        type: "section",
        fields,
      },
    ],
  });
};

module.exports = top5Request;
