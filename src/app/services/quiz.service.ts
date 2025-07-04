import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Test } from '../models/test.model';
import { Question } from '../models/question.model';
import { QuizAttempt } from '../models/quiz-attempt.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private firestore = firebase.firestore();
  private readonly testsCollection = 'tests';
  private readonly questionsCollection = 'questions';
  private readonly attemptsCollection = 'quizAttempts';

  constructor() {}

  // Crear prueba (profesor)
  createTest(test: Test): Promise<void> {
    return this.firestore
      .collection(this.testsCollection)
      .doc(test.id)
      .set(test);
  }

  // Obtener pruebas por curso
getTestsByCourse(courseId: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    this.firestore
      .collection(this.testsCollection)
      .where('courseId', '==', courseId)
      .orderBy('fechaCierre')
      .get()
      .then((snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const quiz = doc.data();
          return {
            id: doc.id,
            ...quiz,
            fechaCierre: quiz.fechaCierre?.toDate ? quiz.fechaCierre.toDate() : quiz.fechaCierre
          };
        });
        resolve(data);
      })
      .catch(reject);
  });
}



  // Obtener prueba por ID
  async getTestById(testId: string): Promise<Test | null> {
    const doc = await this.firestore
      .collection(this.testsCollection)
      .doc(testId)
      .get();
    return doc.exists ? (doc.data() as Test) : null;
  }

  // Agregar pregunta a prueba
  addQuestionToTest(question: Question): Promise<void> {
    return this.firestore
      .collection(this.questionsCollection)
      .doc(question.id)
      .set(question);
  }

  // Obtener preguntas de prueba
  async getQuestionsByTest(testId: string): Promise<Question[]> {
    const snapshot = await this.firestore
      .collection(this.questionsCollection)
      .where('testId', '==', testId)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Question),
    }));
  }

  // Enviar intento de prueba
  submitQuizAttempt(attempt: QuizAttempt): Promise<void> {
    return this.firestore
      .collection(this.attemptsCollection)
      .doc(attempt.id)
      .set(attempt);
  }

  // Obtener intentos por prueba
  async getAttemptsByTest(testId: string): Promise<QuizAttempt[]> {
    const snapshot = await this.firestore
      .collection(this.attemptsCollection)
      .where('testId', '==', testId)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as QuizAttempt),
    }));
  }

  // Eliminar prueba
deleteTest(testId: string): Promise<void> {
  return this.firestore.collection('tests').doc(testId).delete();
}

  // Obtener intentos por estudiante
  async getAttemptsByStudent(studentId: string): Promise<QuizAttempt[]> {
    const snapshot = await this.firestore
      .collection(this.attemptsCollection)
      .where('studentId', '==', studentId)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as QuizAttempt),
    }));
  }

async getQuizResultsByTest(testId: string): Promise<(QuizAttempt & { studentName?: string })[]> {
  const snapshot = await this.firestore
    .collection(this.attemptsCollection)
    .where('testId', '==', testId)
    .get();

  const results: (QuizAttempt & { studentName?: string })[] = [];

  for (const doc of snapshot.docs) {
    const attempt = doc.data() as QuizAttempt;
    attempt.id = doc.id;

    
    const studentDoc = await this.firestore.collection('users').doc(attempt.studentId).get();
    const studentData = studentDoc.data();

    results.push({
      ...attempt,
      studentName: studentData?.nombre || 'Desconocido',
    });
  }

  return results;
}


  // Guardar comentario del docente
  async updateTeacherComment(submissionId: string, comentario: string): Promise<void> {
    await this.firestore
      .collection('quiz_submissions')
      .doc(submissionId)
      .update({ comentarioDocente: comentario });
  }

  async getAttemptById(submissionId: string): Promise<QuizAttempt | null> {
    const doc = await this.firestore
      .collection('quiz_submissions')
      .doc(submissionId)
      .get();
    return doc.exists ? (doc.data() as QuizAttempt) : null;
  }
}
