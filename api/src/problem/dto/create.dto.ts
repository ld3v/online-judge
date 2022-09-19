import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class LanguageDTO {
  @IsString()
  language_id: string; // Language's ID

  @IsOptional()
  @IsNumber()
  time_limit: number;

  @IsOptional()
  @IsNumber()
  memory_limit: number;
}

export class CreateDto {
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
  @Type(() => LanguageDTO)
  languages: LanguageDTO[];
}

export default CreateDto;
