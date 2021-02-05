/**
 * SkoshX (https://skoshx.com)
 * Simple logger
 */

import { DEBUG } from "./config";

export enum LogLevels {
  Verbose, Info,
  Warning, Error,
  None,
};

export class Logger {
  private static LogLevel = DEBUG ? LogLevels.Verbose : LogLevels.Error;
  static setLogLevel(level: LogLevels) {
    Logger.LogLevel = level;
  }
  static log(message: string, level: LogLevels = LogLevels.Verbose) {
    const icons = ["❕", "❕", "⚠️", "🚨"];
    if (level >= Logger.LogLevel || level >= (window as any).LogLevel) {
      if (level >= LogLevels.Error) {
        console.trace(`${icons[level]} ${message}`); // Stacktraces for errors, helps debugging
      } else {
        console.log(`${icons[level]} ${message}`);
      }
    }
  }
}
