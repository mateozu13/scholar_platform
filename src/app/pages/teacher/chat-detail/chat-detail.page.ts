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
  currentSender: string = '';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {}
}
