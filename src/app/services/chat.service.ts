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
  async sendMessage(
    chatId: string,
    senderId: string,
    text: string
  ): Promise<void> {
    const messageText = text.trim();
    if (!messageText) return;

    // Crear objeto de mensaje
    const newMessage: Message = {
      chatId,
      senderId,
      text: messageText,
      timestamp: firebase.firestore.Timestamp.now(),
      status: 'sent',
    };

    // Verificar conexión
    if (!navigator.onLine) {
      newMessage.status = 'queued';
      await this.offlineQueue.addMessageToQueue(newMessage);
      this.messageSentSource.next(newMessage); // Notificar a los componentes
      return;
    }

    try {
      await this.sendToFirestore(chatId, newMessage);
      this.messageSentSource.next(newMessage); // Notificar a los componentes
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('network')) {
        newMessage.status = 'queued';
        await this.offlineQueue.addMessageToQueue(newMessage);
        this.messageSentSource.next(newMessage); // Notificar a los componentes
      }
    }
  }

  // Enviar mensaje a Firestore
  private async sendToFirestore(
    chatId: string,
    message: Message
  ): Promise<void> {
    // Añadir el mensaje a la subcolección
    const docRef = await this.db
      .collection(`chats/${chatId}/messages`)
      .add(message);

    // Actualizar el documento del chat con el último mensaje
    await this.db.collection('chats').doc(chatId).update({
      lastMessage: message.text,
      lastMessageTimestamp: message.timestamp,
    });

    // Actualizar el ID del mensaje
    message.id = docRef.id;
  }

  // Procesar cola cuando hay conexión
  async processQueue(): Promise<void> {
    const queue = this.offlineQueue.getQueue();
    if (queue.length === 0) return;

    try {
      // Enviar todos los mensajes en orden
      let message: any;
      for (message of queue) {
        await this.sendToFirestore(message.chatId, message.text);
      }

      // Limpiar cola después de enviar
      this.offlineQueue.removeMessages(message.chatId);

      // Mostrar notificación de éxito
      const toast = await this.toastController.create({
        message: `Se enviaron ${queue.length} mensajes pendientes`,
        duration: 5000,
        position: 'bottom',
        color: 'success',
      });
      toast.present();
    } catch (error) {
      console.error('Error al procesar cola de mensajes:', error);
    }
  }
}
