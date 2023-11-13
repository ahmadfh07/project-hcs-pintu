const express = require("express");
const { body, validationResult, check } = require("express-validator");
const router = express.Router();
const { createError, createSuccess } = require("../model/response");
const bcrypt = require("../utils/bcrypt");
const httpStatus = require("http-status");
const User = require("../model/User");
const Agent = require("../model/agent");
const { authToken } = require("../utils/authToken");

router.use(authToken());

router.post(
  "/create-user",
  [
    check("password", "Password atleast 6 character").isLength({ min: 6 }),
    body("email", "Please input correct format of an email")
      .isEmail()
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("Email already registered");
        }
      }),
    body("noHp", "Incorrect format")
      .isMobilePhone("id-ID")
      .custom(async (value) => {
        const user = await User.findOne({ noHp: value });
        if (user) {
          throw new Error("Phone number already registered");
        }
      }),
  ],
  async (req, res) => {
    let response;
    const { name, email, password, noHp } = req.body;
    const errors = validationResult(req).array();
    try {
      if (!name || !email | !password || !noHp) {
        response = new createError(true, "Please fill in all fields");
        res.status(httpStatus.BAD_REQUEST).json(response);
        return;
      } else if (errors.length !== 0) {
        response = new createError(true, errors);
        res.status(httpStatus.BAD_REQUEST).json(response);
        return;
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password);
        req.body.password = hashedPassword;

        const user = new User(req.body);
        const result = await user.save();
        response = new createSuccess(false, "Succesfully create a user", result);
        res.status(httpStatus.OK).json(response);
      }
    } catch (err) {
      response = new createError(true, err.message);
      res.status(httpStatus.BAD_REQUEST).json(response);
    }
  }
);

router.post("/create-agent", (req, res) => {
  try {
    const newAgent = Agent.insertMany(req.body);
    const response = new createSuccess(false, "New Agent successully created");
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    const response = new createError(true, err.message);
    res.status(httpStatus.BAD_REQUEST).json(response);
  }
});

module.exports = router;
