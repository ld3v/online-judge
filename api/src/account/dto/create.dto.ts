import { IsEmail, IsString } from 'class-validator';
export class CreateDto {
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  display_name: string;
}

export default CreateDto;
