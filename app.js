import express from "express";
import connection from "./database.js";

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the database:", error);
    return;
  }
  console.log("Connected to the database OKAY.");
});

const app = express();
app.use(express.json());
const port = 3000;

// Home route with a simple greeting
app.get("/", (req, res) => {
  res.send("Hej Søde Tøzz!");
});

// Random messages for testing
const messages = [
  {
    id: 1,
    user: "Lea",
    text: "Hej med dig",
    timestamp: "2024-06-10 12:00:00",
  },
  {
    id: 2,
    user: "Anarikke",
    text: "Hej med mig",
    timestamp: "2024-06-10 13:00:00",
  },
];

// Get all messages
app.get("/messages", (request, response) => {
  connection.query("SELECT * FROM messages ORDER BY id", (error, results) => {
    if (error) {
      console.error("Error fetching messages:", error);
      return response.status(500).json({
        error: "Error fetching messages from the database",
      });
    }
    response.json(results);
  });
});

// Get a specific message by ID as arrow function
app.get("/messages/:id", (request, response) => {
  const id = request.params.id;

  console.log(`User requested id ${id}`);

  const message = messages.find((message) => message.id == id);

  // Laver 404 hvis message ikke findes (fx id 9)
  if (!message) {
    return response.sendStatus(404);
  }

  response.send(message);
});

//Created a variable to keep track of the next ID to assign to a new message.
let nextId = 3;

// Create a new message with post request
app.post("/messages", (request, response) => {
  const { user, text } = request.body ?? {};
  if (typeof user !== "string" || typeof text !== "string" || user.trim() === "" || text.trim() === "") {
    return response.status(400).json({
      error: "Du skal udfylde både user og text",
    });
  }

  // Create a new message object with the next available ID, user, text, and timestamp
  const newMessage = {
    id: nextId++,
    user: user.trim(),
    text: text.trim(),
    timestamp: new Date().toISOString(),
  };

  messages.push(newMessage);
  response.status(201).json(newMessage);
});

app.put("/messages/:id", (request, response) => {
  const id = Number(request.params.id);
  const message = messages.find((message) => message.id === id);
  if (!message) {
    return response.status(404).json({
      error: "Message not found",
    });
  }
  const { user, text } = request.body ?? {};
  if (typeof user !== "string" || typeof text !== "string" || user.trim() === "" || text.trim() === "") {
    return response.status(400).json({
      error: "Du skal udfylde både user og text",
    });
  }
  message.user = user.trim();
  message.text = text.trim();

  response.json(message);
});

app.delete("/messages/:id", (request, response) => {
  const id = Number(request.params.id);
  const messageIndex = messages.findIndex((message) => message.id === id);
  if (messageIndex === -1) {
    return response.status(404).json({
      error: "Message not found",
    });
  }
  messages.splice(messageIndex, 1);
  response.sendStatus(204);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
