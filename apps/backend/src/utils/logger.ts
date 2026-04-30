import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, colorize, printf, json } = winston.format;

// Explicitly type the info parameter so TypeScript is happy
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  printf((info: winston.Logform.TransformableInfo) => {
    const { level, message, timestamp: ts, ...meta } = info;
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : '';
    return `${ts} [${level}]: ${message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  json()
);

export const logger = winston.createLogger({
  level: env.isDevelopment ? 'debug' : 'info',
  format: env.isDevelopment ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
    ...(env.isProduction
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});