import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';


export class CoefficientRule {
  @IsArray()
  DELAY_RANGE: number[];

  @IsNumber()
  BASE_MINS: number;

  @IsOptional()
  @IsNumber()
  CONST: number;

  @IsOptional()
  @IsArray()
  VARIANT_OVER_TIME: number[];
}
class SettingDto {
  @IsNumber()
  file_size_limit: number;

  @IsNumber()
  output_size_limit: number;

  @IsArray()
  @ValidateNested()
  @Type(() => CoefficientRule)
  default_coefficient_rules: CoefficientRule[];

  @IsBoolean()
  enable_registration: boolean;

  @IsNumber()
  submit_penalty: number;

  // @IsNumber()
  // moss_userid: number;
}

export default SettingDto;
