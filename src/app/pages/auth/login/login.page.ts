import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  showResetPasswordCard = false;

  isDarkMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private preferences: PreferencesService
  ) {}

  async ngOnInit() {
    this.loadThemePreference();

    const rememberedEmail = await this.preferences.getRememberedEmail();

    this.loginForm = this.fb.group({
      email: [rememberedEmail || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [!!rememberedEmail], // Auto-marcar si hay email guardado
    });
  }

  async login() {
    if (this.loginForm.invalid) return;

    const { email, password, rememberMe } = this.loginForm.value;

    // Guardar/limpiar email según rememberMe
    if (rememberMe) {
      await this.preferences.setRememberedEmail(email);
    } else {
      await this.preferences.clearRememberedEmail();
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
    });
    await loading.present();

    try {
      const user = await this.authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password,
        this.loginForm.value.rememberMe
      );

      if (user) {
        switch (user.rol) {
          case 'estudiante':
            await this.router.navigate(['/student/dashboard']);
            break;
          case 'profesor':
            await this.router.navigate(['/teacher/dashboard']);
            break;
          case 'admin':
            await this.router.navigate(['/admin/dashboard']);
            break;
          default:
            await this.authService.logout();
            await this.router.navigate(['/login']);
        }
      } else {
        throw new Error('Usuario no encontrado en la base de datos');
      }
    } catch (error: any) {
      let message = 'Error al iniciar sesión. Por favor intenta de nuevo.';
      if (error.code === 'auth/user-not-found') {
        message = 'No se encontró una cuenta con este correo electrónico.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Contraseña incorrecta. Por favor intenta de nuevo.';
      } else if (
        error.message === 'Usuario no encontrado en la base de datos'
      ) {
        message = 'El usuario no está registrado en el sistema.';
      }

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message,
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  toggleResetPasswordCard() {
    this.showResetPasswordCard = !this.showResetPasswordCard;
  }

  async navigateToResetPassword() {
    await this.router.navigate(['/reset-password'], {
      state: { email: this.loginForm.value.email },
    });
  }

  toggleTheme() {
    // Alternar el modo
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private loadThemePreference() {
    // Cargar preferencia de tema desde localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    } else {
      // Modo claro por defecto
      this.isDarkMode = false;
      document.body.classList.remove('dark');
    }
  }
}
