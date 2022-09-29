import { IsOptional, IsString } from 'class-validator';


export class CreateDto {
  @IsString()
  problemId: string;

  @IsString()
  assignmentId: string;

  @IsString()
  languageExtension: string;

  @IsOptional()
  @IsString()
  code: string;
}

export default CreateDto;
