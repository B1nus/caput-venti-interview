import fs from "node:fs";
import https from "https";
import express from "express";
import { db } from "./db";
import { logger } from "./logger";
import { router, userRouter } from "./router";

const app = express();

var only = function(middleware, ...paths) {
  return function(req, res, next) {
    const pathCheck = paths.some(path => path === req.path);
    pathCheck ? middleware(req, res, next) : next();
  };
};

app.use(express.json());
app.use(only(logger, '/register', '/login', '/unregister'));
app.use(only(userRouter, '/unregister'));
app.use(only(router, '/login', '/register'));

const options = {
	key: fs.readFileSync("../cert/key.pem"),
	cert: fs.readFileSync("../cert/cert.pem"),
};

https.createServer(options, app).listen(process.env.PORT, () => {
	console.log(`Listening on https://localhost:${process.env.PORT}/`);
});
