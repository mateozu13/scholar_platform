export interface Chat {
  id: string;
  usuarios: string[]; // IDs de los dos usuarios
  ultimoMensaje?: string;
  timestampUltimo?: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  contenido: string;
  timestamp: Date;
  visto?: boolean;
  archivoUrl?: string;
}
