import { Exception } from './exception';
import { HttpStatus } from './httpStatus.enum';

/**
 * MISSED STEP - USER NEED TO FINISH ANOTHER STEP TO CONTINUE
 */
export class Http311Exception extends Exception {
  constructor(message = 'You need to do one more step to continue') {
    super(HttpStatus.MORE_STEP, message);
  }
}
