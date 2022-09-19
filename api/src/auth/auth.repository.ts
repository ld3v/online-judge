import { Repository, EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Auth } from './entities/auth.entity';

@Injectable()
@EntityRepository(Auth)
export class AuthRepository extends Repository<Auth> {}
