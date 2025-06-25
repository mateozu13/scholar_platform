import { Component, OnInit } from '@angular/core';
import {
  LoadingController,
  AlertController,
  ModalController,
} from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { UserDetailModalComponent } from 'src/app/components/user-detail-modal/user-detail-modal.component';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-user.page.html',
  styleUrls: ['./list-user.page.scss'],
  standalone: false,
})
export class ListUserPage implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  currentUserRole: string = '';
  isLoading = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadUsers();
  }

  async ionViewWillEnter() {
    await this.loadUsers();
  }

  private async loadCurrentUser() {
    const user = await this.authService.getCurrentUser();
    this.currentUserRole = user?.rol || '';
  }

  async loadUsers() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando usuarios...',
      spinner: 'crescent',
    });

    try {
      await loading.present();
      this.users = await this.userService.getAllUsers();
      this.filteredUsers = [...this.users];
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      await this.showErrorAlert('No se pudieron cargar los usuarios.');
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async showUserDetails(user: User) {
    const modal = await this.modalCtrl.create({
      component: UserDetailModalComponent,
      componentProps: { user },
      cssClass: 'auto-height-modal',
    });
    await modal.present();
  }

  async deleteUser(userId: string, userName: string) {
    if (this.currentUserRole !== 'admin') {
      await this.showErrorAlert('No tienes permisos para eliminar usuarios.');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al usuario ${userName}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.confirmDelete(userId);
          },
        },
      ],
    });
    await alert.present();
  }

  private async confirmDelete(userId: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando usuario...',
      spinner: 'crescent',
    });

    try {
      await loading.present();
      await this.userService.deleteUser(userId);
      this.users = this.users.filter((user) => user.id !== userId);
      this.filteredUsers = this.filteredUsers.filter(
        (user) => user.id !== userId
      );
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      await this.showErrorAlert('No se pudo eliminar el usuario.');
    } finally {
      await loading.dismiss();
    }
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.nombre.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.rol.toLowerCase().includes(term)
    );
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'profesor':
        return 'warning';
      case 'estudiante':
        return 'success';
      default:
        return 'medium';
    }
  }
}
