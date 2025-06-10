import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceService {

 getRole(): string {
  return localStorage.getItem('userRole') || 'Guest';
}


isAdmin(): boolean {
  const role = this.getRole();
  return role.toLowerCase() === 'admin';
}

isUser(): boolean {
  const role = this.getRole();
  return role.toLowerCase() === 'user';
}

isGuest(): boolean {
  const role = this.getRole();
  return role.toLowerCase() === 'guest';
}
}
