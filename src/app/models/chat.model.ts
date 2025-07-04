import firebase from 'firebase/compat/app';
export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTimestamp?: firebase.firestore.Timestamp;
  courseId?: string; // Opcional para saber en qué curso se inició el chat
}

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: firebase.firestore.Timestamp;
  status?: 'sent' | 'delivered' | 'read'; // Añadir este campo
  readAt?: firebase.firestore.Timestamp; // Nuevo campo para tiempo de lectura
}
