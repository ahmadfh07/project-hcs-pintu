if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { connectDB } = require("./utils/dbConnect");
const { client } = require("./mqtt");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
//cors config
const whitelist = process.env.CORS_WHITELIST_COMASEPARATED.split(",");
var corsOptionsDelegate = function (req, callback) {
  const corsOptions = {
    methods: ["GET", "PUT", "POST", "DELETE", "HEAD", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"],
    credentials: true,
  };
  const host = req.get("Origin");
  if (whitelist.indexOf(host) !== -1) {
    corsOptions.origin = host;
  } else {
    corsOptions.origin = false;
  }
  callback(null, corsOptions);
};
app.use(cors(corsOptionsDelegate));

// routes
app.get("/", (req, res) => {
  res.send("WebAPI used by hcs-pintu :)");
});

app.use("/auth", require("./controller/authRoutes"));
app.use("/admin", require("./controller/adminRoutes"));
app.use("/command", require("./controller/commandRoutes"));
// app.use("/pemantauan", require("./Controller/pemantauanRoutes"));
app.use("/info", require("./controller/infoRoutes"));

app.use((req, res) => {
  res.status(404).json({ message: "page not found" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT} in ${app.settings.env} mode`);
  });
});
