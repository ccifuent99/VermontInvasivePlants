const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();

app.use(express.json());
app.use("/dist", express.static(path.join(__dirname, "../dist")));
app.use("/static", express.static(path.join(__dirname, "../static")));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../static/index.html"))
);

app.use((err, req, res, next) => {
  if (err.message && !err.errors) {
    res.status(err.status || 500).send({ error: err.message });
  } else {
    res.status(err.status || 500).send(err.errors);
  }
});

module.exports = app;
