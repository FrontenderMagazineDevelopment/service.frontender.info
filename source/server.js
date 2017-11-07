import 'babel-polyfill';
import restify from 'restify';
// import joi from 'joi';
import jwt from 'restify-jwt';
import cookieParser from 'restify-cookies';
import dotenv from 'dotenv';
import fs from 'fs';
import { resolve } from 'path';
import validator from 'restify-joi-middleware';
import GitHub from './lib/github/github';
import Trello from './lib/trello/trello';
import Twitter from './lib/twitter/twitter';
import Names from './lib/translit/translit';
import Utilities from './lib/utilities/utilities';

const { name, version } = require('../package.json');

try {

  const ENV_PATH = resolve(__dirname, '../../.env');
  const CONFIG_DIR = '../config/';
  const CONFIG_PATH = resolve(
    __dirname,
    `${CONFIG_DIR}application.${process.env.NODE_ENV || 'local'}.json`,
  );
  if (!fs.existsSync(ENV_PATH)) throw new Error('Envirnment files not found');
  dotenv.config({ path: ENV_PATH });

  if (!fs.existsSync(CONFIG_PATH)) throw new Error(`Config not found: ${CONFIG_PATH}`);
  const config = require(CONFIG_PATH); // eslint-disable-line

  const jwtOptions = {
    secret: process.env.JWT_SECRET,
    getToken: req => {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      } else if (req.cookies && req.cookies.token) {
        return req.cookies.token;
      }
      return null;
    },
  };

  const gitHub = new GitHub();
  const trello = new Trello();
  const twitter = new Twitter();
  const utilities = new Utilities();

  const PORT = process.env.PORT || 3053;
  const server = restify.createServer({ name, version });
  server.use(restify.plugins.acceptParser(server.acceptable));
  server.use(restify.plugins.queryParser());
  server.use(restify.plugins.bodyParser());
  server.use(restify.plugins.gzipResponse());
  server.use(cookieParser.parse);
  server.use(validator());

  server.pre((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.charSet('utf-8');
    return next();
  });

  server.get('/', jwt(jwtOptions), (req, res, next)=> {
    res.status(200);
    res.end();
    return next();
  });

  // Check if there are such github user
  server.get('/github/check/:login', jwt(jwtOptions), async (req, res, next) => {
    if (req.user.scope.isTeam === false) {
      res.status(401);
      res.end();
      return next();
    }

    let users;
    try {
      users = await gitHub.searchForUser(req.params.login);
    } catch (err) {
      res.status(500);
      res.send(err.message);
      res.end();
      return next();
    }

    if (users.length === 0) {
      res.status(404);
      res.end();
      return next();
    }

    res.status(200);
    res.send(users);
    res.end();
    return next();
  });

  server.get('/trello/check/:login', jwt(jwtOptions), async (req, res, next) => {
    if (req.user.scope.isTeam === false) {
      res.status(401);
      res.end();
      return next();
    }

    let users;
    try {
      users = await trello.searchForUser(req.params.login);
    } catch (err) {
      res.status(500);
      res.send(err.message);
      res.end();
      return next();
    }

    if (users.length === 0) {
      res.status(404);
      res.end();
      return next();
    }

    res.status(200);
    res.send(users);
    res.end();
    return next();
  });

  server.get('/twitter/check/:login', jwt(jwtOptions), async (req, res, next) => {
    if (req.user.scope.isTeam === false) {
      res.status(401);
      res.end();
      return next();
    }

    let users;
    try {
      users = await twitter.searchForUser(req.params.login);
    } catch (err) {
      res.status(500);
      res.send(err.message);
      res.end();
      return next();
    }

    if (users.length === 0) {
      res.status(404);
      res.end();
      return next();
    }

    res.status(200);
    res.send(users);
    res.end();
    return next();
  });

  server.get('/autofill/:keywords', jwt(jwtOptions), async (req, res, next) => {
    if (req.user.scope.isTeam === false) {
      res.status(401);
      res.end();
      return next();
    }

    const names = new Names(JSON.parse(req.params.keywords));
    const data = await Promise.all([
      gitHub.searchForUsers(names),
      trello.searchForUsers(names),
      twitter.searchForUsers(names)
    ]);

    const gitHubUsers = data[0];
    const trelloUsers = data[1];
    const twitterUsers = data[2];
    const gitHubUsersDetails = await Promise.all(utilities.flatten(gitHubUsers).filter((user)=>(user.type === 'User')).map((user)=>gitHub.getUser(user.login)));

    res.status(200);
    res.send({
      github: gitHubUsersDetails,
      trello: utilities.flatten(trelloUsers),
      twitter: utilities.flatten(twitterUsers),
    });
    res.end();
    return next();
  });

  server.listen(PORT);
} catch (error) {
  console.log('поймал!', error); // eslint-disable-line
}
