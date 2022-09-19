import { HttpStatus } from './httpStatus.enum';
import { Exception } from './exception';

/**
 * FORBIDDEN - PERMISSION DENIED
 */
export class Http403Exception extends Exception {
  constructor(message = "You don't have permission to handle this action", data?: Record<string, any>) {
    super(HttpStatus.FORBIDDEN, message, data);
  }
}
