const jwt = require("jsonwebtoken");
const { SECRET_KEY } = process.env;
const User = require("../models/users");

const authentication = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");

    if (bearer !== "Bearer") {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }

    const decoded = await jwt.verify(token, SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user || !user.token || user.token !== token) {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error.message);
    if (error.message === "invalid signature") {
      error.message = "Not authorized";
      error.status = 401;
    }
    next(error);
  }
};

module.exports = { authentication };
