if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mqtt = require("mqtt");
const client = mqtt.connect(`mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});
const topic = "auth";
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
});

client.on("message", async (topic, message) => {
  try {
    const messageString = message.toString("utf8");
    const { rfid, doorNumber, status, statusBool } = JSON.parse(messageString);
    console.log({ rfid, doorNumber, status, statusBool });
    const agent = await Agent.findOne({ rfid });
    if (agent) {
      client.publish(`${topic}/${doorNumber}/${status}`, "1");
      const doorUpdated = await Door.findOneAndUpdate({ doorNumber }, { statusBool, latestAgent: agent.name });
      const newLog = await Log.insertMany({ doorNumber, statusBool, agent: agent.name });
    }
    if (!agent) client.publish(`${topic}/${doorNumber}/${status}`, "0");
  } catch (err) {
    const newError = await Error.insertMany({ error: err });
  }
});

module.exports = { client };
