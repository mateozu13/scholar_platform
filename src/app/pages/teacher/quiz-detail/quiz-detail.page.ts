import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import { Test } from 'src/app/models/test.model';

@Component({
  selector: 'app-quiz-detail',
  templateUrl: './quiz-detail.page.html',
  styleUrls: ['./quiz-detail.page.scss'],
  standalone: false,
})
export class QuizDetailPage implements OnInit {
  quizId: string = '';
  quiz: Test | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    if (this.quizId) {
      await this.cargarQuiz();
    } else {
      this.router.navigate(['/teacher/dashboard']);
    }
  }

  async cargarQuiz() {
    try {
      this.quiz = await this.quizService.getTestById(this.quizId);
      if (!this.quiz) {
        alert('❌ Quiz no encontrado');
        this.router.navigate(['/teacher/dashboard']);
      }
    } catch (error) {
      console.error('❌ Error al cargar el quiz:', error);
      alert('❌ Ocurrió un error al cargar el quiz');
      this.router.navigate(['/teacher/dashboard']);
    } finally {
      this.isLoading = false;
    }
  }
}
