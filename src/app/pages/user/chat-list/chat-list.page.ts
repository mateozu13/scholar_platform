import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Chat } from 'src/app/models/chat.model';
import { ChatService } from 'src/app/services/chat.service';
import firebase from 'firebase/compat/app';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  standalone: false,
  styleUrls: ['./chat-list.page.scss'],
})
export class ChatListPage implements OnInit, OnDestroy {
  chats: any[] = [];
  currentUserId: string;
  courseId: string;
  unreadCountSubscriptions: Subscription[] = [];
  isLoading = true;
  chatsSubscription: Subscription;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentUserId = firebase.auth().currentUser?.uid;
    this.courseId = this.route.snapshot.paramMap.get('courseId');
  }

  ngOnInit() {
    this.loadChats();
  }

  ionViewWillEnter() {
    this.loadChats();
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
  }

  cleanupSubscriptions() {
    this.unreadCountSubscriptions.forEach((sub) => sub.unsubscribe());
    this.unreadCountSubscriptions = [];
    if (this.chatsSubscription) {
      this.chatsSubscription.unsubscribe();
    }
  }

  loadChats() {
    this.cleanupSubscriptions();
    this.isLoading = true;
    this.chats = [];

    this.chatsSubscription = this.chatService
      .getUserChats(this.currentUserId)
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a as Chat;
            return {
              ...data,
              lastMessageTimestamp: data.lastMessageTimestamp?.toDate
                ? data.lastMessageTimestamp.toDate()
                : null,
            };
          })
        )
      )
      .subscribe({
        next: async (chats) => {
          const chatPromises = chats.map(async (chat) => {
            const otherUserId = chat.participants.find(
              (p) => p !== this.currentUserId
            );
            if (otherUserId) {
              const user = await this.userService.getUserById(otherUserId);
              const existingIndex = this.chats.findIndex(
                (c) => c.id === chat.id
              );

              if (existingIndex === -1) {
                const chatWithUser = {
                  ...chat,
                  otherUser: user,
                  unreadCount: 0,
                };
                this.chats.push(chatWithUser);
                const sub = this.getUnreadCount(chat.id, otherUserId);
                this.unreadCountSubscriptions.push(sub);
              }
            }
          });

          await Promise.all(chatPromises);
          this.chats.sort(
            (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
          );
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading chats:', error);
          this.isLoading = false;
        },
      });
  }

  getUnreadCount(chatId: string, otherUserId: string): Subscription {
    this.chatService.markMessagesAsReceived(chatId, this.currentUserId);
    return this.chatService
      .getUnreadMessagesCount(chatId, this.currentUserId)
      .subscribe((count) => {
        const chatIndex = this.chats.findIndex((c) => c.id === chatId);
        if (chatIndex !== -1) {
          this.chats[chatIndex].unreadCount = count;
          this.chats = [...this.chats];
        }
      });
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  async openChat(chat: any) {
    const user = await this.userService.getUserById(this.currentUserId);
    const route = user.rol === 'estudiante' ? 'student' : 'teacher';
    this.router.navigate([`/${route}/chat`, chat.id], {
      state: {
        otherUser: chat.otherUser,
        courseId: this.courseId,
      },
    });
  }

  async openCourseUsers() {
    const user = await this.userService.getUserById(this.currentUserId);
    const route = user.rol === 'estudiante' ? 'student' : 'teacher';
    this.router.navigate([`/${route}/course`, this.courseId, 'users']);
  }
}
