import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from 'src/account/account.enum';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import RoleGuard from 'src/auth/gaurd/roles.gaurd';
import { TParamId } from 'utils/types';
import NotificationDto from './dto/notify.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAll() {
    try {
      const notifications = await this.notificationService.getAll();
      return notifications;
    } catch (err) {
      throw err;
    }
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async createNotification(@Body() data: NotificationDto) {
    try {
      const newNotify = await this.notificationService.create(data);
      return newNotify;
    } catch (err) {
      throw err;
    }
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async updateNotification(
    @Param() { id }: TParamId,
    @Body() data: NotificationDto,
  ) {
    try {
      const curNotify = await this.notificationService.getById(id);
      return await this.notificationService.update(curNotify, data);
    } catch (err) {
      throw err;
    }
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleGuard(Role.Admin))
  async deleteNotification(
    @Param() { id }: TParamId,
  ) {
    try {
      const curNotify = await this.notificationService.getById(id);
      return await this.notificationService.deleteById(curNotify.id);
    } catch (err) {
      throw err;
    }
  }
}
