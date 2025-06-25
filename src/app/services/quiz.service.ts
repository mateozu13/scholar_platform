import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Test } from '../models/test.model';
import { Question } from '../models/question.model';
import { QuizAttempt } from '../models/quiz-attempt.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly testsCollection = 'Tests';
  private readonly questionsCollection = 'Questions';
  private readonly attemptsCollection = 'QuizAttempts';

  constructor(private firestore: AngularFirestore) {}

  // Crear prueba (profesor)
  createTest(test: Test): Promise<void> {
    return this.firestore
      .collection(this.testsCollection)
      .doc(test.id)
      .set(test);
  }

  // Obtener pruebas por curso
  getTestsByCourse(courseId: string) {
    return this.firestore
      .collection<Test>(this.testsCollection, (ref) =>
        ref.where('courseId', '==', courseId).orderBy('fechaCierre')
      )
      .valueChanges({ idField: 'id' });
  }

  // Obtener prueba por ID
  getTestById(testId: string) {
    return this.firestore
      .collection<Test>(this.testsCollection)
      .doc(testId)
      .valueChanges();
  }

  // Agregar pregunta a prueba
  addQuestionToTest(question: Question): Promise<void> {
    return this.firestore
      .collection(this.questionsCollection)
      .doc(question.id)
      .set(question);
  }

  // Obtener preguntas de prueba
  getQuestionsByTest(testId: string) {
    return this.firestore
      .collection<Question>(this.questionsCollection, (ref) =>
        ref.where('testId', '==', testId)
      )
      .valueChanges({ idField: 'id' });
  }

  // Enviar intento de prueba
  submitQuizAttempt(attempt: QuizAttempt): Promise<void> {
    return this.firestore
      .collection(this.attemptsCollection)
      .doc(attempt.id)
      .set(attempt);
  }

  // Obtener intentos por prueba
  getAttemptsByTest(testId: string) {
    return this.firestore
      .collection<QuizAttempt>(this.attemptsCollection, (ref) =>
        ref.where('testId', '==', testId)
      )
      .valueChanges({ idField: 'id' });
  }

  // Obtener intentos por estudiante
  getAttemptsByStudent(studentId: string) {
    return this.firestore
      .collection<QuizAttempt>(this.attemptsCollection, (ref) =>
        ref.where('studentId', '==', studentId)
      )
      .valueChanges({ idField: 'id' });
  }
}
