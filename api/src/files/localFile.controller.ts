import { Controller, HttpCode, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import MultiFileInterceptor from './interceptor/multi.interceptor';
import LocalFileInterceptor from './interceptor/single.interceptor';
import { LocalFileService } from './localFile.service';

@Controller('local-file')
export class LocalFileController {
  constructor(
    private readonly localFileService: LocalFileService,
  ) {}

  // @HttpCode(200)
  // @Post('multi')
  // @UseInterceptors(MultiFileInterceptor({
  //   fieldName: 'test',
  //   path: '/test-upload-feature',
  //   fileFilter: (_, file, callback) => {
  //     console.log(' ================ UPLOAD / INTERCEPTOR ================== ');
  //     console.log(' File:');
  //     console.log(_);
  //     console.log(' ======================================================== ');
  //     callback(null, true);
  //   },
  // }))
  // // async testUploadFiles() {
  // async testUploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
  //   console.log(' ================ UPLOAD / CONTROLLER =================== ');
  //   console.log(` Files - (${files?.length || 0} files):`);
  //   console.log(files);
  //   console.log(' ======================================================== ');
  //   return files;
  // }
}
