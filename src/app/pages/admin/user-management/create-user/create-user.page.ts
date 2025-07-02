import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.page.html',
  styleUrls: ['./create-user.page.scss'],
  standalone: false,
})
export class CreateUserPage implements OnInit {
  userForm: FormGroup;
  defaultPassword = '12345678'; // Contraseña por defecto

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      telefono: [''],
    });
  }

  async createUser() {
    if (this.userForm.invalid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Creando usuario...',
    });
    await loading.present();

    try {
      const formValues = this.userForm.value;

      // 1. Crear usuario en Firebase Authentication
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(formValues.email, this.defaultPassword);

      if (!userCredential.user) {
        throw new Error('No se pudo crear el usuario en Authentication');
      }

      const userId = userCredential.user.uid;

      // 2. Crear documento en Firestore
      const newUser: User = {
        id: userId,
        nombre: formValues.nombre,
        email: formValues.email,
        rol: formValues.rol,
        telefono: formValues.telefono || '',
        createdAt: new Date(),
        active: true,
        // Puedes añadir más campos según tu modelo
      };

      await this.userService.createUser(newUser);

      // 3. Opcional: Enviar correo de verificación
      await userCredential.user.sendEmailVerification();

      // 4. Mostrar mensaje de éxito
      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: `Usuario creado correctamente. Se ha enviado un correo de verificación a ${formValues.email}`,
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.router.navigate(['/admin/user-management/list']);
            },
          },
        ],
      });
      await alert.present();
    } catch (error: any) {
      console.error('Error al crear usuario:', error);

      let errorMessage =
        'No se pudo crear el usuario. Por favor intenta de nuevo.';

      // Manejo de errores específicos
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso por otra cuenta.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no tiene un formato válido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña no es lo suficientemente segura.';
      }

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: errorMessage,
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }
}
