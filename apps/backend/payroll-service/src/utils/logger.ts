import * as winston from "winston";

const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf } = format;

// Define custom format for log messages
const myFormat = printf((info) => {
  return `${info.timestamp || new Date().toISOString()} [${info.level}]: ${info.message}`;
});

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.Console(),
    // Add file transports only in production
    ...(process.env.NODE_ENV === "production"
      ? [
          new transports.File({ filename: "logs/error.log", level: "error" }),
          new transports.File({ filename: "logs/combined.log" }),
        ]
      : []),
  ],
});

export default logger;
