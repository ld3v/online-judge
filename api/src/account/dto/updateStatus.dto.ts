import { IsEnum, IsString } from 'class-validator';
import { Action } from '../account.enum';

export class UpdateStatusDto {
  @IsString()
  id: string;

  @IsString()
  @IsEnum(Action)
  action: string;
}

export default UpdateStatusDto;
