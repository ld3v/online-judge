import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
export class CreateByAdminDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password need to be have minimum 8 characters, at least one uppercase letter, one lowercase letter, one number character and one special character',
    },
  )
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  display_name: string;

  @IsString()
  role: string;
}

export default CreateByAdminDto;
