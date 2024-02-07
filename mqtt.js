if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mqtt = require("mqtt");
const client = mqtt.connect(`mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});
const topic = "auth";
const topic2 = "rfid";
const Agent = require("./model/agent");
const Door = require("./model/Door");
const Log = require("./model/Log");
const Error = require("./model/Error");

client.on("connect", () => {
  client.subscribe(topic, (err) => {
    if (!err) {
      //   client.publish(topic, "Hello mqtt");
      console.log(`MQTT Broker connected, topic : ${topic} `);
      return;
    }
    console.log(err);
  });
  client.subscribe(topic2, (err) => {
    if (!err) {
      //   client.publish(topic, "Hello mqtt");
      console.log(`MQTT Broker connected, topic : ${topic2} `);
      return;
    }
    console.log(err);
  });
});

client.on("message", async (topic, message) => {
  try {
    if (topic === "rfid") {
      console.log(message.toString("utf8"));
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

module.exports = { client };
