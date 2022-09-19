import { IsNumber, IsOptional, IsString } from 'class-validator';

export class genToken {
  @IsOptional()
  @IsString()
  accountId: string;
}

export default genToken;
