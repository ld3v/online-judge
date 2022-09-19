import { HttpStatus } from './httpStatus.enum';
import { Exception } from './exception';

/**
 * WRONG CONFIGURATION - 506 - VARIANT ALSO NEGOTIATES
 */
export class Http506Exception extends Exception {
  constructor(
    message = 'Server has some configure error! Contact to admin to known more',
    data?: Record<string, any>,
  ) {
    super(HttpStatus.VARIANT_ALSO_NEGOTIATES, message, data);
  }
}
