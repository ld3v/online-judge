import * as fs from 'fs/promises';

export default class FileUtils {
  fileUrl: string = '';
  constructor(url: string) {
    this.fileUrl = url;
  }

  async content ()  {
    return await fs.readFile(this.fileUrl, { encoding: 'utf8' });
  }
}