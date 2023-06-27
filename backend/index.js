// const connectToMongo = require("./db");
const express = require("express");
const app = express();
const port = 4000;
var cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.REACT_APP_MONGOURI;

mongoose

  .connect(uri, {
    dbName: "TaskBook",
  })
  .then(() => {
    console.log("Connect To MongoDb Atlas Was SuccessFull");
  })
  .catch((err) => {
    console.log(err);
    console.log("Connect To MongoDb Atlas Was Un-SuccessFull");
  });

// connectToMongo();
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
