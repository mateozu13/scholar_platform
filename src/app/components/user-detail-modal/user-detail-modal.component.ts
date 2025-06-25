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
    if (!date) return 'No disponible';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
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
