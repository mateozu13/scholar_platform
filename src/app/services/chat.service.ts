import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Chat, Message } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly chatsCollection = 'chats';
  private readonly messagesCollection = 'messages';

  constructor(private firestore: AngularFirestore) {}

  // Crear o obtener chat existente
  async getOrCreateChat(userId1: string, userId2: string): Promise<string> {
    const sortedIds = [userId1, userId2].sort();
    const chatId = sortedIds.join('_');

    const chatDoc = await this.firestore
      .collection(this.chatsCollection)
      .doc(chatId)
      .get()
      .toPromise();

    if (!chatDoc.exists) {
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
  sendMessage(
    chatId: string,
    senderId: string,
    content: string
  ): Promise<void> {
    const message: Message = {
      id: this.firestore.createId(),
      chatId,
      senderId,
      contenido: content,
      timestamp: new Date(),
      visto: false,
    };

    // Actualizar último mensaje en chat
    this.firestore.collection(this.chatsCollection).doc(chatId).update({
      ultimoMensaje: content,
      timestampUltimo: new Date(),
    });

    return this.firestore
      .collection(this.chatsCollection)
      .doc(chatId)
      .collection(this.messagesCollection)
      .doc(message.id)
      .set(message);
  }

  // Obtener mensajes de un chat
  getChatMessages(chatId: string) {
    return this.firestore
      .collection<Message>(this.chatsCollection)
      .doc(chatId)
      .collection(this.messagesCollection, (ref) => ref.orderBy('timestamp'))
      .valueChanges({ idField: 'id' });
  }

  // Obtener chats de un usuario
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
  markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    return this.firestore
      .collection(this.chatsCollection)
      .doc(chatId)
      .collection(this.messagesCollection, (ref) =>
        ref.where('senderId', '!=', userId).where('visto', '==', false)
      )
      .get()
      .toPromise()
      .then((snapshot) => {
        const batch = this.firestore.firestore.batch();
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, { visto: true });
        });
        return batch.commit();
      });
  }
}
