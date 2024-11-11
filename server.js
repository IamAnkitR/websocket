const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

const clients = {};
const channels = {};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    const { type, userId, channelId, content } = data;

    if (type === "init") {
      clients[userId] = ws;
      console.log(`User ${userId} connected.`);
    }

    if (type === "message") {
      if (!channels[channelId]) {
        channels[channelId] = [];
      }
      const chatMessage = { userId, content, timestamp: Date.now() };
      channels[channelId].push(chatMessage);

      Object.values(clients).forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({ type: "message", channelId, chatMessage })
          );
        }
      });
    }
  });

  ws.on("close", () => {
    Object.keys(clients).forEach((id) => {
      if (clients[id] === ws) {
        delete clients[id];
        console.log(`User ${id} disconnected.`);
      }
    });
  });
});

console.log("WebSocket server running on ws://localhost:8080");
