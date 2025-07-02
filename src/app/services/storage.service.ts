import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage = firebase.storage();

  // Subir archivo y devolver URL
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const filePath = `${path}/${Date.now()}_${file.name}`;
      const ref = this.storage.ref(filePath);
      const snapshot = await ref.put(file);
      return await snapshot.ref.getDownloadURL();
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      throw error;
    }
  }

  // Eliminar archivo desde URL
  async deleteFile(url: string): Promise<void> {
    try {
      const ref = this.storage.refFromURL(url);
      await ref.delete();
    } catch (error) {
      console.error('❌ Error al eliminar archivo:', error);
      throw error;
    }
  }
}
