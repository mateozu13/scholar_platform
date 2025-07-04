import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService
      .getCurrentUser()
      .then(async (user) => {
        if (user) {
          if (user.active) {
            return true;
          }
          const alert = await this.alertCtrl.create({
            header: 'Login',
            message: 'Tu cuenta está inhabilitada, no puedes iniciar sesión.',
            buttons: ['OK'],
          });
          await alert.present();
          return false;
        } else {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
      })
      .catch(() => {
        this.router.navigate(['/login']);
        return false;
      });
  }
}
