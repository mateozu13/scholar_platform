import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from '../../../models/question.model';
import { QuizAttempt } from '../../../models/quiz-attempt.model';
import { QuizService } from '../../../services/quiz.service';
import { AuthService } from '../../../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';
import { Test } from 'src/app/models/test.model';

@Component({
  selector: 'app-quiz-attempt',
  templateUrl: './quiz-attempt.page.html',
  styleUrls: ['./quiz-attempt.page.scss'],
  standalone: false
})
export class QuizAttemptPage implements OnInit {
  testId: string = '';
  questions: Question[] = [];
  respuestas: { [key: string]: string } = {};
  isSubmitting = false;
  startTime!: number;
  tiempoRestante: number = 0; // En segundos
  timerInterval: any;
  duracionTotalMin: number = 0;
  test: Test;
  existingAttempt: QuizAttempt | null = null;
  answers: { [questionId: string]: string } = {};


  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) { }

  async ngOnInit() {
    this.testId = this.route.snapshot.paramMap.get('quizId') || '';
    this.startTime = Date.now();
    await this.loadQuestions();
    console.log('Preguntas cargadas:', this.questions);

  }

  async loadQuestions() {
    try {
      this.quizService.getQuestionsByTest(this.testId).then(questions => {
        // Solucionar problema de opciones como objetos
        this.questions = questions.map(q => {
          if (q.tipo === 'opcion_multiple' && q.opciones && typeof q.opciones[0] === 'object') {
            q.opciones = q.opciones.map((o: any) => o.texto);
          }
          return q;
        });

        this.startTimer();
      });
    } catch (error) {
      console.error('Error cargando preguntas:', error);
    }
  }

  startTimer() {
    if (!this.test?.duracion) return;

    this.duracionTotalMin = this.test.duracion;
    this.tiempoRestante = this.test.duracion * 60; // minutos a segundos

    this.timerInterval = setInterval(() => {
      this.tiempoRestante--;

      if (this.tiempoRestante <= 0) {
        clearInterval(this.timerInterval);
        this.autoSubmit();
      }
    }, 1000);
  }

  async autoSubmit() {
    const alert = await this.alertCtrl.create({
      header: 'Tiempo agotado',
      message: 'Se ha acabado el tiempo. La evaluación se enviará automáticamente.',
      buttons: ['OK'],
    });
    await alert.present();

    this.submitAttempt();
  }

  onAnswerChange(questionId: string, value: string) {
    this.respuestas[questionId] = value;
  }

  async submitAttempt() {
    const loading = await this.loadingCtrl.create({ message: 'Enviando respuestas...' });
    await loading.present();

    try {
      const user = await this.authService.getCurrentUser();
      const tiempoUsado = Math.ceil((Date.now() - this.startTime) / 60000);

      // Calcular puntaje
      let total = 0;
      for (const q of this.questions) {
        const r = this.respuestas[q.id];
        if (r !== undefined && r.trim().toLowerCase() === q.respuestaCorrecta.toString().toLowerCase()) {
          total += q.puntaje;
        }
      }

      const attempt: QuizAttempt = {
        id: uuidv4(),
        testId: this.testId,
        studentId: user!.id,
        respuestas: this.respuestas,
        score: total,
        fechaEnvio: new Date(),
        duracionUtilizada: tiempoUsado,
        aprobado: total >= (this.getTotalPoints() * 0.6), // 60% mínimo
      };

      await this.quizService.submitQuizAttempt(attempt);

      const alert = await this.alertCtrl.create({
        header: 'Evaluación enviada',
        message: `Obtuviste ${total} puntos.`,
        buttons: ['OK'],
      });
      await alert.present();

      this.router.navigate(['/student/quiz-list']);
    } catch (error) {
      console.error('Error al enviar intento:', error);
    } finally {
      loading.dismiss();
    }
  }

  getTotalPoints(): number {
    return this.questions.reduce((sum, q) => sum + q.puntaje, 0);
  }

  get isReviewMode(): boolean {
    return !!this.existingAttempt;
  }

}
