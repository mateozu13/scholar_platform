import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const expectedRole = next.data['expectedRole'] as UserRole;

    return this.authService
      .getCurrentUser()
      .then((user) => {
        if (user && user.rol === expectedRole) {
          return true;
        } else {
          this.router.navigate(['/access-denied']);
          return false;
        }
      })
      .catch(() => {
        this.router.navigate(['/login']);
        return false;
      });
  }
}
