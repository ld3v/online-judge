import { HttpStatus } from './httpStatus.enum';
import { Exception } from './exception';

/**
 * UNKNOWN ERROR APPEAR WHEN GOT INVALID RESPONSE FROM THIRD PARTY - 502
 */
export class Http502Exception extends Exception {
  constructor(message = '', data?: Record<string, any>) {
    super(HttpStatus.BAD_GATEWAY, message, data);
  }
}
