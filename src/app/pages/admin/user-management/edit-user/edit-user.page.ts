import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
  standalone: false,
})
export class EditUserPage implements OnInit {
  userForm: FormGroup;
  private userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      telefono: [''],
    });

    // Obtener ID de usuario de los parámetros de ruta
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      // Cargar datos del usuario existente
      const loading = await this.loadingCtrl.create({
        message: 'Cargando usuario...',
      });
      await loading.present();
      try {
        const user = await this.userService.getUserById(this.userId);
        if (user) {
          // Rellenar el formulario con los datos del usuario
          this.userForm.patchValue({
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            telefono: user.telefono || '',
          });
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Usuario no encontrado',
            message: 'No se encontraron datos para el usuario especificado.',
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
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo cargar la información del usuario.',
          buttons: ['OK'],
        });
        await alert.present();
      } finally {
        await loading.dismiss();
      }
    }
  }

  async updateUser() {
    if (!this.userId || this.userForm.invalid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Actualizando usuario...',
    });
    await loading.present();
    try {
      // Obtener valores actualizados del formulario
      const updatedData: Partial<User> = { ...this.userForm.value };
      // Actualizar datos del usuario en Firestore
      await this.userService.updateUser(this.userId, updatedData);
      // Navegar de regreso a la lista de usuarios
      await this.router.navigate(['/admin/user-management/list']);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message:
          'No se pudo actualizar el usuario. Por favor intenta de nuevo.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }
}
