import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from '../models/chat.model';
import { OfflineQueueService } from './offline-queue.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private offlineQueue: OfflineQueueService) {}

  // Obtener mensajes de un chat incluyendo los pendientes offline
  getMessagesWithOffline(chatId: string): Observable<Message[]> {
    return from(
      firebase
        .firestore()
        .collection(`chats/${chatId}/messages`)
        .orderBy('timestamp', 'asc')
        .get()
    ).pipe(
      map((snapshot) => {
        // 1) Mensajes de Firestore
        const firestoreMessages: any[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Message;
          // Firestore Timestamp -> Date
          const ts = data.timestamp;
          const date: Date =
            typeof ts === 'object' && ts !== null && 'toDate' in ts
              ? ts.toDate()
              : new Date(ts);
          return {
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            timestamp: date,
          };
        });

        // 2) Mensajes encolados offline
        const offlineMessages: any[] = this.offlineQueue
          .getQueue()
          .filter((item) => item.chatId === chatId)
          .map((item) => {
            const msg = item;
            // msg.timestamp es number si viene de Date.now()
            const date: Date =
              typeof msg.timestamp === 'number'
                ? new Date(msg.timestamp)
                : // por si acaso viene Timestamp
                (msg.timestamp as any).toDate
                ? (msg.timestamp as any).toDate()
                : new Date(msg.timestamp);
            return {
              text: msg.text,
              senderId: msg.senderId,
              timestamp: date,
              offline: true,
            };
          });

        // 3) Fusionar y ordenar
        const all = [...firestoreMessages, ...offlineMessages];
        return all.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
      })
    );
  }

  // Obtener conteo diario de mensajes (para dashboard)
  getDailyMessageCounts(days: number): Observable<number[]> {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    return from(
      firebase
        .firestore()
        .collectionGroup('messages')
        .where(
          'timestamp',
          '>=',
          firebase.firestore.Timestamp.fromDate(startDate)
        )
        .get()
    ).pipe(
      map((snapshot) => {
        const counts = new Array(days).fill(0);
        snapshot.docs.forEach((doc) => {
          const message = doc.data() as any;
          const date = message.timestamp.toDate();
          const dayIndex = Math.floor(
            (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (dayIndex >= 0 && dayIndex < days) {
            counts[dayIndex]++;
          }
        });
        return counts;
      })
    );
  }

  private convertToDate(timestamp: any): Date {
    if (timestamp instanceof Date) {
      return timestamp;
    } else if (timestamp instanceof firebase.firestore.Timestamp) {
      return timestamp.toDate();
    } else if (timestamp?.toDate) {
      return timestamp.toDate();
    } else if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000);
    } else if (timestamp) {
      return new Date(timestamp);
    }
    return new Date();
  }
}
