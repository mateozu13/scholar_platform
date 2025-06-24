import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';
  errorMsg: string = '';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  async login() {
    this.errorMsg = '';
    if (!this.email || !this.password) {
      this.errorMsg = 'Por favor ingresa tu correo y contraseña.';
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      // Obtener rol del usuario desde Firestore
      const uid = userCredential.user.uid;
      const userRef = doc(this.firestore, 'users', uid);
      const userDoc = await getDoc(userRef);
      let role = '';
      if (userDoc.exists()) {
        const data = userDoc.data();
        role = data['role'] || '';
      }
      // Redirigir según el rol
      if (role === 'teacher') {
        this.router.navigate(['/teacher/home']);
      } else if (role === 'student') {
        this.router.navigate(['/student/home']);
      } else {
        // Rol no definido, por defecto a estudiante
        this.router.navigate(['/student/home']);
      }
    } catch (error: any) {
      console.error('Login error: ', error);
      // Manejar errores comunes de autenticación
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        this.errorMsg = 'Correo o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMsg = 'Formato de correo inválido.';
      } else {
        this.errorMsg = 'Error al iniciar sesión: ' + error.message;
      }
    }
  }
}
