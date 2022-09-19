import { HttpStatus } from './httpStatus.enum';
import { Exception } from './exception';

/**
 * DATA NOT FOUND - 404
 */
export class Http404Exception extends Exception {
  constructor(message = '') {
    super(HttpStatus.NOT_FOUND, message);
  }
}
