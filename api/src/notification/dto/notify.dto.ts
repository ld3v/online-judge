import { IsString } from 'class-validator';

class NotificationDto {
  @IsString()
  title: string;

  @IsString()
  text: string;
}

export default NotificationDto;
