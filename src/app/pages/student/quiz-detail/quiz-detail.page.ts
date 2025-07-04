import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';
import { Test } from '../../../models/test.model';
import { AuthService } from '../../../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { QuizAttempt } from 'src/app/models/quiz-attempt.model';

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
  existingAttempts: QuizAttempt[] = [];
  userId: string = '';
  now = new Date();
  existingAttempt: QuizAttempt | null = null;
  canStartQuiz: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('quizId') || '';
    const user = await this.authService.getCurrentUser();
    this.userId = user?.id || '';
    await this.loadQuizDetail();
    await this.loadAttempts();
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

  async loadAttempts() {
    if (!this.userId || !this.quizId) return;
    this.existingAttempts = await this.quizService.getAttemptsByStudent(this.userId);
    this.existingAttempts = this.existingAttempts.filter(a => a.testId === this.quizId);
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

  get remainingAttempts(): number {
    const max = this.quiz?.intentosPermitidos ?? 1;
    return max - this.existingAttempts.length;
  }

  get isWithinDeadline(): boolean {
    if (!this.quiz?.fechaCierre) return true;
    const cierre = this.quiz.fechaCierre instanceof Date ? this.quiz.fechaCierre : new Date(this.quiz.fechaCierre);
    return this.now <= cierre;
  }

  get canAttempt(): boolean {
    return this.isWithinDeadline && this.remainingAttempts > 0;
  }

  get lastAttempt(): QuizAttempt | null {
    return this.existingAttempts.length > 0 ? this.existingAttempts[this.existingAttempts.length - 1] : null;
  }

  startQuiz() {
    if (this.canAttempt) {
      this.router.navigate(['/student/quiz-attempt', this.quizId]);
    }
  }

  async checkUserAttempts() {
  const user = await this.authService.getCurrentUser();
  if (!user || !this.quiz) return;

  const attempts = await this.quizService.getAttemptsByTest(this.quizId);
  const userAttempts = attempts.filter(a => a.studentId === user.id);

  // Tomamos el intento más reciente
  this.existingAttempt = userAttempts.sort((a, b) =>
    (b.fechaEnvio as any) - (a.fechaEnvio as any)
  )[0] || null;

  const intentosPermitidos = this.quiz.intentosPermitidos || 1;
  const intentosRealizados = userAttempts.length;

  const ahora = new Date();
  const fechaInicio = this.quiz.fechaInicio ? new Date(this.quiz.fechaInicio) : null;
  const fechaCierre = this.quiz.fechaCierre ? new Date(this.quiz.fechaCierre) : null;

  // Validar si puede rendir (dentro de la fecha y no ha superado los intentos)
  this.canStartQuiz =
    (!fechaInicio || ahora >= fechaInicio) &&
    (!fechaCierre || ahora <= fechaCierre) &&
    intentosRealizados < intentosPermitidos;
}

}
