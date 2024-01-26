const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  doorNumber: {
    type: String,
    required: true,
  },

  deviceId: {
    type: String,
    required: true,
  },

  targetStatus: {
    type: Boolean,
  },

  statusBool: {
    type: Boolean,
  },

  agent: {
    type: String,
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
