import { FilesInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage, DiskStorageOptions } from 'multer';
import * as fs from 'fs/promises';
import { Problem } from 'src/problem/entities/problem.entity';

function ProblemTestCasesInterceptor (fieldName: string): Type<NestInterceptor> {
  @Injectable()
  class TestCasesInterceptor implements NestInterceptor {
    filesInterceptor: NestInterceptor;
    constructor(configService: ConfigService) {
      const filesDestination = configService.get('UPLOAD_DIRECTORY_PATH');
      const defaultId = Problem.genId();
 
      const destination: DiskStorageOptions['destination'] = async (req, file, cb) => {
        let subFolder = '';
        if (file.originalname.includes('input')) subFolder = '/in';
        if (file.originalname.includes('output')) subFolder = '/out';

        const id = req.params.id || defaultId;
        const finalDst = `${filesDestination}/problem-solutions/${id}${subFolder}`;
        // Create if dir not exist
        await fs.mkdir(finalDst, { recursive: true });
        cb(null, finalDst);
      };
 
      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination,
          filename: (_, file, callback) => {
            const filename = `${file.originalname}`;
            callback(null, filename);
          },
        }),
      }
 
      this.filesInterceptor = new (FilesInterceptor(fieldName, undefined, multerOptions));
    }
 
    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.filesInterceptor.intercept(...args);
    }
  }

  return mixin(TestCasesInterceptor);
}
 
export default ProblemTestCasesInterceptor;