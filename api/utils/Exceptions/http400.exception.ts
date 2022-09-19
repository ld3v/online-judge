import { Exception } from './exception';
import { HttpStatus } from './httpStatus.enum';

/**
 * BAD REQUEST - INVALID REQUEST
 */
export class Http400Exception extends Exception {
  constructor(message: string = '', data?: Record<string, any>) {
    super(HttpStatus.BAD_REQUEST, message, data);
  }
}
