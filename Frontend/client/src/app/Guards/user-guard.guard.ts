import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { RoleServiceService } from '../Services/role-service.service';

export const userGuardGuard: CanActivateFn = (route, state) => {
  const roleService = inject(RoleServiceService);
  return roleService.isUser();
};
