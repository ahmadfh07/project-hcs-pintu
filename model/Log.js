const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  doorNumber: {
    type: String,
    required: true,
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
