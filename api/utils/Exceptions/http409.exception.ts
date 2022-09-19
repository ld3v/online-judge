import { HttpStatus } from './httpStatus.enum';
import { Exception } from './exception';

/**
 * CONFLICT - 409
 */
export class Http409Exception extends Exception {
  constructor(message = '') {
    super(HttpStatus.CONFLICT, message);
  }
}
