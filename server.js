const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');

const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackCompiler = webpack(webpackConfig);
const webpackDevMiddleware = require('webpack-dev-middleware')(webpackCompiler, { ...webpackConfig.devServer, 
  noInfo: true,
  publicPath: '/'});
const webpackHotMiddleware = require('webpack-hot-middleware')(webpackCompiler);


dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SPOTIFY_AFTER_AUTHORIZATION_REDIRECT = '/spotify-authorization-redirect/';
const stateKey = 'spotify_auth_state';
const dist = path.join(__dirname, 'dist');
const tracks = path.join(dist, 'tracks');
const app = express()
  .use(webpackDevMiddleware)
  .use(webpackHotMiddleware)
  .use('/dist', express.static(dist))
  .use('/tracks', express.static(tracks))
  .use(cors())
  .use(cookieParser())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json());

function getBaseAuthorizationOptions() {
  return {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')
    },
    json: true,
  };
}

app.get('/login', function(_, res) {
  const state = uuid().slice(0, 16);
  const scope = 'user-read-private user-read-email';
  res.cookie(stateKey, state);
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        state: state
      }),
  );
});

app.get('/authorization_success', function(req, res, next) {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      `${SPOTIFY_AFTER_AUTHORIZATION_REDIRECT}?${querystring.stringify({
        error: 'state_mismatch'
      })}`
    );
  } else {
    res.clearCookie(stateKey);
    const authorizationOptions = {
      ...getBaseAuthorizationOptions(),
      form: {
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code'
      },
    };

    request.post(authorizationOptions, function(err, response, body) {
      if (err) {
        next(err);
      } else if (response.statusCode === 200) {
        const accessToken = body.access_token,
          refreshToken = body.refresh_token;
        res.redirect(
          `${SPOTIFY_AFTER_AUTHORIZATION_REDIRECT}?${querystring.stringify({
            access_token: accessToken,
            refresh_token: refreshToken
          })}`
        );
      } else {
        res.redirect(`${SPOTIFY_AFTER_AUTHORIZATION_REDIRECT}?
            ${querystring.stringify({
              error: 'invalid_token'
            })}`);
      }
    });
  }
});

app.post('/refresh-token', function(req, res, next) {
  const refreshToken = req.body.refresh_token;
  const authorizationOptions = {
    ...getBaseAuthorizationOptions(),
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
  };

  request.post(authorizationOptions, function(err, response, body) {
    if (err) {
      next(err);
    } else if (response.statusCode === 200) {
      const accessToken = body.access_token;
      res.send({
        access_token: accessToken
      });
    }
  });
});

app.use('*', function (_, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
