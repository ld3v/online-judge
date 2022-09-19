import { HttpStatus } from './httpStatus.enum';
import { Exception } from './exception';

/**
 * INTERNAL SERVER ERROR - 500
 */
export class Http500Exception extends Exception {
  constructor(message = '') {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
