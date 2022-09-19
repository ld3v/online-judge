import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../account.enum';
export class UpdateDto {
  @IsString()
  displayName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsEnum(Role)
  role: string;
}

export default UpdateDto;
