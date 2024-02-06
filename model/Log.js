const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

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

logSchema.plugin(paginate);

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
