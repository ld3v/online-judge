import { FilesInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
 
interface MultiFileInterceptorOptions {
  fieldName: string;
  maxCount?: number;
  path?: string;
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}
 
function MultiFileInterceptor (options: MultiFileInterceptorOptions): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    filesInterceptor: NestInterceptor;
    constructor(configService: ConfigService) {
      const filesDestination = configService.get('TEST_OUTPUT_DIRECTORY_PATH');
 
      const destination = `${filesDestination}${options.path}`
 
      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination,
          filename: (_, file, callback) => {
            const filename = `${file.originalname}`;
            callback(null, filename);
          },
        }),
        fileFilter: options.fileFilter,
        limits: options.limits
      }
 
      this.filesInterceptor = new (FilesInterceptor(options.fieldName, options.maxCount, multerOptions));
    }
 
    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.filesInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}
 
export default MultiFileInterceptor;