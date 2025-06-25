import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-user-detail-modal',
  templateUrl: './user-detail-modal.component.html',
  styleUrls: ['./user-detail-modal.component.scss'],
  standalone: false,
})
export class UserDetailModalComponent {
  @Input() user: User;

  constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }

  formatDate(date: any): string {
    if (!date) {
      return 'No disponible';
    }

    let jsDate: Date;

    // Si viene como { seconds: number, nanoseconds: number }
    if (date.seconds !== undefined && date.nanoseconds !== undefined) {
      const millis = date.seconds * 1000 + Math.floor(date.nanoseconds / 1e6);
      jsDate = new Date(millis);
    } else {
      // Si es un string ISO o un objeto Date
      jsDate = new Date(date);
    }

    if (isNaN(jsDate.getTime())) {
      return 'No disponible';
    }

    return jsDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
