import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { from, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from '../models/chat.model';
import { OfflineQueueService } from './offline-queue.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private offlineQueue: OfflineQueueService) {}

  getMessagesWithOffline(chatId: string): Observable<Message[]> {
    const firestoreMessages$ = new Observable<Message[]>((observer) => {
      const unsubscribe = firebase
        .firestore()
        .collection(`chats/${chatId}/messages`)
        .orderBy('timestamp', 'asc')
        .onSnapshot(
          (snapshot) => {
            const messages = snapshot.docs.map((doc) => {
              const data = doc.data() as Message;
              return {
                id: doc.id,
                ...data,
                timestamp: this.convertToDate(data.timestamp),
                offline: false,
              };
            });
            observer.next(messages);
          },
          (error) => observer.error(error)
        );

      return () => unsubscribe();
    });

    const offlineMessages$ = this.offlineQueue.getQueueUpdates().pipe(
      map((queue) =>
        queue
          .filter((msg) => msg.chatId === chatId)
          .map((msg) => ({
            ...msg,
            id: `offline_${new Date(
              this.convertToDate(msg.localTimestamp) ?? new Date()
            ).getTime()}`,
            offline: true,
            timestamp: this.convertToDate(msg.localTimestamp) ?? new Date(),
          }))
      )
    );

    return combineLatest([firestoreMessages$, offlineMessages$]).pipe(
      map(([firestore, offline]) => {
        // Filtrar mensajes offline que ya están en Firestore
        const uniqueOffline = offline.filter(
          (offMsg) =>
            !firestore.some(
              (fsMsg) =>
                fsMsg.text === offMsg.text &&
                fsMsg.senderId === offMsg.senderId &&
                Math.abs(
                  this.convertToDate(fsMsg.timestamp).getTime() -
                    this.convertToDate(offMsg.timestamp).getTime()
                ) < 30000
            )
        );

        return [...firestore, ...uniqueOffline].sort(
          (a, b) =>
            this.convertToDate(a.timestamp).getTime() -
            this.convertToDate(b.timestamp).getTime()
        );
      })
    );
  }

  private convertToDate(timestamp: any): Date {
    if (timestamp instanceof Date) return timestamp;
    if (timestamp?.toDate) return timestamp.toDate();
    if (timestamp?.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  }
}
