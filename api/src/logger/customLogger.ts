import { ConsoleLogger, ConsoleLoggerOptions, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const logCharMapping = {
  NEW: "-",
  INFO: "i",
  PROCESSING: "%",
  DONE: "✔",
  ERR: "✘",
};
type TLogType = "NEW" | "INFO" | "PROCESSING" | "DONE" | "ERR";

@Injectable()
class CustomLogger extends ConsoleLogger {
  constructor(
    context: string,
    options: ConsoleLoggerOptions,
    configService: ConfigService,
  ) {
    const environment = configService.get('NODE_ENV');
    super(
      context,
      {
        ...options,
        logLevels: environment === 'production'
          ? ['error', 'log', 'warn']
          : ['debug', 'error', 'log', 'verbose', 'warn'],
      }
    );
  }
  /**
   * Write a 'log' level log.
   */
  log(message: any, context?: string, level: number = -1, type: TLogType = "INFO") {
    const mainChar = logCharMapping[type];
    const prefixMessageMapping = [
      `[${mainChar}] - `,
      ` |  - [${mainChar}] - `,
      ` |    [${mainChar}] - `,
    ];
    const prefixMessage = level >= 0 ? prefixMessageMapping[level] : "";

    const args = [`${prefixMessage}${message}`, context].filter(i => i);
    super.log.apply(this, args);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, trace?: string, context?: string) {
    // TO DO
    super.error(message, trace, context)
  }
  errorCustom(err: Error & { context?: any }) {
    // const args = [message, stack, context].filter(i => i);
    super.error.apply(this, [err]);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, context?: string) {
    const args = [message, context].filter(i => i);
    super.warn.apply(this, args);
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, context?: string) {
    const args = [message, context].filter(i => i);
    super.debug.apply(this, args);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, context?: string) {
    const args = [message, context].filter(i => i);
    super.verbose.apply(this, args);
  }
};

export default CustomLogger;