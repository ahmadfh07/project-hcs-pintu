const express = require("express");
const { client } = require("../mqtt");
const { body, validationResult, check } = require("express-validator");
const router = express.Router();
const { createError, createSuccess } = require("../model/response");
const httpStatus = require("http-status");
const User = require("../model/User");
const Agent = require("../model/agent");
const Door = require("../model/Door");
const Log = require("../model/Log");
const { authToken } = require("../utils/authToken");

router.use(authToken());

router.post("/register-door", async (req, res) => {
  try {
    const newDoor = await Door.insertMany(req.body);
    response = new createSuccess(false, `Door ${req.body.doorNumber} succesfully registered`);
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    response = new createError(true, err.message);
    res.status(httpStatus.BAD_REQUEST).json(response);
  }
});

router.post("/toggle-door-status", async (req, res) => {
  try {
    const { doorNumber, statusBool, status } = req.query;
    const door = await Door.findOne({ doorNumber });
    if (!door) throw new Error("Door number not found");
    client.publish(`auth/${doorNumber}/${status}`, "1", (err) => {
      if (err) throw new Error(err);
    });
    const doorUpdated = await Door.findOneAndUpdate({ doorNumber }, { statusBool, latestAgent: req.user.name });
    const newLog = await Log.insertMany({ doorNumber: door.doorNumber, statusBool, agent: req.user.name });
    response = new createSuccess(false, `Toggle message succesfully sended`);
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    response = new createError(true, err.message);
    res.status(httpStatus.BAD_REQUEST).json(response);
  }
});

module.exports = router;
