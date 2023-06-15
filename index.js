//express require
const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path");
const app = express();

// a log.txt file is created in root directory
const accessLogStream = fs.createWriteStream(__dirname + "/log.txt", {
  flags: "a",
});
app.use(morgan("tiny", { stream: accessLogStream }));

//log all requests
app.use(morgan("tiny"));
//to serve documentation.html from public folder
app.use(express.static("public"));

// GET route request
app.get("/movies", (req, res) => res.json(top10Movies));
app.get("/", (req, res) => {
  res.send("Welcome to myFlix, a movie app.");
});

//error message
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//listen for request
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
