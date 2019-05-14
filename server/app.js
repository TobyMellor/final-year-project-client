const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const app = express();
const dist = path.join(__dirname, "..", "dist");
const tracks = path.join(dist, "tracks");

app.get("/", (_, res) => {
  res.sendFile(dist + "/index.html");
});

app.use("/dist", express.static(dist));
app.use("/tracks", express.static(tracks));

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
