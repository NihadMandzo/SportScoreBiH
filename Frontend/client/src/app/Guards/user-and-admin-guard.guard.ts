import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleServiceService } from '../Services/role-service.service';

export const userAndAdminGuardGuard: CanActivateFn = (route, state) => {
  const roleService = inject(RoleServiceService);
  const router = inject(Router);

  const role = roleService.getRole();
  console.log('Role in guard:', role);
  // Provjeri da li je korisnik User ili Admin
  if (roleService.isUser() || roleService.isAdmin()) {
    return true; // Dozvoli pristup
  }

  return false; // Blokiraj pristup
};
