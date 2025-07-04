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
    await this.checkUserAttempts();
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
    this.router.navigate(['/student/quiz-attempt', this.quizId]);

  }

  async checkUserAttempts() {
    const user = await this.authService.getCurrentUser();
    if (!user || !this.quiz) return;

    const allAttempts = await this.quizService.getAttemptsByStudent(user.id);
    const quizAttempts = allAttempts.filter(a => a.testId === this.quizId);
    this.existingAttempts = quizAttempts;

    this.existingAttempt = quizAttempts.length > 0
      ? quizAttempts.sort((a, b) =>
        new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime()
      )[0]
      : null;

    const intentosPermitidos = this.quiz.intentosPermitidos ?? 1;
    const intentosRealizados = quizAttempts.length;

    const fechaInicio = this.quiz.fechaInicio
      ? this.quiz.fechaInicio instanceof Date
        ? this.quiz.fechaInicio
        : (this.quiz.fechaInicio as firebase.firestore.Timestamp).toDate()
      : null;

    const ahora = new Date();
    const fechaCierre = this.quiz.fechaCierre
      ? this.quiz.fechaCierre instanceof Date
        ? this.quiz.fechaCierre
        : (this.quiz.fechaCierre as firebase.firestore.Timestamp).toDate()
      : null;

    const dentroDeFechas =
      (!fechaInicio || ahora >= fechaInicio) &&
      (!fechaCierre || ahora <= fechaCierre);

    this.canStartQuiz = dentroDeFechas && intentosRealizados < intentosPermitidos;

    console.log('Intentos permitidos:', intentosPermitidos);
    console.log('Intentos realizados:', intentosRealizados);
    console.log('Dentro de fechas:', dentroDeFechas);
    console.log('¿Puede iniciar?:', this.canStartQuiz);

    console.log('Quiz:', this.quiz);
    console.log('Fecha cierre:', this.quiz?.fechaCierre);
    console.log('Ahora:', new Date());

  }



}
