import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import { QuizAttempt } from 'src/app/models/quiz-attempt.model';
import { Test } from 'src/app/models/test.model';

@Component({
  selector: 'app-quiz-review',
  templateUrl: './quiz-review.page.html',
  styleUrls: ['./quiz-review.page.scss'],
  standalone: false,
})
export class QuizReviewPage implements OnInit {
  reviewId = '';
  submission: QuizAttempt | null = null;
  quiz: Test | null = null;
  comentarioDocente = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  async ngOnInit() {
    this.reviewId = this.route.snapshot.paramMap.get('id') || '';
    await this.cargarRevision();
  }

  async cargarRevision() {
    try {
      // Cargar intento específico por ID
      this.submission = await this.quizService.getAttemptById(this.reviewId);
      if (!this.submission) throw new Error('Entrega no encontrada');

      this.comentarioDocente = this.submission.comentarioDocente || '';

      // Cargar información del quiz
      this.quiz = await this.quizService.getTestById(this.submission.testId);
    } catch (error) {
      console.error('❌ Error cargando revisión:', error);
      alert('❌ No se pudo cargar la entrega');
    } finally {
      this.isLoading = false;
    }
  }

  async guardarComentario() {
    try {
      if (!this.submission?.id) return;

      await this.quizService.updateTeacherComment(
        this.submission.id,
        this.comentarioDocente
      );

      alert('✅ Comentario guardado');
      this.router.navigate(['/teacher/dashboard']);
    } catch (error) {
      console.error(error);
      alert('❌ Error al guardar comentario');
    }
  }
}
