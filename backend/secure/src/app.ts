import fs from "node:fs";
import https from "https";
import express from "express";
import { db } from "./db";
import { router } from "./router";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/", router);

const options = {
	key: fs.readFileSync("../cert/key.pem"),
	cert: fs.readFileSync("../cert/cert.pem"),
};

https.createServer(options, app).listen(port, () => {
	console.log(`Listening on https://localhost:${port}/`);
});

async function getUser(name: string): string {
	return await prisma.user.findUnique({ where: { name } });
}
