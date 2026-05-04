import winston from 'winston';
import path from 'path';
import { env } from '../config/env';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf((info: winston.Logform.TransformableInfo) => {
    const { level, message, timestamp: ts, stack, ...meta } = info;
    const metaStr = Object.keys(meta).length
      ? '\n' + JSON.stringify(meta, null, 2)
      : '';
    return `${ts} [${level}]: ${String(stack || message)}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

if (env.isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level:    'error',
      maxsize:  10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize:  10 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

export const logger = winston.createLogger({
  level:       env.isDevelopment ? 'debug' : 'info',
  format:      env.isDevelopment ? devFormat : prodFormat,
  transports,
  exitOnError: false,
});

// Morgan-compatible write function — used in index.ts
export function morganStream(message: string): void {
  logger.info(message.trim());
}
