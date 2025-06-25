import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly collection = 'Users';
  private db = firebase.firestore();

  // Obtener usuario por ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(userId).get();
      return doc.exists ? ({ id: doc.id, ...doc.data() } as User) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Crear usuario (solo admin)
  async createUser(user: User): Promise<void> {
    await this.db.collection(this.collection).doc(user.id).set(user);
  }

  // Actualizar usuario
  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    try {
      await firebase
        .firestore()
        .collection(this.collection)
        .doc(userId)
        .update(data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios (solo admin)
  async getAllUsers(): Promise<User[]> {
    const snapshot = await firebase
      .firestore()
      .collection(this.collection)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  }

  // Obtener usuarios por rol
  async getUsersByRole(role: User['rol']): Promise<User[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where('rol', '==', role)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  }

  // Eliminar usuario (solo admin)
  async deleteUser(userId: string): Promise<void> {
    await this.db.collection(this.collection).doc(userId).delete();
  }
}
