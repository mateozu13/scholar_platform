import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { Chat } from 'src/app/models/chat.model';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  styleUrls: ['./chat-list.page.scss'],
  standalone: false,
})
export class ChatListPage implements OnInit {
  chats: Chat[] = [];
  currentUserId = '';

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      this.currentUserId = await this.authService.getCurrentUserId();

      if (!this.currentUserId) {
        console.warn('⚠️ Usuario no autenticado');
        return;
      }

      this.listenToChats();
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
    }
  }

  listenToChats() {
    this.chatService.getUserChats(this.currentUserId).subscribe((data) => {
      this.chats = data;
    });
  }

  abrirChat(chatId: string) {
    this.router.navigate([`/teacher/chat-detail/${chatId}`]);
  }

  obtenerOtroUsuario(usuarios: string[]): string {
    return usuarios.find(uid => uid !== this.currentUserId) || 'Desconocido';
  }
}
