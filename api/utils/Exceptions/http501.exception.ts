import { HttpStatus } from './httpStatus.enum';
import { Exception } from './exception';

/**
 * REQUEST NOT IMPLEMENTED - 501
 */
export class Http501Exception extends Exception {
  constructor(message = '') {
    super(HttpStatus.NOT_IMPLEMENTED, message);
  }
}
