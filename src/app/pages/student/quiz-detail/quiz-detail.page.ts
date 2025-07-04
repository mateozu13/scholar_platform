import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';
import { Test } from '../../../models/test.model';
import { AuthService } from '../../../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-quiz-detail',
  templateUrl: './quiz-detail.page.html',
  styleUrls: ['./quiz-detail.page.scss'],
  standalone: false,
})
export class QuizDetailPage implements OnInit {
  quiz: Test | null = null;
  quizId: string = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('quizId') || '';
    await this.loadQuizDetail();
  }

  async loadQuizDetail() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Cargando evaluación...' });
    await loading.present();

    try {
      this.quiz = await this.quizService.getTestById(this.quizId);
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo cargar la evaluación.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    let d: Date;
    if (date instanceof firebase.firestore.Timestamp) {
      d = date.toDate();
    } else if (typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000);
    } else {
      d = new Date(date);
    }
    return d.toLocaleString('es-EC');
  }

  startQuiz() {
    this.router.navigate(['/student/quiz-attempt', this.quizId]);
  }
}
