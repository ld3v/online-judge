import { IsString } from "class-validator";

export class RenewPasswordDto {
  @IsString()
  newPassword: string;
}

export default RenewPasswordDto;
