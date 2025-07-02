import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { doc, collection as subcollection } from 'firebase/firestore';

@Component({
  selector: 'app-material-upload',
  templateUrl: './material-upload.page.html',
  styleUrls: ['./material-upload.page.scss'],
  standalone: false,
})
export class MaterialUploadPage implements OnInit {
  courseId: string = '';
  material = {
    titulo: '',
    descripcion: '',
    tipo: 'pdf',
    url: ''
  };

  tipos = [
    { value: 'pdf', label: 'PDF' },
    { value: 'video', label: 'Video' },
    { value: 'link', label: 'Enlace Web' }
  ];

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    // Preferible usar paramMap para rutas con /:courseId
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
  }

  async subirMaterial() {
    if (!this.material.titulo || !this.material.url) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const courseDocRef = doc(this.firestore, 'courses', this.courseId);
      const materialesRef = subcollection(courseDocRef, 'materiales');
      
      await addDoc(materialesRef, {
        ...this.material,
        fechaSubida: new Date()
      });

      alert('✅ Material subido con éxito');
      this.material = { titulo: '', descripcion: '', tipo: 'pdf', url: '' };
    } catch (error) {
      console.error('❌ Error al subir material:', error);
      alert('Ocurrió un error al subir el material');
    }
  }
}
