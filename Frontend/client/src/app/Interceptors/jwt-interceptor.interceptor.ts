import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { catchError, of, switchMap, throwError, timer } from 'rxjs';
import { LoginService } from '../Services/login.service';
import { Router } from '@angular/router';
import { LoadingServiceService } from '../Services/loading-service.service';

let isRefreshing = false;
let refreshTimeout: any = null;

export const jwtInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const loadingService = inject(LoadingServiceService);

  // Get tokens from localStorage
  let accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  console.log('Interceptor triggered. Request URL:', req.url);

  if (accessToken) {
    try {
      const decodedToken: any = jwtDecode(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      console.log('Decoded Token:', decodedToken);
      console.log('Token Expiration Time:', decodedToken.exp);

      if (decodedToken.exp < currentTime) {
        console.log('Access token expired. Attempting to refresh...');

        if (!refreshToken) {
          console.error('No refresh token found. Redirecting to login.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.navigate(['/login']);
          return throwError(() => new Error('No refresh token available.'));
        }

        if (!isRefreshing) {
          isRefreshing = true;
          loadingService.showLoading();


          // Refresh the token
          return loginService.refreshToken(refreshToken).pipe(
            switchMap((response: any) => {
              console.log('Token refreshed successfully:', response);

              const newAccessToken = response.accessToken;
              const newRefreshToken = response.refreshToken;

              if (!newAccessToken || !newRefreshToken) {
                console.error('Invalid tokens received from refresh endpoint.');
                throw new Error('Tokens are missing in the response.');
              }

              // Save new tokens
              localStorage.setItem('accessToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              // Set timeout to prevent repeated refresh requests
              refreshTimeout = setTimeout(() => {
                isRefreshing = false;
                loadingService.hideLoading();
              }, 3000); // 30 seconds

              // Retry the original request
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });

              return next(clonedReq);
            }),
            catchError((error) => {
              console.error('Failed to refresh token:', error);
              isRefreshing = false;
              loadingService.hideLoading();
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        } else {
          console.log('Refresh token request already in progress. Delaying...');
          // Wait for the timeout to expire before making another request
          return timer(3000).pipe(
            switchMap(() => next(req))
          );
        }
      }
    } catch (error) {
      console.error('Failed to decode access token:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.navigate(['/login']);
    }
  }

  // Add the access token to the request headers if it exists
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken || ''}`,
    },
  });

  console.log('Proceeding with original request.');
  return next(clonedReq).pipe(
    catchError((error) => {
      console.error('Request failed:', error);
      return throwError(() => error);
    })
  );
};
