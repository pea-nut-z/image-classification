let express = require("express");
const request = require("request");

let app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  request({ url: "/" }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return res.status(500).json({ type: "error", message: err.message });
    }
    res.json(JSON.parse(body));
  });
});

app.use(express.static("./static"));

app.listen(81, function () {
  console.log("Listening on port 81");
});
