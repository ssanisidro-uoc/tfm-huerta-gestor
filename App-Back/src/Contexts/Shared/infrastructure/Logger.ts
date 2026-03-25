/**
 * Logger centralizado para la aplicación
 * Proporciona métodos para logging en diferentes niveles
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, any>;
  stack?: string;
}

export class Logger {
  private static instance: Logger;
  private log_level: LogLevel = LogLevel.INFO;

  private constructor() {}

  static get_instance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  set_level(level: LogLevel): void {
    this.log_level = level;
  }

  private should_log(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.log_level);
  }

  private format_log(entry: LogEntry): string {
    const { level, message, timestamp, context, data, stack } = entry;
    let output = `[${timestamp}] [${level}]`;

    if (context) {
      output += ` [${context}]`;
    }

    output += ` ${message}`;

    if (data && Object.keys(data).length > 0) {
      output += ` | ${JSON.stringify(data)}`;
    }

    if (stack) {
      output += `\n${stack}`;
    }

    return output;
  }

  private log(entry: LogEntry): void {
    if (!this.should_log(entry.level)) {
      return;
    }

    const formatted = this.format_log(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: string, data?: Record<string, any>): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      context,
      data
    });
  }

  info(message: string, context?: string, data?: Record<string, any>): void {
    this.log({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      context,
      data
    });
  }

  warn(message: string, context?: string, data?: Record<string, any>): void {
    this.log({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      context,
      data
    });
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: string,
    data?: Record<string, any>
  ): void {
    let stack: string | undefined;

    if (error instanceof Error) {
      stack = error.stack;
    }

    this.log({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      stack
    });
  }
}

export const logger = Logger.get_instance();
