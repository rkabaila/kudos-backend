const { prisma } = require("../generated/prisma-client");
const { GraphQLServer } = require("graphql-yoga");
const bodyParser = require("body-parser");
const resolvers = require("./resolvers");
const authenticateUser = require("./authenticate");
const kudosRequest = require("./express/kudos");
const interactionRequest = require("./express/interaction");

const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers,
  context: (req) => {
    const tokenWithBearer = req.request.headers.authorization || "";
    const token = tokenWithBearer.split(" ")[1];
    const authenticatedUser = authenticateUser(token);

    return {
      authenticatedUser,
      token,
      prisma,
    };
  },
});

const expressServer = server.express.use(
  bodyParser.urlencoded({ extended: true })
);

expressServer.post("/kudos", kudosRequest);
expressServer.post("/interaction", interactionRequest);

module.exports = server;
