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
import { apiRouter } from "./routes/api";
import { jsonValidator } from "./middleware/json";
import { roleValidator } from "./middleware/role";
import { rateLimit } from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerjsdoc from "swagger-jsdoc";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    servers: [
      {
        url: "https://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        Authorization: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          value: "Bearer <JWT token here>",
        },
      },
    },
  },
  apis: ["./routes/*.ts"],
};
const swaggerDocs = swaggerjsdoc(swaggerOptions);
const swaggerUiOptions = {
  explorer: true,
};

const app = express();

app.use(
  rateLimit({
    windowMs: 1000 * 60,
    limit: 20,
    message: { error: "Woa there buddy, slow down" },
  }),
);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, swaggerUiOptions),
);
app.use(jsonValidator);
app.use(logger);
app.use(apiRouter);
app.use(authRouter);
app.use(transactionRouter);
app.use(userRouter);
app.use(adminRouter);

const options = {
  key: fs.readFileSync("../cert/key.pem"),
  cert: fs.readFileSync("../cert/cert.pem"),
};

https.createServer(options, app).listen(process.env.PORT, () => {
  console.log(`https://localhost:${process.env.PORT}/api-docs`);
});
