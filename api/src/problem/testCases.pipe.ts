import { PipeTransform, Injectable } from '@nestjs/common';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { cleanDir } from 'utils/func';

@Injectable()
export class TestCaseFilesValidationPipe implements PipeTransform {
  async transform(files: Express.Multer.File[]) {
    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }
    const samplePath = files[0].path;
    const problemIdNeedClean = samplePath.split('/')[2];

    const filenames = files.map(f => f.originalname);
    const inpFilenames = filenames.filter(fn => /input\d{1,3}\.txt/gm.test(fn));
    const outFilenames = filenames.filter(fn => /output\d{1,3}\.txt/gm.test(fn));
    const isHasTemplate = filenames.includes('template.cpp');

    if ((filenames.length - inpFilenames.length - outFilenames.length - (isHasTemplate ? 1 : 0)) > 0 ) {
      // Remove files if not valid
      await cleanDir(`./upload/problem-solutions/${problemIdNeedClean}`);
      throw new Http400Exception('exception.problem.solution-checking.includes-other-files');
    }
    if (inpFilenames.length !== outFilenames.length) {
      // Remove files if not valid
      await cleanDir(`./upload/problem-solutions/${problemIdNeedClean}`);
      throw new Http400Exception(
        'exception.problem.solution-checking.inp-diff-out',
        {
          inpCount: inpFilenames.length,
          outCount: outFilenames.length,
        },
      );
    }

    // Check duplicate filename
    const inputFilenamesNoDup = [...new Set([...inpFilenames])];
    const outputFilenamesNoDup = [...new Set([...outFilenames])];
    if (inputFilenamesNoDup.length < inpFilenames.length || outputFilenamesNoDup.length < outFilenames.length) {
      throw new Http400Exception('exception.problem.solution-checking.duplicated-filenames');
    }

    return files;
  }
}