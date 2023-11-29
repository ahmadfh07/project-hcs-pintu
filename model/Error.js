const mongoose = require("mongoose");

const errorSchema = new mongoose.Schema({
  doorNumber: {
    type: String,
    // required: true,
  },

  agent: {
    type: String,
  },

  error: {
    type: String,
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

const Error = mongoose.model("Error", errorSchema);
module.exports = Error;
