import * as fs from "node:fs";
import * as path from "path";
import https from "https";
import express from "express";
import { db } from "./db";
import { logger } from "./middleware/logger";
import { userRouter } from "./routes/user";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { transactionRouter } from "./routes/transaction";
import { jsonValidator } from "./middleware/json";
import { roleValidator } from "./middleware/role";

const app = express();

// var only = function (middleware, ...paths) {
//   return function (req, res, next) {
//     const pathCheck = paths.some((path) => path === req.path);
//     pathCheck ? middleware(req, res, next) : next();
//   };
// };
//
// var unless = function (middleware, ...paths) {
//   return function (req, res, next) {
//     const pathCheck = paths.some((path) => path === req.path);
//     pathCheck ? next() : middleware(req, res, next);
//   };
// };

app.use(jsonValidator);
app.use(logger);
app.use(authRouter);
app.use(transactionRouter);
app.use(userRouter);
app.use(adminRouter);

const options = {
  key: fs.readFileSync("../cert/key.pem"),
  cert: fs.readFileSync("../cert/cert.pem"),
};

https.createServer(options, app).listen(process.env.PORT, () => {
  console.log(`Listening on https://localhost:${process.env.PORT}/`);
});
