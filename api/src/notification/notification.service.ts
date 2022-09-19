import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Http400Exception } from 'utils/Exceptions/http400.exception';
import { INotification } from 'utils/types';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  public async create (data: INotification): Promise<Notification> {
    const newNotify = this.notificationRepository.create(data);
    return await this.notificationRepository.save(newNotify);
  }

  public async update (curNotify: Notification, data: INotification): Promise<Notification> {
    const updateNotification = { ...curNotify, ...data };
    return await this.notificationRepository.save(updateNotification);
  }

  /**
   * This func is used to update a notification by its ID.
   * @param {string} id Notification's ID
   * @param {INotification} data Data need to update
   * @returns {Notification} Notification if updated.
   */
  public async updateById (id: string, data: INotification): Promise<Notification> {
    const curNotify = await this.notificationRepository.findOne(id);
    const updateNotification = { ...curNotify, ...data };
    return await this.notificationRepository.save(updateNotification);
  }

  /**
   * This func is used to delete a notification by its ID.
   * @param {string} id Notification's ID
   * @returns {boolean} True if deleted.
   */
  public async deleteById (id: string): Promise<boolean> {
    const res = await this.notificationRepository.delete(id);
    if (!res.affected) {
      throw new Http400Exception('notification.notfound');
    }
    return !!res.affected;
  }

  /**
   * This func is used to get a notification by its ID.
   * @param {string} id Notification's ID
   * @param {boolean} showErrIfErr Is show error if notfound? Default is `true`
   * @returns {Notification} Notification if found.
   */
  public async getById(id: string, showErrIfErr: boolean = true): Promise<Notification> {
    const curNotify = await this.notificationRepository.findOne(id);
   
    if (!curNotify && showErrIfErr) {
      throw new Http400Exception('notification.notfound', {
        notFoundId: id,
      });
    }
    return curNotify;
  }

  /**
   * This func is used to get notifications.
   * @param {number} limit Maximum of notifications. Default is `10`.
   * @returns {Notification[]} Notifications
   */
  public async getAll(limit: number = 10): Promise<Notification[]> {
    const notifications = this.notificationRepository.createQueryBuilder("notify")
      .leftJoinAndSelect("notify.created_by", "account")
      .select(["notify.id", "notify.title", "notify.text", "notify.created_at", "account.display_name"])
      .orderBy("notify.created_at", "DESC")
      .limit(limit)
      .getMany();
    return notifications;
  }
}
