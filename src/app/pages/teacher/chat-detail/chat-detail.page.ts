import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.page.html',
  styleUrls: ['./chat-detail.page.scss'],
  standalone: false,
})
export class ChatDetailPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  chatId = '';
  newMessage = '';
  messages: any[] = [];
  currentSender = 'teacher'; // Aquí puedes usar el ID real del docente

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('chatId') || '';
    this.listenToMessages();
  }

  listenToMessages() {
    this.chatService.getChatMessages(this.chatId).subscribe((msgs) => {
      this.messages = msgs;
      this.chatService.markMessagesAsRead(this.chatId, this.currentSender);
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.chatService.sendMessage(this.chatId, this.currentSender, this.newMessage);
    this.newMessage = '';
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.content.scrollToBottom(300);
  }
}
