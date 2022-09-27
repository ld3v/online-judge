import { IsNumber, IsOptional, IsString } from 'class-validator';

class CreateDto {
  @IsString()
  name: string;

  @IsString()
  extension: string;

  @IsOptional()
  @IsNumber()
  default_time_limit: number;

  @IsOptional()
  @IsNumber()
  default_memory_limit: number;
}

export default CreateDto;
