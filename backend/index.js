const connectToMongo = require("./db");
const express = require("express");
const app = express();
const port = 4000;
var cors = require("cors");

connectToMongo();
app.use(express.json());
app.use(cors());

// Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
  res.send("Hello Ayush!");
});

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
