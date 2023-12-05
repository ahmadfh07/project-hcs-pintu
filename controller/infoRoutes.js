const express = require("express");
const { body, validationResult, check } = require("express-validator");
const router = express.Router();
const { createError, createSuccess } = require("../model/response");
const bcrypt = require("../utils/bcrypt");
const httpStatus = require("http-status");
const User = require("../model/User");
const Door = require("../model/Door");
const Agent = require("../model/agent");
const { authToken } = require("../utils/authToken");

router.use(authToken());

router.get("/get-agents", async (req, res) => {
  try {
    const agents = await Agent.find({});
    response = new createSuccess(false, "Agents list succesfully retrieved", agents);
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    response = new createError(true, err.message);
    res.status(httpStatus.BAD_REQUEST).json(response);
  }
});

router.get("/get-doors", async (req, res) => {
  try {
    const doors = await Door.find({});
    response = new createSuccess(false, "Doors list succesfully retrieved", doors);
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    response = new createError(true, err.message);
    res.status(httpStatus.BAD_REQUEST).json(response);
  }
});

module.exports = router;
