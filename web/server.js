let express = require("express");
// const request = require("request");

let app = express();
const path = require("path");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// app.get("/", (req, res) => {
//   request({ url: "/" }, (error, response, body) => {
//     if (error || response.statusCode !== 200) {
//       return res.status(500).json({ type: "error", message: err.message });
//     }
//     res.json(JSON.parse(body));
//   });
// });

// uninstall request
const serveIndex = require("serve-index");

// app.use(express.static("static"));
app.use(express.static("static"), serveIndex("static"));

// app.get("/static/images", function (req, res) {
//   res.sendFile(__dirname + "/static/images");
// });

// app.use("./static/images", serveIndex(path.join(__dirname, "./static/images")));

app.listen(81, function () {
  console.log("Listening on port 81");
});
