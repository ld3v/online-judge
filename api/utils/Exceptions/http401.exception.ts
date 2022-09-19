import { HttpStatus } from './httpStatus.enum';
import { Exception } from './exception';

/**
 * UNAUTHORIZED - 401
 */
export class Http401Exception extends Exception {
  constructor(message = '') {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}
