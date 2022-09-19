import { HttpException } from '@nestjs/common';

const MAP_STATUS_MSG = {
  400: 'Your request is invalid!',
  401: 'Authenticate failed, re-login to continue!',
  403: 'Permission denied!',
  404: "Can't find any information for your request!",
  409: 'Wait! We are handling your request!',
  500: 'Something went wrong! Contact to admin for more information!',
  501: "Your request can't handle currently because it isn't implemented!",
  502: "Your request can't handle currently because an unknown error appear in server",
  503: "Your request can't handle currently because this service is unavailable right now!",
  506: "Can't handle your request because server having some wrong configuration!",
  // Custom error
  310: 'Server is in maintenance progress!',
  311: 'Ohh! You need to do this step to continue',
};

export class Exception extends HttpException {
  constructor(status: number, message = '', data?: Record<string, any>) {
    super(
      {
        msg: message === '' ? MAP_STATUS_MSG[status] : message,
        data, 
      },
      status
    );
  }
}
