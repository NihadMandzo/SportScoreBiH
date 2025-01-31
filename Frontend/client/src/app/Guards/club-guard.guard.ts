import { CanActivateFn } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

export const clubGuardGuard: CanActivateFn = (route, state) => {

  const token:any = localStorage.getItem('accessToken');
  const decoded:any = jwtDecode(token);
  const clubId = decoded.ClubId;

  const routeClubId = route.params['id'];
  if(routeClubId==clubId ){
    return true;
  }
  return false;
};
