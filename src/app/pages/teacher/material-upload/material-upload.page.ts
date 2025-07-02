import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-material-upload',
  templateUrl: './material-upload.page.html',
  styleUrls: ['./material-upload.page.scss'],
  standalone: false,
})
export class MaterialUploadPage implements OnInit {
  courseId: string = '';
  selectedFile: File | null = null;
  material = {
    titulo: '',
    descripcion: '',
    tipo: 'pdf',
    url: ''
  };
  materiales: any[] = [];

  tipos = [
    { value: 'pdf', label: 'PDF' },
    { value: 'video', label: 'Video' },
    { value: 'link', label: 'Enlace Web' }
  ];

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService
    
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    this.obtenerMateriales();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async subirMaterial() {
    if (!this.material.titulo || (!this.material.url && !this.selectedFile)) {
      alert('Completa todos los campos');
      return;
    }

    try {
      if (this.selectedFile && this.material.tipo !== 'link') {
        const url = await this.storageService.uploadFile(
          this.selectedFile,
          `materiales/${this.courseId}`
        );
        this.material.url = url;
      }

      const db = firebase.firestore();
      await db
        .collection('courses')
        .doc(this.courseId)
        .collection('materiales')
        .add({
          ...this.material,
          fechaSubida: new Date()
        });

      alert('✅ Material subido con éxito');
      this.material = { titulo: '', descripcion: '', tipo: 'pdf', url: '' };
      this.selectedFile = null;
      this.obtenerMateriales();
    } catch (error) {
      console.error('❌ Error al subir material:', error);
      alert('❌ Ocurrió un error al subir el material');
    }
  }

  async obtenerMateriales() {
    const db = firebase.firestore();
    const snapshot = await db
      .collection('courses')
      .doc(this.courseId)
      .collection('materiales')
      .orderBy('fechaSubida', 'desc')
      .get();

    this.materiales = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async eliminarMaterial(id: string, url: string, tipo: string) {
    try {
      const db = firebase.firestore();
      await db
        .collection('courses')
        .doc(this.courseId)
        .collection('materiales')
        .doc(id)
        .delete();

      if (tipo !== 'link') {
        await this.storageService.deleteFile(url);
      }

      alert('🗑️ Material eliminado');
      this.obtenerMateriales();
    } catch (error) {
      console.error('❌ Error al eliminar material:', error);
      alert('Error al eliminar material');
    }
  }
}
