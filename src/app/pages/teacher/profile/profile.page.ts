import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // <-- CORRECTO
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  userId = '';
  nombre = '';
  email = '';
  fotoUrl = '';
  isEditing = false;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private afStorage: AngularFireStorage, // <-- INYECTADO AQUÍ
    private router: Router
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        this.userId = user.uid;
        const docRef = this.afs.doc(`users/${this.userId}`);
        const snap = await docRef.get().toPromise();
        const data = snap?.data();
        if (data) {
          this.nombre = data['nombre'];
          this.email = data['email'];
          this.fotoUrl = data['fotoUrl'];
        }
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  async guardarCambios() {
    try {
      await this.afs.doc(`users/${this.userId}`).update({
        nombre: this.nombre,
        fotoUrl: this.fotoUrl,
      });
      this.isEditing = false;
      alert('✅ Cambios guardados');
    } catch (error) {
      console.error('❌ Error al guardar los cambios:', error);
      alert('❌ No se pudieron guardar los cambios');
    }
  }

  logout() {
    this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  async cambiarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });

      const base64Data = 'data:image/jpeg;base64,' + image.base64String;
      const path = `fotos_perfil/${this.userId}.jpg`;
      const storageRef = this.afStorage.ref(path); // ✔️ usando AngularFireStorage

      await storageRef.putString(base64Data, 'data_url');
      this.fotoUrl = await storageRef.getDownloadURL().toPromise();
    } catch (error) {
      console.error('❌ Error al cambiar foto de perfil:', error);
      alert('❌ No se pudo actualizar la foto');
    }
  }
}
