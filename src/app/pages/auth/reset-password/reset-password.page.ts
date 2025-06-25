import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false,
})
export class ResetPasswordPage implements OnInit {
  email: string = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
    });

    // Obtener email del estado de navegación si existe
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.email = navigation.extras.state['email'] || '';
    }
  }

  async sendResetLink() {
    if (!this.email || !this.validateEmail(this.email)) {
      const alert = await this.alertCtrl.create({
        header: 'Correo inválido',
        message: 'Por favor ingresa un correo electrónico válido.',
        buttons: ['OK'],
      });
      return alert.present();
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Enviando enlace de recuperación...',
    });
    await loading.present();

    try {
      await this.authService.resetPassword(this.email);

      const alert = await this.alertCtrl.create({
        header: 'Correo enviado',
        message: `Se ha enviado un enlace para restablecer tu contraseña a ${this.email}. Por favor revisa tu bandeja de entrada.`,
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.router.navigate(['/login']);
            },
          },
        ],
      });
      await alert.present();
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);

      let errorMessage =
        'Ocurrió un error al enviar el correo de recuperación. Por favor intenta de nuevo.';
      if (error.code === 'auth/user-not-found') {
        errorMessage =
          'No existe una cuenta asociada a este correo electrónico.';
      }

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: errorMessage,
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
