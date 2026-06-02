import { ErrorCode, ErrorScope } from "./types";

export interface AppErrorOptions {
  cause?: unknown;
  code: ErrorCode;
  details?: Record<string, unknown>;
  message: string;
  scope?: ErrorScope;
  statusCode?: number;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly scope: ErrorScope;
  public readonly statusCode: number;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.scope = options.scope || this.getScopeFromCode(options.code);
    this.statusCode = options.statusCode || 500;
    this.details = options.details;
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  public toJSON() {
    return {
      code: this.code,
      details: this.details,
      message: this.message,
      name: this.name,
      scope: this.scope,
      statusCode: this.statusCode,
    };
  }

  private getScopeFromCode(code: ErrorCode): ErrorScope {
    const prefix = code.split("-")[0] as ErrorScope;
    return Object.values(ErrorScope).includes(prefix)
      ? prefix
      : ErrorScope.SYSTEM;
  }
}
