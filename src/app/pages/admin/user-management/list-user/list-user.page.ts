import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-user.page.html',
  styleUrls: ['./list-user.page.scss'],
  standalone: false,
})
export class ListUserPage implements OnInit {
  users: User[] = [];

  constructor(
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async ionViewWillEnter() {
    await this.loadUsers();
  }

  private async loadUsers() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando usuarios...',
    });
    await loading.present();
    try {
      this.users = await this.userService.getAllUsers();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudieron cargar los usuarios.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }
}
