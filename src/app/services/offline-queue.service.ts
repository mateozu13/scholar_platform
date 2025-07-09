import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/chat.model';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class OfflineQueueService {
  private readonly QUEUE_KEY = 'message_queue';
  private queueSubject = new BehaviorSubject<Message[]>(this.getQueue());

  constructor(private toastController: ToastController) {}

  async addMessageToQueue(message: Message): Promise<void> {
    const queue = this.getQueue();
    queue.push(message);
    this.updateQueue(queue);

    const toast = await this.toastController.create({
      message: 'Mensaje guardado para enviar cuando haya conexión',
      duration: 3000,
      position: 'bottom',
      color: 'warning',
    });
    toast.present();
  }

  getQueue(): Message[] {
    const queueJson = localStorage.getItem(this.QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  }

  private updateQueue(queue: Message[]): void {
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    this.queueSubject.next(queue);
  }

  removeMessageFromQueue(message: Message): void {
    const queue = this.getQueue();
    const index = queue.findIndex(
      (m) =>
        m.chatId === message.chatId &&
        m.senderId === message.senderId &&
        m.text === message.text &&
        new Date(this.convertToDate(m.localTimestamp)).getTime() ===
          new Date(this.convertToDate(message.localTimestamp)).getTime()
    );

    if (index !== -1) {
      queue.splice(index, 1);
      this.updateQueue(queue);
    }
  }

  removeMessagesByChatId(chatId: string): void {
    const queue = this.getQueue().filter((msg) => msg.chatId !== chatId);
    this.updateQueue(queue);
  }

  hasPendingMessages(): boolean {
    return this.getQueue().length > 0;
  }

  getQueueUpdates() {
    return this.queueSubject.asObservable();
  }

  private convertToDate(timestamp: any): Date {
    if (timestamp instanceof Date) return timestamp;
    if (timestamp?.toDate) return timestamp.toDate();
    if (timestamp?.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  }
}
