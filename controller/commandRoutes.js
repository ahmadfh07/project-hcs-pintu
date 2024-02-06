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

router.delete("/delete-door", async (req, res) => {
  try {
    const deleteDoor = await Door.findByIdAndDelete(req.query.doorid);
    const response = new createSuccess(false, "Door successully deleted");
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    const response = new createError(true, err.message);
    res.status(httpStatus.BAD_REQUEST).json(response);
  }
});

router.post("/toggle-door-status", async (req, res) => {
  try {
    const { doorNumber, statusBool, status } = req.query;
    const door = await Door.findOne({ doorNumber });
    const message = { targetStatus: status, targetStatusBool: statusBool, authStatus: 1 };
    if (!door) throw new Error("Door number not found");
    console.log(`auth/${doorNumber}/${status}`);
    client.publish(`auth/${doorNumber}`, JSON.stringify(message));
    const doorUpdated = await Door.findOneAndUpdate({ doorNumber }, { statusBool, latestAgent: req.user.name, lastAccessed: Date.now() });
    const newLog = await Log.insertMany({ doorNumber: door.doorNumber, deviceId: "Dashboard", statusBool, agent: req.user.name });
    response = new createSuccess(false, `Toggle message succesfully sended`);
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    response = new createError(true, err.message);
    res.status(httpStatus.BAD_REQUEST).json(response);
  }
});

module.exports = router;
