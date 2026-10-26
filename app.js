import express from "express";
import cors from "cors";
import messages from "./messages.js";

const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;

//=====================================================
//         Database connection setup
//=====================================================

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the database:", error);
    return;
  }
  console.log("Connected to the database OKAY.");
});

//=====================================================
//         Home route with a simple greeting
//=====================================================

app.get("/", (req, res) => {
  res.send("Hej Søde Tøzz!");
});

//=====================================================
//     Get all messages from the database (mysqlWorkbench) as arrow function
//=====================================================

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

//=====================================================
//    Get specific message by ID as arrow function
//=====================================================

app.get("/messages/:id", (request, response) => {
  // const id = request.params.id;
  // const message = messages.find((message) => message.id == id);

  const id = Number(request.params.id);
  const message = messages.find((message) => message.id === id);
  console.log(`User requested id ${id}`);

  // Laver 404 hvis message ikke findes (fx id 9)
  if (!message) {
    return response.sendStatus(404);
  }

  response.json(message);
});

//=====================================================
//                 Post a message
//=====================================================

//Created a variable to keep track of the next ID to assign to a new message.
let nextId = 3;

// Create a new message with post request
app.post("/messages", (request, response) => {
  const { user, text } = request.body ?? {};
  if (
    typeof user !== "string" ||
    typeof text !== "string" ||
    user.trim() === "" ||
    text.trim() === ""
  ) {
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

// app.post("/messages", (request, response) => {
//   console.log(request.body);

//   // 1. Find næste id
//   const newId = Math.max(...messages.map((message) => message.id)) + 1;

//   // 2. Byg den nye besked
//   const newMessage = {
//     id: newId,
//     user: request.body.user,
//     text: request.body.text,
//     timestamp: new Date().toISOString(),
//   };

//   // 3. Tilføj den til listen
//   messages.push(newMessage);

//   // 4. Svar med 201 og den opdaterede liste
//   response.status(201).json(messages);
// });

//=====================================================
//        Patch specific message by ID
//=====================================================

app.patch("/messages/:id", (request, response) => {
  const id = Number(request.params.id);
  const message = messages.find((message) => message.id === id);
  console.log(`User requested id ${id}`);

  // Laver 404 hvis message ikke findes (fx id 9)
  if (!message) {
    return response.sendStatus(404);
  }

  // Skriv de nye felter ind i beskeden, men bevar id
  Object.assign(message, request.body, { id: id });

  response.json(message);
});

//=====================================================
//           Put specific message by ID
//=====================================================

app.put("/messages/:id", (request, response) => {
  const id = Number(request.params.id);
  const message = messages.find((message) => message.id === id);
  if (!message) {
    return response.status(404).json({
      error: "Message not found",
    });
  }
  const { user, text } = request.body ?? {};
  if (
    typeof user !== "string" ||
    typeof text !== "string" ||
    user.trim() === "" ||
    text.trim() === ""
  ) {
    return response.status(400).json({
      error: "Du skal udfylde både user og text",
    });
  }
  message.user = user.trim();
  message.text = text.trim();

  response.json(message);
});

//=====================================================
//                 Delete a message
//=====================================================

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

//=====================================================
//                   Get port 3000
//=====================================================

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
