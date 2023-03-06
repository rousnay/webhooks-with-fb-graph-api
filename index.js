// To load an ES module, set "type": "module" in the package.json
// import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// dotenv.config();
require("dotenv").config();
const express = require("express");
const xHub = require("express-x-hub");
const bodyParser = require("body-parser");

const PORT = process.env.PORT;
const TOKEN = process.env.TOKEN;
const SECRET = process.env.APP_SECRET;

const app = express();
app.set("port", PORT);
app.listen(app.get("port"));

app.use(xHub({ algorithm: "sha1", secret: SECRET }));
app.use(bodyParser.json());

var received_updates = [];

app.get("/", function (req, res) {
  console.log(req);
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
});

var received_updates = [TOKEN, SECRET];

app.get("/test", function (req, res) {
  console.log(req);
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
});

app.get(["/facebook", "/instagram"], function (req, res) {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == TOKEN
  ) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/facebook", function (req, res) {
  console.log("Facebook request body:", req.body.json());

  if (!req.isXHubValid()) {
    console.log(
      "Warning - request header X-Hub-Signature not present or invalid"
    );
    res.sendStatus(401);
    return;
  }

  console.log("request header X-Hub-Signature validated");
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post("/instagram", function (req, res) {
  console.log("Instagram request body:");
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen();
