import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class ProblemLanguageDTO {
  @IsOptional()
  @IsString()
  id: string; // Problem language's ID.

  @IsOptional()
  @IsNumber()
  time_limit: number;

  @IsOptional()
  @IsNumber()
  memory_limit: number;

  @IsString()
  language_id: string;
}

export default class UpdateDto {
  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  diff_cmd: string;

  @IsOptional()
  @IsString()
  diff_arg: string;

  @IsArray()
  @ValidateNested()
  @Type(() => ProblemLanguageDTO)
  languages: ProblemLanguageDTO[];
}
