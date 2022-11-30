import { FileInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage, DiskStorageOptions } from 'multer';
import { Request } from 'express';
 
interface SingleFileInterceptorOptions {
  fieldName: string;
  path?: (req: Request, file: Express.Multer.File, cb: (err: Error, dest: string) => void) => void;
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}

function SingleFileInterceptor (options: SingleFileInterceptorOptions): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor(configService: ConfigService) {
      const filesDestination = configService.get('UPLOAD_DIRECTORY_PATH');
 
      const destination: DiskStorageOptions['destination'] = (req, file, cb) => `${filesDestination}${options.path(req, file, cb)}`
 
      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination
        }),
        fileFilter: options.fileFilter,
        limits: options.limits
      }
 
      this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions));
    }
 
    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}
 
export default SingleFileInterceptor;