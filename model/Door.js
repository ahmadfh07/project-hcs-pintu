const mongoose = require("mongoose");

const doorSchema = new mongoose.Schema({
  doorNumber: {
    type: String,
    required: true,
  },

  statusBool: {
    type: Boolean,
    default: null,
  },

  latestAgent: {
    type: String,
    default: null,
  },
});

const Door = mongoose.model("Door", doorSchema);
module.exports = Door;
