import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
  currentSender: string = ''; // UID del usuario autenticado

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('chatId') || '';

    // Obtener el UID del usuario autenticado
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.currentSender = user.uid;
        this.listenToMessages(); // cargar mensajes solo cuando ya tenemos el UID
      } else {
        alert('❌ Usuario no autenticado');
      }
    });
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
