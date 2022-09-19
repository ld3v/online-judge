import { IsNotEmpty, IsString } from 'class-validator';

export class GetByIdParamsDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export default GetByIdParamsDto;
