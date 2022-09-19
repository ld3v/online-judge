import { IsEmail, IsOptional, IsString } from 'class-validator';
export class CreateAccountDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsString()
  display_name: string;

  @IsOptional()
  @IsString()
  role: string;
}

export default CreateAccountDto;
