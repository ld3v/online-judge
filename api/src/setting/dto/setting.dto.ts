import { IsBoolean, IsNumber, IsString } from 'class-validator';

class SettingDto {
  @IsNumber()
  file_size_limit: number;

  @IsNumber()
  output_size_limit: number;

  @IsString()
  default_late_rule: string;

  @IsBoolean()
  enable_registration: boolean;

  @IsNumber()
  submit_penalty: number;

  // @IsNumber()
  // moss_userid: number;
}

export default SettingDto;
