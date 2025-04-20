import winston from "winston";
import express from "express";
import { db } from "./db";

const logfile = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.File({ filename: "../audit.log" })],
});

export const logger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (text) {
    logfile.info({
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      // response: text,
      status: res.statusCode,
    });

    return originalSend.call(this, text);
  };

  next();
};
