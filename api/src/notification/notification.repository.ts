import { Repository, EntityRepository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {}
