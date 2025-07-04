import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'; // Asegúrate de que Firestore esté importado
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chat, Message } from '../models/chat.model'; // Asegúrate de que tus modelos estén correctamente definidos

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // Inicializa la instancia de Firestore
  private db = firebase.firestore();

  constructor() {}

  /**
   * Obtiene todos los chats de un usuario en tiempo real.
   * Utiliza onSnapshot para escuchar cambios y mapea los datos del snapshot a un array de Chat.
   * @param userId El ID del usuario.
   * @returns Un Observable de un array de objetos Chat.
   */
  getUserChats(userId: string): Observable<Chat[]> {
    // Accede a la colección 'chats'
    return new Observable<Chat[]>((observer) => {
      // Crea una consulta para encontrar chats donde el usuario sea participante
      const query = this.db
        .collection('chats') // No se usa generic aquí
        .where('participants', 'array-contains', userId)
        .orderBy('lastMessageTimestamp', 'desc');

      // Suscríbete a los cambios en tiempo real
      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          // Mapea los documentos del snapshot a tu modelo Chat
          const chats: Chat[] = snapshot.docs.map((doc) => {
            const data = doc.data() as Chat; // Castea los datos a tu tipo Chat
            return {
              id: doc.id, // Asegúrate de incluir el ID del documento
              ...data,
            };
          });
          observer.next(chats); // Emite el array de chats
        },
        (error) => {
          observer.error(error); // Emite cualquier error
        }
      );

      // Devuelve una función de limpieza para desuscribirse cuando el Observable se complete/desuscriba
      return () => unsubscribe();
    });
  }

  /**
   * Crea o recupera un chat existente entre dos usuarios.
   * Si el chat no existe, lo crea.
   * @param userId1 El ID del primer usuario.
   * @param userId2 El ID del segundo usuario.
   * @param courseId (Opcional) El ID del curso asociado al chat.
   * @returns Una promesa que resuelve con el ID del chat.
   */
  async getOrCreateChat(
    userId1: string,
    userId2: string,
    courseId?: string
  ): Promise<string> {
    // Normaliza los participantes para crear un ID de chat consistente
    const participants = [userId1, userId2].sort();
    const chatId = participants.join('_');

    const chatRef = this.db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get(); // get() devuelve una promesa directamente en el SDK nativo

    // Si el chat no existe, créalo
    if (!chatDoc.exists) {
      await chatRef.set({
        participants,
        lastMessage: '',
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        ...(courseId && { courseId }), // Añade courseId si está presente
      });
    }

    return chatId;
  }

  /**
   * Obtiene los mensajes de un chat específico en tiempo real.
   * @param chatId El ID del chat.
   * @returns Un Observable de un array de objetos Message.
   */
  getChatMessages(chatId: string): Observable<Message[]> {
    return new Observable<Message[]>((observer) => {
      // Accede a la subcolección 'messages' dentro del documento del chat
      const query = this.db
        .collection(`chats/${chatId}/messages`) // No se usa generic aquí
        .orderBy('timestamp', 'asc');

      // Suscríbete a los cambios en tiempo real
      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          // Mapea los documentos del snapshot a tu modelo Message
          const messages: Message[] = snapshot.docs.map((doc) => {
            const data = doc.data() as Message; // Castea los datos a tu tipo Message
            return {
              id: doc.id, // Asegúrate de incluir el ID del documento
              ...data,
            };
          });
          observer.next(messages); // Emite el array de mensajes
        },
        (error) => {
          observer.error(error); // Emite cualquier error
        }
      );

      // Devuelve una función de limpieza para desuscribirse
      return () => unsubscribe();
    });
  }

  getUnreadMessagesCount(chatId: string, userId: string): Observable<number> {
    // Convierte la Promise a un Observable
    return from(
      this.db
        .collection(`chats/${chatId}/messages`)
        .where('senderId', '!=', userId)
        .where('readAt', '==', null)
        .get()
        .then((snapshot) => snapshot.size)
    );
  }

  async markMessagesAsReceived(chatId: string, userId: string): Promise<void> {
    const messagesRef = this.db.collection(`chats/${chatId}/messages`);
    const query = messagesRef
      .where('senderId', '!=', userId)
      .where('readAt', '==', null);

    const snapshot = await query.get();
    const batch = this.db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'delivered',
      });
    });

    await batch.commit();
  }

  // Método para marcar mensajes como leídos
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const messagesRef = this.db.collection(`chats/${chatId}/messages`);
    const query = messagesRef
      .where('senderId', '!=', userId)
      .where('readAt', '==', null);

    const snapshot = await query.get();
    const batch = this.db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'read',
        readAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
  }

  /**
   * Envía un nuevo mensaje a un chat.
   * También actualiza el documento del chat principal con el último mensaje.
   * @param chatId El ID del chat.
   * @param senderId El ID del remitente.
   * @param text El contenido del mensaje.
   * @returns Una promesa que resuelve con el nuevo objeto Message.
   */
  async sendMessage(chatId: string, senderId: string, text: string) {
    const messagesRef = this.db.collection(`chats/${chatId}/messages`);
    const chatRef = this.db.collection('chats').doc(chatId);

    const newMessage: Message = {
      chatId,
      senderId,
      text,
      timestamp:
        firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
      status: 'sent',
      readAt: null,
    };

    // Añadir el mensaje a la subcolección de mensajes
    await messagesRef.add(newMessage);

    // Actualizar el documento del chat con el último mensaje y su timestamp
    await chatRef.update({
      lastMessage: text,
      lastMessageTimestamp: newMessage.timestamp,
    });

    return newMessage;
  }
}
