import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CoefficientRule } from 'src/setting/dto/setting.dto';

class AssignmentProblemDto {
  @IsString()
  id: string;
  
  @IsString()
  name: string;

  @IsNumber()
  @Type(() => Number)
  score: string;
}

export class CreateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  open: boolean;

  @IsBoolean()
  is_public: boolean;

  @IsDate()
  start_time: Date;

  @IsOptional()
  @IsDate()
  finish_time: Date;

  @IsNumber()
  extra_time: number;

  @IsArray()
  @ValidateNested()
  @Type(() => CoefficientRule)
  late_rules: CoefficientRule[];

  @IsOptional()
  @IsString()
  moss_update: string;

  @IsOptional()
  @IsArray()
  participants: string[];

  @IsArray()
  @ValidateNested()
  @Type(() => AssignmentProblemDto)
  problems: AssignmentProblemDto[];
}

export default CreateDto;
