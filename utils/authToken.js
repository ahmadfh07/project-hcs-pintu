const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const User = require("../model/User");
const { createError, createSuccess } = require("../model/response");

const authToken = () => {
  const response = new createError(true, "Unauthorized access");
  return async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(httpStatus.UNAUTHORIZED).json(response);
      return;
    }
    jwt.verify(token, process.env.ACCESS_SECRET_KEY, async (error, payload) => {
      if (error) {
        res.status(httpStatus.UNAUTHORIZED).json(response);
        return;
      }
      const id = payload.id;
      if (!id) {
        res.status(httpStatus.UNAUTHORIZED).json(response);
        return;
      }
      const user = await User.findOne({ _id: id });
      if (!user) {
        res.status(httpStatus.UNAUTHORIZED).json(response);
        return;
      }
      // if (role.indexOf(user.role) == -1) {
      //   res.status(httpStatus.UNAUTHORIZED).json(response);
      //   return;
      // }
      req.user = { name: user.name, email: user.email };
      next();
    });
  };
};

module.exports = { authToken };
