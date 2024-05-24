const { body, validationResult, check } = require("express-validator");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const bcrypt = require("../utils/bcrypt");
const httpStatus = require("http-status");
const User = require("../model/User");
const { createError, createSuccess } = require("../model/response");
const bouncer = require("express-bouncer")(500, 900000);

bouncer.blocked = function (req, res, next, remaining) {
  response = new createError(true, `Too many requests have been made, please wait ${remaining / 1000} seconds`);
  res.status(httpStatus.TOO_MANY_REQUESTS).json(response);
};

router.post("/signin", bouncer.block, [check("password", "Password atleast 6 character").isLength({ min: 6 }), body("email", "Please input correct format of an email").isEmail()], async (req, res) => {
  let response;
  const { email, password } = req.body;
  const errors = validationResult(req).array();
  try {
    if (errors.length !== 0) {
      response = new createError(true, errors);
      res.status(httpStatus.BAD_REQUEST).json(response);
    } else {
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new Error("User not found");
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Incorrect password");
      }
      bouncer.reset(req);
      const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET_KEY, { expiresIn: "12h" });
      const data = { accessToken };
      response = new createSuccess(false, "Succesfully Signed in", data);
      res.status(httpStatus.OK).json(response);
    }
  } catch (err) {
    response = new createError(true, err.message);
    res.status(httpStatus.BAD_REQUEST).json(response);
  }
});

router.get("/me", async (req, res) => {
  response = new createError(true, "Unauthorized access");
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
    const { name, email, role } = await User.findOne({ _id: id });
    const data = { name, email, role };
    response = new createSuccess(false, "Authorized", data);
    res.status(httpStatus.OK).json(response);
  });
});

module.exports = router;
