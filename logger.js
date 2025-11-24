import winston from "winston";
import chalk from "chalk";

const { combine, timestamp, label, printf, colorize } = winston.format;

const customColors = {
  error: chalk.red.bold,
  warn: chalk.yellow,
  info: chalk.green,
  debug: chalk.blue,
  verbose: chalk.cyan,
  silly: chalk.magenta,
};

const myFormat = printf(({ level, message, label, timestamp }) => {
  const colorizer = customColors[level] || ((text) => text); // Default to no color if level not defined
  return `${chalk.gray(`[${timestamp}]`)} ${colorizer(
    level.toUpperCase()
  )}: ${message}`;
});

const logger = winston.createLogger({
  level: "info", // Default logging level
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), myFormat), // Log format
  transports: [
    new winston.transports.Console(), // Log to console
  ],
});

export default logger;
