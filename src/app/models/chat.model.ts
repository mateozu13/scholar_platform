import firebase from 'firebase/compat/app';
export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTimestamp?: firebase.firestore.Timestamp;
  courseId?: string;
}

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: any;
  localTimestamp?: Date;
  status?: 'sent' | 'delivered' | 'read' | 'queued' | any;
  readAt?: firebase.firestore.Timestamp;
  offline?: boolean;
}
