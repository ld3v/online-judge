import { HttpStatus } from './httpStatus.enum';
import { Exception } from './exception';

/**
 * This function can't handle currently! Try again later - 503
 */
export class Http503Exception extends Exception {
  constructor(message = '', data?: Record<string, any>) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message, data);
  }
}
