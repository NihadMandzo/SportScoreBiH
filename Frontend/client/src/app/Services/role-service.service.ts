import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceService {
 // Get the user's role from localStorage
 getRole(): string {
  return localStorage.getItem('userRole') || 'Guest'; // Default to Guest
}

// Check if the user is an admin
isAdmin(): boolean {
  return this.getRole() === 'admin';
}
isUser() : boolean {
  return this.getRole()==='User';
}
isGuest() :boolean{
  return this.getRole()==='Guest';
}
}
