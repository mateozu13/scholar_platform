import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage = firebase.storage();

  // Subir archivo
  async uploadFile(file: File, path: string): Promise<string> {
    const filePath = `${path}/${Date.now()}_${file.name}`;
    const ref = this.storage.ref(filePath);
    await ref.put(file);
    return ref.getDownloadURL();
  }

  // Eliminar archivo
  async deleteFile(url: string): Promise<void> {
    const ref = this.storage.refFromURL(url);
    await ref.delete();
  }
}
