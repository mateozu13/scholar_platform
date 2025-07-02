import { Component, OnInit } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getStorage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';

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
    private firestore: Firestore,
    private auth: Auth,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      const ref = doc(this.firestore, `users/${this.userId}`);
      const snap = await getDoc(ref);
      const data = snap.data();
      if (data) {
        this.nombre = data['nombre'];
        this.email = data['email'];
        this.fotoUrl = data['fotoUrl'];
      }
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  async guardarCambios() {
    const ref = doc(this.firestore, `users/${this.userId}`);
    await updateDoc(ref, {
      nombre: this.nombre,
      fotoUrl: this.fotoUrl
    });
    this.isEditing = false;
    alert('✅ Cambios guardados');
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/login']);
  }

  async cambiarFoto() {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });

    const base64Data = 'data:image/jpeg;base64,' + image.base64String;

    const storage = getStorage();
    const path = `fotos_perfil/${this.userId}.jpg`;
    const storageRef = ref(storage, path);

    // Subir imagen
    await uploadString(storageRef, base64Data, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);

    this.fotoUrl = downloadUrl;
  }
}
