const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

const authenticateUser = (token) => {
  try {
    if (token) {
      return jwt.verify(token, jwtSecret);
    }
    return null;
  } catch (err) {
    return null;
  }
};

module.exports = authenticateUser;
