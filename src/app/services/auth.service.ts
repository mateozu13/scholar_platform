import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = firebase.auth();
  private usersRef = firebase.firestore().collection('Users');

  constructor(private userService: UserService, private router: Router) {}

  // Login con email y contraseña
  async login(
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<User | null> {
    try {
      // Configurar la persistencia de autenticación
      const persistence = rememberMe
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION;
      await this.auth.setPersistence(persistence);

      // Autenticar usuario
      const userCredential = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      const uid = userCredential.user?.uid;
      if (!uid) {
        return null;
      }

      // Actualizar lastLogin en Firestore
      const now = new Date();
      await this.usersRef.doc(uid).update({ lastLogin: now });

      // Recuperar datos completos del usuario
      return this.userService.getUserById(uid);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  // Recuperar contraseña
  async resetPassword(email: string): Promise<void> {
    try {
      await this.auth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error; // Re-lanzamos el error para manejarlo en el componente
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    const user = this.auth.currentUser;
    if (user) {
      return this.userService.getUserById(user.uid);
    }
    return null;
  }

  // Obtener solo el UID del usuario autenticado
  async getCurrentUserId(): Promise<string> {
    const user = this.auth.currentUser;
    return user?.uid || '';
  }

  // Cambiar contraseña
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = firebase.auth().currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      // Reautenticar al usuario
      const credentials = firebase.auth.EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await user.reauthenticateWithCredential(credentials);

      // Cambiar la contraseña
      await user.updatePassword(newPassword);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }
}
