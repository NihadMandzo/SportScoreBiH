import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { RoleServiceService } from '../Services/role-service.service';

export const adminGuardGuard: CanActivateFn = (route, state) => {
  const roleService = inject(RoleServiceService);
  const isAdmin = roleService.isAdmin();
  console.log('Admin Guard Check:', {
    currentRole: roleService.getRole(),
    isAdmin: isAdmin,
    requestedPath: state.url
  });
  return isAdmin;
};
