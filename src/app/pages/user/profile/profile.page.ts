import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LoadingController,
  AlertController,
  ActionSheetController,
} from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isEditing = true;
  isPasswordEditing = false;
  isLoading = false;
  profileImageUrl: string | null = null;
  newImage: Blob | null = null;
  stats: any = {};

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private storageService: StorageService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      telefono: [''],
      bio: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.checkPasswords }
    );
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  async ionViewWillEnter() {
    await this.loadUserData();
  }

  async loadUserData() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando perfil...',
    });
    await loading.present();

    try {
      this.currentUser = await this.authService.getCurrentUser();
      if (this.currentUser) {
        this.profileForm.patchValue({
          telefono: this.currentUser.telefono || '',
          bio: this.currentUser.bio || '',
        });
        this.profileImageUrl = this.currentUser.fotoPerfil || null;

        // Cargar estadísticas según rol
        await this.loadUserStats();
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo cargar la información del perfil',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async loadUserStats() {
    if (!this.currentUser) return;

    // Estadísticas para estudiantes
    if (this.currentUser.rol === 'estudiante') {
      this.stats = {
        enrolledCourses: this.currentUser.cursosInscritos?.length || 0,
        completedAssignments: 0, // Implementar según tu lógica
        averageGrade: 0, // Implementar según tu lógica
      };
    }

    // Estadísticas para profesores
    if (this.currentUser.rol === 'profesor') {
      this.stats = {
        taughtCourses: this.currentUser.cursosDictados?.length || 0,
        createdAssignments: 0, // Implementar según tu lógica
        studentsTaught: 0, // Implementar según tu lógica
      };
    }

    // Estadísticas para admin
    if (this.currentUser.rol === 'admin') {
      this.stats = {
        totalUsers: 0, // Implementar según tu lógica
        totalCourses: 0, // Implementar según tu lógica
      };
    }
  }

  checkPasswords(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { notSame: true };
  }

  async changeProfilePicture() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Cambiar foto de perfil',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera-outline',
          handler: () => {
            this.takePhoto(CameraSource.Camera);
          },
        },
        {
          text: 'Seleccionar de galería',
          icon: 'image-outline',
          handler: () => {
            this.takePhoto(CameraSource.Photos);
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  async takePhoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri, // ← cambio clave
        source,
      });

      if (image.webPath) {
        this.profileImageUrl = image.webPath; // para previsualizar <img [src]>
        const resp = await fetch(image.webPath); // aquí sí es seguro
        this.newImage = await resp.blob(); // Blob listo para subir
      }
    } catch (err) {
      console.error('Error al tomar/seleccionar foto:', err);
    }
  }

  async saveProfile() {
    if (!this.currentUser || this.profileForm.invalid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Guardando cambios...',
    });
    await loading.present();

    try {
      // Subir nueva imagen si existe
      if (this.newImage) {
        const filePath = `profile_images/${
          this.currentUser.id
        }/${Date.now()}.jpg`;
        const fileToUpload =
          this.newImage instanceof File
            ? this.newImage
            : this.blobToFile(this.newImage, `image_${Date.now()}.jpg`);

        const url = await this.storageService.uploadFile(
          fileToUpload,
          filePath
        );
        this.profileImageUrl = url;
      }

      // Actualizar datos del usuario
      const updatedUser: User = {
        ...this.currentUser,
        ...this.profileForm.value,
        fotoPerfil: this.profileImageUrl || this.currentUser.fotoPerfil,
      };

      await this.userService.updateUser(this.currentUser.id, updatedUser);
      this.currentUser = updatedUser;
      this.isEditing = false;

      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Perfil actualizado correctamente',
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo actualizar el perfil',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  async changePassword() {
    if (this.passwordForm.invalid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Cambiando contraseña...',
    });
    await loading.present();

    try {
      const { currentPassword, newPassword } = this.passwordForm.value;

      // Reautenticar al usuario
      const user = firebase.auth().currentUser;
      if (!user || !user.email) throw new Error('Usuario no autenticado');

      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await user.reauthenticateWithCredential(credential);

      // Actualizar contraseña
      await user.updatePassword(newPassword);

      this.passwordForm.reset();
      this.isPasswordEditing = false;

      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Contraseña cambiada correctamente',
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      let message = 'No se pudo cambiar la contraseña';
      if (error.code === 'auth/wrong-password') {
        message = 'La contraseña actual es incorrecta';
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

  getRoleLabel(role: string): string {
    switch (role) {
      case 'estudiante':
        return 'Estudiante';
      case 'profesor':
        return 'Profesor';
      case 'admin':
        return 'Administrador';
      default:
        return role;
    }
  }

  formatDate(date: any): string {
    if (!date) return 'No disponible';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
  }
}
