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
import { Platform } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { Message } from 'src/app/models/chat.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false,
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('content') content: ElementRef;

  chatId: string;
  messages: Message[] = [];
  newMessage = '';
  currentUserId: string;
  otherUser: any;
  courseId: string;
  isLoading = true;
  isActive = false;
  messagesSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private platform: Platform
  ) {
    this.currentUserId = firebase.auth().currentUser?.uid;
    this.chatId = this.route.snapshot.paramMap.get('chatId');
    this.otherUser =
      this.router.getCurrentNavigation()?.extras?.state?.otherUser;
    this.courseId = this.router.getCurrentNavigation()?.extras?.state?.courseId;
  }

  ngOnInit() {
    this.subscribeToMessages();
  }

  ionViewDidEnter() {
    this.isActive = true;
    this.markMessagesAsRead();
  }

  ionViewWillLeave() {
    this.isActive = false;
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  subscribeToMessages() {
    this.messagesSubscription = this.chatService
      .getChatMessages(this.chatId)
      .subscribe((snapshot) => {
        this.messages = snapshot.map((doc) => {
          const data = doc as Message;
          return data;
        });

        this.isLoading = false;

        if (this.isActive) {
          this.markMessagesAsRead();
        }

        setTimeout(() => this.scrollToBottom(), 100);
      });
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
      this.scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  scrollToBottom() {
    try {
      this.content.nativeElement.scrollTop =
        this.content.nativeElement.scrollHeight;
    } catch (err) {}
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
}
