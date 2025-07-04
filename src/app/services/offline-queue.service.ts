import { Injectable } from '@angular/core';
import { Message } from '../models/chat.model';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class OfflineQueueService {
  private readonly QUEUE_KEY = 'message_queue';

  constructor(private toastController: ToastController) {}

  // Agregar mensaje a la cola offline
  async addMessageToQueue(message: Message): Promise<void> {
    const queue = this.getQueue();
    queue.push(message);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));

    const toast = await this.toastController.create({
      message: 'Mensaje guardado para enviar cuando haya conexión',
      duration: 3000,
      position: 'bottom',
      color: 'warning',
    });
    toast.present();
  }

  // Obtener cola actual
  getQueue(): Message[] {
    const queueJson = localStorage.getItem(this.QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  }

  // Eliminar mensajes de la cola
  removeMessages(chatId: string): void {
    const queue = this.getQueue().filter((msg) => msg.chatId !== chatId);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  // Verificar si hay mensajes pendientes
  hasPendingMessages(): boolean {
    return this.getQueue().length > 0;
  }
}
