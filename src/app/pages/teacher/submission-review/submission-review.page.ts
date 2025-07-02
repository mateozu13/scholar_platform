import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Firestore,
  doc,
  getDoc,
  updateDoc,
  DocumentData
} from '@angular/fire/firestore';

@Component({
  selector: 'app-submission-review',
  templateUrl: './submission-review.page.html',
  styleUrls: ['./submission-review.page.scss'],
  standalone: false,
})
export class SubmissionReviewPage implements OnInit {
  submissionId: string = '';
  submission: DocumentData | null = null;
  calificacion: number | null = null;
  retroalimentacion: string = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router
  ) {}

  async ngOnInit() {
    this.submissionId = this.route.snapshot.paramMap.get('submissionId') || '';
    await this.cargarEntrega();
  }

  async cargarEntrega() {
    const ref = doc(this.firestore, `submissions/${this.submissionId}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      this.submission = snap.data();
      this.calificacion = this.submission.calificacion || null;
      this.retroalimentacion = this.submission.retroalimentacion || '';
    } else {
      alert('❌ Entrega no encontrada');
    }
    this.isLoading = false;
  }

  async guardarRevision() {
    if (this.calificacion === null || this.calificacion < 0 || this.calificacion > 10) {
      alert('Ingrese una calificación válida entre 0 y 10.');
      return;
    }

    try {
      await updateDoc(doc(this.firestore, `submissions/${this.submissionId}`), {
        calificacion: this.calificacion,
        retroalimentacion: this.retroalimentacion
      });
      alert('✅ Revisión guardada con éxito');
      this.router.navigate(['/teacher/dashboard']);
    } catch (error) {
      console.error(error);
      alert('❌ Error al guardar la revisión');
    }
  }
}
