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

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    if (this.quizId) {
      this.cargarQuiz();
    } else {
      this.router.navigate(['/teacher/dashboard']);
    }
  }

  cargarQuiz() {
    this.quizService.getTestById(this.quizId).subscribe((data) => {
      if (data) {
        this.quiz = data as Test;
      } else {
        alert('❌ Quiz no encontrado');
        this.router.navigate(['/teacher/dashboard']);
      }
      this.isLoading = false;
    });
  }
}
