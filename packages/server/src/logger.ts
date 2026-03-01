/** ANSI color codes */
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgRed: "\x1b[41m",
};

export type LogLevel = "log" | "warn" | "error" | "debug" | "verbose";

const levelLabel: Record<LogLevel, string> = {
  log: `${c.green}LOG${c.reset}`,
  warn: `${c.yellow}WARN${c.reset}`,
  error: `${c.red}ERROR${c.reset}`,
  debug: `${c.magenta}DEBUG${c.reset}`,
  verbose: `${c.cyan}VERBOSE${c.reset}`,
};

const formatTimestamp = () => {
  const now = new Date();
  return now.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const write = (
  level: LogLevel,
  context: string,
  message: string,
  ms?: number,
) => {
  const pid = process.pid;
  const ts = formatTimestamp();
  const msStr = ms !== undefined ? ` ${c.yellow}+${ms}ms${c.reset}` : "";

  const line = [
    `${c.green}[Hono]${c.reset}`,
    `${c.yellow}${pid}${c.reset}`,
    ` - ${ts}   `,
    `  ${levelLabel[level]}`,
    ` ${c.yellow}[${context}]${c.reset}`,
    ` ${message}${msStr}`,
  ].join(" ");

  if (level === "error") {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
};

export class Logger {
  private context: string;
  private static _startTime = Date.now();

  constructor(context: string) {
    this.context = context;
  }

  static resetTimer() {
    Logger._startTime = Date.now();
  }

  static elapsed() {
    return Date.now() - Logger._startTime;
  }

  log(message: string, ms?: number) {
    write("log", this.context, message, ms);
  }

  warn(message: string) {
    write("warn", this.context, message);
  }

  error(message: string) {
    write("error", this.context, message);
  }

  debug(message: string) {
    write("debug", this.context, message);
  }

  verbose(message: string) {
    write("verbose", this.context, message);
  }
}
