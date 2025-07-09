import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'; // Asegúrate de que Firestore esté importado
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chat, Message } from '../models/chat.model'; // Asegúrate de que tus modelos estén correctamente definidos
import { OfflineQueueService } from './offline-queue.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // Inicializa la instancia de Firestore
  private db = firebase.firestore();
  private messageSentSource = new BehaviorSubject<Message | null>(null);
  messageSent$ = this.messageSentSource.asObservable();
  private isProcessingQueue = false;

  constructor(
    private offlineQueue: OfflineQueueService,
    private toastController: ToastController
  ) {
    window.addEventListener('online', () => this.processQueue());
  }

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
    // Ordenar los IDs para garantizar consistencia
    const participants = [userId1, userId2].sort();
    const chatId = participants.join('_');

    const chatRef = this.db.collection('chats').doc(chatId);

    try {
      const chatDoc = await chatRef.get();

      if (!chatDoc.exists) {
        await chatRef.set({
          participants,
          lastMessage: '',
          lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          ...(courseId && { courseId }),
        });
      }

      return chatId;
    } catch (error) {
      console.error('Error creating/accessing chat:', error);
      throw error;
    }
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
  async sendMessage(
    chatId: string,
    senderId: string,
    text: string
  ): Promise<void> {
    const messageText = text.trim();
    if (!messageText) return;

    const newMessage: Message = {
      chatId,
      senderId,
      text: messageText,
      timestamp: firebase.firestore.Timestamp.now(),
      status: 'sent',
    };

    if (!navigator.onLine) {
      newMessage.status = 'queued';
      newMessage.localTimestamp = new Date(); // Guardar timestamp local
      await this.offlineQueue.addMessageToQueue(newMessage);
      this.messageSentSource.next(newMessage);
      return;
    }

    try {
      await this.sendToFirestore(chatId, newMessage);
      this.messageSentSource.next(newMessage);
    } catch (error) {
      newMessage.status = 'queued';
      newMessage.localTimestamp = new Date();
      await this.offlineQueue.addMessageToQueue(newMessage);
      this.messageSentSource.next(newMessage);
    }
  }

  private async sendToFirestore(
    chatId: string,
    message: Message
  ): Promise<void> {
    try {
      // 1. Actualizar estado a "enviando" antes de intentar
      this.messageSentSource.next({
        ...message,
        status: 'sending',
        offline: false,
      });

      // 1. Primero verificar si el chat existe
      const chatRef = this.db.collection('chats').doc(chatId);
      const chatDoc = await chatRef.get();

      // Si el chat no existe, crearlo primero
      if (!chatDoc.exists) {
        const participants = chatId.split('_'); // Asumiendo que el ID del chat es user1_user2
        await chatRef.set({
          participants,
          lastMessage: '',
          lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 2. Añadir el mensaje
      try {
        message.localTimestamp = this.convertToDate(
          message.localTimestamp ?? new Date()
        );

        message.timestamp = new Date();
      } catch (error) {}

      const docRef = await this.db
        .collection(`chats/${chatId}/messages`)
        .add(message);

      // 3. Actualizar el documento del chat con el último mensaje
      await chatRef.update({
        lastMessage: message.text,
        lastMessageTimestamp: this.convertToDate(message.timestamp),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      message.id = docRef.id;
    } catch (error) {
      console.error('Error in sendToFirestore:', error);
      throw error; // Re-lanzar el error para manejarlo en el llamador
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    const queue = this.offlineQueue.getQueue();
    if (queue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    const toast = await this.toastController.create({
      message: 'Enviando mensajes pendientes...',
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();

    let successCount = 0;
    let errorCount = 0;

    for (const message of [...queue]) {
      try {
        await this.sendToFirestore(message.chatId, message);
        this.offlineQueue.removeMessageFromQueue(message);
        successCount++;
      } catch (error) {
        console.error('Error sending queued message:', error);
        errorCount++;

        // Si el error es grave (no es de red), quitamos el mensaje de la cola
        if (
          error.code !== 'unavailable' &&
          !error.message.includes('network')
        ) {
          this.offlineQueue.removeMessageFromQueue(message);
        }
      }
    }

    this.isProcessingQueue = false;

    // Mostrar resumen al usuario
    const resultToast = await this.toastController.create({
      message: `Mensajes pendientes: ${successCount} enviados, ${errorCount} fallidos`,
      duration: 5000,
      position: 'bottom',
      color: successCount > 0 ? 'success' : 'warning',
    });
    await resultToast.present();
  }

  private convertToDate(timestamp: any): Date {
    if (timestamp instanceof Date) return timestamp;
    if (timestamp?.toDate) return timestamp.toDate();
    if (timestamp?.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  }
}
