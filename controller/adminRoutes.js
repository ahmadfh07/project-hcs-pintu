const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Agent = require("../model/agent");

router.post("/create-agent", (req, res) => {
  try {
    const newAgent = Agent.insertMany(req.body);
    res.status(300).send({ error: false, msg: newAgent });
  } catch (err) {
    res.status(404).send("error");
  }
});

module.exports = router;
