const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  noHp: {
    type: String,
    required: true,
  },
  rfid: {
    type: String,
    required: true,
  },
});

const Agent = mongoose.model("Agent", agentSchema);
module.exports = Agent;
