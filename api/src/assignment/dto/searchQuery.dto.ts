import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TSortType } from 'utils/types';

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsString()
  except: string;

  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  sorter_field: string;

  @IsOptional()
  @IsString()
  @IsEnum(TSortType)
  sorter_type: TSortType;
}

export default SearchQueryDto;
