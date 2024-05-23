if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { connectDB } = require("./utils/dbConnect");
const { client } = require("./mqtt");
const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const hpp = require("hpp");

const Agent = require("./model/agent");
const Door = require("./model/Door");
const Log = require("./model/Log");
const Error = require("./model/Error");
// const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

// socket.io
io.on("connection", function (socket) {
  console.log(socket.id);

  socket.on("disconnect", (reason) => {
    console.log(reason);
  });
});
Log.watch().on("change", (data) => {
  io.emit("toggle", data.fullDocument);
});
// mqtt
client.on("message", async (topic, message) => {
  try {
    if (topic === "rfid") {
      io.emit("rfid", message.toString("utf8"));
    }
    if (topic === "auth") {
      const messageString = message.toString("utf8");
      const { rfid, doorNumber, deviceId, targetStatus, targetStatusBool } = JSON.parse(messageString);
      // console.log({ rfid, doorNumber, status, statusBool });
      const agent = await Agent.findOne({ rfid });
      const response = { targetStatus, targetStatusBool, authStatus: 0 };
      if (agent) {
        response.authStatus = 1;
        client.publish(`${topic}/${doorNumber}`, JSON.stringify(response));
        const doorUpdated = await Door.findOneAndUpdate({ doorNumber }, { statusBool: targetStatusBool, latestAgent: agent.name, lastAccessed: Date.now() });
        const newLog = await Log.insertMany({ doorNumber, deviceId, statusBool: targetStatusBool, agent: agent.name });
      }
      if (!agent) client.publish(`${topic}/${doorNumber}`, JSON.stringify(response));
    }
  } catch (err) {
    const newError = await Error.insertMany({ error: err });
    // console.log(err);
  }
});

app.use(express.json({ limit: "1kb" }));
app.use(express.urlencoded({ extended: true, limit: "1kb" }));
app.use(hpp());
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
  httpServer.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT} in ${app.settings.env} mode`);
  });
});
