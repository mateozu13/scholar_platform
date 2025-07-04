import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import { v4 as uuidv4 } from 'uuid';
import { Test } from 'src/app/models/test.model';

@Component({
  selector: 'app-quiz-create',
  templateUrl: './quiz-create.page.html',
  styleUrls: ['./quiz-create.page.scss'],
  standalone: false,
})
export class QuizCreatePage implements OnInit {
  courseId = '';
  titulo = '';
  descripcion = '';
  preguntas: any[] = [];
  quizzes: Test[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    this.agregarPregunta();
    this.cargarQuizzes();
  }

  agregarPregunta() {
    this.preguntas.push({
      texto: '',
      tipo: 'opcion_multiple',
      opciones: [
        { texto: '' },
        { texto: '' },
        { texto: '' },
        { texto: '' }
      ],
      respuestaCorrecta: 0,
      puntaje: 1,
    });
  }

  eliminarPregunta(index: number) {
    this.preguntas.splice(index, 1);
  }

  async guardarQuiz() {
    if (!this.titulo || !this.descripcion || this.preguntas.length === 0) {
      alert('Por favor completa todos los campos del quiz');
      return;
    }

    const quizId = uuidv4();
    const quiz = {
      id: quizId,
      titulo: this.titulo,
      descripcion: this.descripcion,
      courseId: this.courseId,
      fechaCierre: new Date(),
      puntosTotales: this.preguntas.reduce((acc, p) => acc + p.puntaje, 0),
    };

    try {
      await this.quizService.createTest(quiz);
      for (const pregunta of this.preguntas) {
        await this.quizService.addQuestionToTest({
          id: uuidv4(),
          testId: quizId,
          texto: pregunta.texto,
          tipo: pregunta.tipo,
          opciones: pregunta.opciones,
          respuestaCorrecta: pregunta.respuestaCorrecta,
          puntaje: pregunta.puntaje,
        });
      }
      alert('✅ Quiz creado exitosamente');
      this.titulo = '';
      this.descripcion = '';
      this.preguntas = [];
      this.agregarPregunta();
      this.cargarQuizzes();
    } catch (error) {
      console.error('Error al guardar el quiz:', error);
      alert('❌ Error al guardar el quiz');
    }
  }

  async cargarQuizzes() {
    try {
      this.isLoading = true;
      this.quizzes = await this.quizService.getTestsByCourse(this.courseId);
    } catch (error) {
      console.error('Error al cargar quizzes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async eliminarQuiz(quizId: string) {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este quiz?');
    if (!confirmar) return;

    try {
      await this.quizService.deleteTest(quizId);
      this.quizzes = this.quizzes.filter(q => q.id !== quizId);
      alert('✅ Quiz eliminado');
    } catch (error) {
      console.error('Error al eliminar quiz:', error);
      alert('❌ Error al eliminar el quiz');
    }
  }
}
