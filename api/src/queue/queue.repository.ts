import { Repository, EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Queue } from './entities/queue.entity';

@Injectable()
@EntityRepository(Queue)
export class QueueRepository extends Repository<Queue> {}
