export type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  message: string;
  context?: Record<string, any>;
  userId?: string;
  orderId?: string;
}

export const logger = {
  info(payload: LogPayload) {
    this.log("info", payload);
  },
  warn(payload: LogPayload) {
    this.log("warn", payload);
  },
  error(payload: LogPayload, error?: any) {
    this.log("error", {
      ...payload,
      context: {
        ...payload.context,
        errorMessage: error?.message || String(error),
        stack: error?.stack,
      },
    });
  },
  log(level: LogLevel, payload: LogPayload) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message: payload.message,
      userId: payload.userId,
      orderId: payload.orderId,
      context: payload.context || {},
      environment: process.env.NODE_ENV || "development",
    };

    if (level === "error") {
      console.error(JSON.stringify(entry));
    } else if (level === "warn") {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  },
};
