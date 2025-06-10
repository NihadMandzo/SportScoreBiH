import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleServiceService } from '../Services/role-service.service';

export const userAndAdminGuardGuard: CanActivateFn = (route, state) => {
  const roleService = inject(RoleServiceService);
  const router = inject(Router);

  const role = roleService.getRole();
  console.log('Role in guard:', role);

  if (roleService.isUser() || roleService.isAdmin()) {
    return true; 
  }

  return false; 
};
