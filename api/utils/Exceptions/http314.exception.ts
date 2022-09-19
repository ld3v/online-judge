import { Exception } from './exception';
import { HttpStatus } from './httpStatus.enum';

/**
 * UNDER MAINTENANCE MODE - This application is in under maintenance.
 */
export class Http314Exception extends Exception {
  constructor(message = 'You need to do one more step to continue') {
    super(HttpStatus.UNDER_MAINTENANCE, message);
  }
}
