if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    mongoose.connect(process.env.DATABASE_URL, {
      //   useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected `);
    return mongoose.connection;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = { connectDB };
