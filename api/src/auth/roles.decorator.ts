import { SetMetadata } from '@nestjs/common';
import { Role } from '../account/account.enum';

export const Roles = (...roles: Role[]) => SetMetadata('role', roles);
