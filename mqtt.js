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

module.exports = { client };
