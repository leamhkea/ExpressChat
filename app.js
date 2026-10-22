import express from "express";

const app = express();
const port = 3000;

// Home route with a simple greeting
app.get("/", (req, res) => {
  res.send("Hej World!");
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
app.get("/messages", list_messages);
function list_messages(request, response) {
  response.send(messages);
}

// Get a specific message by ID as arrow function
app.get("/messages/:id", (request, response) => {
  const id = request.params.id;

  console.log(`User requested id ${id}`);

  const message = messages.find((message) => message.id == id);

  // Laver 404 hvis message ikke findes (fx id 9)
  if (!message) {
    response.sendStatus(404);
  }

  response.send(message);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
