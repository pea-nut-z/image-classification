const express = require("express");
const app = express();
const path = require("path");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// uninstall request
const serveIndex = require("serve-index");

app.use(express.static("static"), serveIndex("static"));

app.listen(81, function () {
  console.log("Listening on port 81");
});
