const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const request = require("request");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const randomString = require("randomstring");

dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const stateKey = "spotify_auth_state";

const app = express()
  .use("/dist", express.static(dist))
  .use("/tracks", express.static(tracks))
  .use(cors())
  .use(cookieParser());
const dist = path.join(__dirname, "..", "dist");
const tracks = path.join(dist, "tracks");

app.get("/", (_, res) => {
  res.sendFile(dist + "/index.html");
});

app.post("/login", function(req, res) {
  const state = randomString.generate(16);
  const scope = "user-read-private user-read-email";
  res.cookie(stateKey, state);
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      })
  );
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
