import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import JwtAuthGuard from './jwtAuth.gaurd';
import RequestWithAccount from '../dto/reqWithAccount.interface';
 
const RoleGuard = (...roles: string[]): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);
 
      const request = context.switchToHttp().getRequest<RequestWithAccount>();
      const user = request.user;
 
      return roles.includes(request.user.role);
    }
  }
 
  return mixin(RoleGuardMixin);
}
 
export default RoleGuard;