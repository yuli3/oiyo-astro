/**
 * Structured Logger
 * Provides consistent logging with levels and metadata.
 */

export type LogLevel = "debug" | "error" | "info" | "warn";

interface LogEvent {
  context?: Record<string, any>;
  level: LogLevel;
  message: string;
  timestamp: string;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === "development";

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  }

  public error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, any>,
  ) {
    const event = this.format("error", message, { ...context, error });
    console.error(`[ERROR] ${message}`, error, context || "");
  }

  public info(message: string, context?: Record<string, any>) {
    const event = this.format("info", message, context);
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || "");
    }
    // In production, send to external service (e.g. Datadog, Sentry)
  }

  public warn(message: string, context?: Record<string, any>) {
    const event = this.format("warn", message, context);
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || "");
    }
  }

  private format(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
  ): LogEvent {
    return {
      context,
      level,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}

export const logger = Logger.getInstance();
