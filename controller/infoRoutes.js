const express = require("express");
const { body, validationResult, check } = require("express-validator");
const router = express.Router();
const { createError, createSuccess } = require("../model/response");
const bcrypt = require("../utils/bcrypt");
const httpStatus = require("http-status");
const User = require("../model/User");
const Door = require("../model/Door");
const Agent = require("../model/agent");
const Log = require("../model/Log");
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

router.get("/get-door-logs", async (req, res) => {
  try {
    const logsPaginated = await Log.paginate({ doorNumber: req.query.doorNumber }, { page: req.query.page, limit: 5 });
    const logs = await Log.find({ doorNumber: req.query.doorNumber });
    response = new createSuccess(false, `logs for door`, logsPaginated);
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    response = new createError(true, err.message);
    res.status(httpStatus.BAD_REQUEST).json(response);
  }
});

module.exports = router;
