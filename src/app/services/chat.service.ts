import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Chat, Message } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly chatsCollection = 'chats';
  private readonly messagesCollection = 'messages';

  constructor(private firestore: AngularFirestore) {}

  // Crear o retornar chat existente
  async getOrCreateChat(userId1: string, userId2: string): Promise<string> {
    const sortedIds = [userId1, userId2].sort();
    const chatId = sortedIds.join('_');

    const chatDoc = await this.firestore
      .collection(this.chatsCollection)
      .doc(chatId)
      .get()
      .toPromise();

    if (!chatDoc?.exists) {
      const newChat: Chat = {
        id: chatId,
        usuarios: sortedIds,
        timestampUltimo: new Date(),
      };
      await this.firestore
        .collection(this.chatsCollection)
        .doc(chatId)
        .set(newChat);
    }

    return chatId;
  }

  // Enviar mensaje
  async sendMessage(
    chatId: string,
    senderId: string,
    content: string
  ): Promise<void> {
    const messageId = this.firestore.createId();
    const message: Message = {
      id: messageId,
      chatId,
      senderId,
      contenido: content,
      timestamp: new Date(),
      visto: false,
    };

    const chatRef = this.firestore.collection(this.chatsCollection).doc(chatId);

    // Actualiza datos del chat (último mensaje)
    await chatRef.update({
      ultimoMensaje: content,
      timestampUltimo: new Date(),
    });

    // Guarda el mensaje en subcolección
    await chatRef.collection(this.messagesCollection).doc(messageId).set(message);
  }

  // Obtener mensajes de un chat (observable)
  getChatMessages(chatId: string) {
    return this.firestore
      .collection(this.chatsCollection)
      .doc(chatId)
      .collection<Message>(this.messagesCollection, (ref) =>
        ref.orderBy('timestamp')
      )
      .valueChanges({ idField: 'id' });
  }

  // Obtener los chats del usuario (observable)
  getUserChats(userId: string) {
    return this.firestore
      .collection<Chat>(this.chatsCollection, (ref) =>
        ref
          .where('usuarios', 'array-contains', userId)
          .orderBy('timestampUltimo', 'desc')
      )
      .valueChanges({ idField: 'id' });
  }

  // Marcar mensajes como leídos
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const messagesRef = this.firestore
      .collection(this.chatsCollection)
      .doc(chatId)
      .collection(this.messagesCollection, (ref) =>
        ref.where('senderId', '!=', userId).where('visto', '==', false)
      );

    const snapshot = await messagesRef.get().toPromise();

    const batch = this.firestore.firestore.batch();
    snapshot?.docs.forEach((doc) => {
      batch.update(doc.ref, { visto: true });
    });

    await batch.commit();
  }
}
