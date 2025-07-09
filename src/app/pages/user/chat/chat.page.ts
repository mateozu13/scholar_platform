import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { IonContent, Platform } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { Message } from 'src/app/models/chat.model';
import { OfflineQueueService } from 'src/app/services/offline-queue.service';
import { MessageService } from 'src/app/services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false,
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content: IonContent;

  chatId: string;
  messages: Message[] = [];
  newMessage = '';
  currentUserId: string;
  otherUser: any;
  courseId: string;
  isLoading = true;
  isActive = false;
  messagesSubscription: Subscription;
  messageSentSubscription: Subscription;
  hasPendingMessages = false;
  private queueSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private platform: Platform,
    private offlineQueue: OfflineQueueService,
    private messageService: MessageService
  ) {
    this.currentUserId = firebase.auth().currentUser?.uid;
    this.chatId = this.route.snapshot.paramMap.get('chatId');
    this.otherUser =
      this.router.getCurrentNavigation()?.extras?.state?.otherUser;
    this.courseId = this.router.getCurrentNavigation()?.extras?.state?.courseId;
  }

  async ngOnInit() {
    await this.subscribeToMessages();

    this.queueSubscription = this.offlineQueue
      .getQueueUpdates()
      .subscribe(() => {
        this.checkPendingMessages();
      });

    // Suscribirse a nuevos mensajes enviados
    this.messageSentSubscription = this.chatService.messageSent$.subscribe(
      (message) => {
        if (message && message.chatId === this.chatId && navigator.onLine) {
          this.addMessageToView(message);
        }
      }
    );
  }

  addMessageToView(message: Message) {
    const messageDate = new Date(message.timestamp);
    const exists = this.messages.some((m) => {
      // Comparar m.timestamp (Date) con messageDate (Date)
      return (
        new Date(m.timestamp).getTime() === new Date(messageDate).getTime() &&
        m.text === message.text &&
        m.senderId === message.senderId
      );
    });
    if (!exists) {
      this.messages.push(message);
    }
    this.scrollToBottom();
  }

  subscribeToMessages() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    this.messagesSubscription = this.messageService
      .getMessagesWithOffline(this.chatId)
      .subscribe({
        next: (messages) => {
          this.messages = this.removeDuplicates(messages);
          this.isLoading = false;

          if (this.isActive) {
            this.markMessagesAsRead();
          }

          this.scrollToBottom(true);
        },
        error: (err) => {
          console.error('Error loading messages:', err);
          this.isLoading = false;
        },
      });
  }
  private removeDuplicates(messages: Message[]): Message[] {
    const uniqueMessages: Message[] = [];
    const seenIds = new Set<string>();
    const seenOfflineKeys = new Set<string>();

    messages.forEach((msg) => {
      if (msg.id && !msg.offline && !seenIds.has(msg.id)) {
        seenIds.add(msg.id);
        uniqueMessages.push(msg);
      } else if (msg.offline) {
        const offlineKey = `${msg.text}_${
          msg.senderId
        }_${msg.timestamp.getTime()}`;
        if (!seenOfflineKeys.has(offlineKey)) {
          seenOfflineKeys.add(offlineKey);
          uniqueMessages.push(msg);
        }
      }
    });

    return uniqueMessages.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;

    const messageText = this.newMessage.trim();
    this.newMessage = '';

    try {
      await this.chatService.sendMessage(
        this.chatId,
        this.currentUserId,
        messageText
      );
      this.checkPendingMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  checkPendingMessages() {
    this.hasPendingMessages = this.offlineQueue.hasPendingMessages();
    if (!this.hasPendingMessages && navigator.onLine) {
      this.subscribeToMessages();
    }
  }

  ionViewDidEnter() {
    this.isActive = true;
    this.markMessagesAsRead();
    this.scrollToBottom(true);
  }

  ionViewWillLeave() {
    this.isActive = false;
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    if (this.messageSentSubscription) {
      this.messageSentSubscription.unsubscribe();
    }
    if (this.queueSubscription) this.queueSubscription.unsubscribe();
  }

  private async scrollToBottom(instant: boolean = false) {
    setTimeout(async () => {
      if (!this.content) return;
      try {
        if (instant) {
          // sin animación
          await this.content.scrollToBottom(0);
        } else {
          // con animación de 300ms
          await this.content.scrollToBottom(300);
        }
      } catch (err) {
        console.error('Error scrolling:', err);
      }
    }, 100);
  }

  getMessageStatusIcon(status: string): string {
    switch (status) {
      case 'delivered':
        return 'checkmark-done';
      case 'read':
        return 'eye';
      default:
        return 'checkmark';
    }
  }

  async markMessagesAsRead() {
    if (this.isActive) {
      await this.chatService.markMessagesAsRead(
        this.chatId,
        this.currentUserId
      );
    }
  }

  normalizeTimestamp(ts: any): Date | null {
    let d: Date;

    // 1) Si ya es Date
    if (ts instanceof Date) {
      d = ts;
    }
    // 2) Firestore Timestamp (compat)
    else if (ts && typeof ts.toDate === 'function') {
      d = ts.toDate();
    }
    // 3) Objeto con seconds/nanoseconds
    else if (
      ts &&
      typeof ts.seconds === 'number' &&
      typeof ts.nanoseconds === 'number'
    ) {
      d = new Date(ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1e6));
    }
    // 4) Número (Date.now())
    else if (typeof ts === 'number') {
      d = new Date(ts);
    }
    // 5) Cualquier otro caso invalid
    else {
      return null;
    }

    // Si la fecha es inválida (NaN), devolvemos null
    if (isNaN(d.getTime())) {
      return null;
    }

    return d;
  }
}
