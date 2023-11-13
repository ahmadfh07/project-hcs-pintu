if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mqtt = require("mqtt");
const client = mqtt.connect(process.env.BROKER_URL);
const topic = "auth";
const Agent = require("./model/agent");
const Door = require("./model/Door");
const Log = require("./model/Log");

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
    const messageString = message.toString();
    const { rfid, doorNumber, status, statusBool } = JSON.parse(messageString);
    console.log({ rfid, doorNumber, status, statusBool });
    const agent = await Agent.findOne({ rfid });
    console.log(agent);
    if (agent) {
      client.publish(`${topic}/${doorNumber}/${status}`, "1");
      const doorUpdated = await Door.findOneAndUpdate({ doorNumber }, { statusBool, latestAgent: agent.name });
      const newLog = await Log.insertMany({ doorNumber, statusBool, agent: agent.name });
    }
    if (!agent) client.publish(`${topic}/${doorNumber}/${status}`, "0");
    // if (messageString == "buzzer") client.publish(topic, "buzzer juga");
  } catch (err) {
    client.publish(topic, err.message);
    client.end();
  }

  //   client.end();
});

module.exports = { client };
