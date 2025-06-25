import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Assignment } from '../models/assignment.model';
import { Submission } from '../models/submission.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly assignmentsCollection = 'Assignments';
  private readonly submissionsCollection = 'Submissions';

  constructor(private firestore: AngularFirestore) {}

  // Crear tarea (profesor)
  createAssignment(assignment: Assignment): Promise<void> {
    return this.firestore
      .collection(this.assignmentsCollection)
      .doc(assignment.id)
      .set(assignment);
  }

  // Obtener tareas por curso
  getAssignmentsByCourse(courseId: string) {
    return this.firestore
      .collection<Assignment>(this.assignmentsCollection, (ref) =>
        ref.where('courseId', '==', courseId).orderBy('fechaEntrega')
      )
      .valueChanges({ idField: 'id' });
  }

  // Obtener tarea por ID
  getAssignmentById(assignmentId: string) {
    return this.firestore
      .collection<Assignment>(this.assignmentsCollection)
      .doc(assignmentId)
      .valueChanges();
  }

  // Enviar tarea (estudiante)
  submitAssignment(submission: Submission): Promise<void> {
    return this.firestore
      .collection(this.submissionsCollection)
      .doc(submission.id)
      .set(submission);
  }

  // Obtener entregas por tarea
  getSubmissionsByAssignment(assignmentId: string) {
    return this.firestore
      .collection<Submission>(this.submissionsCollection, (ref) =>
        ref.where('assignmentId', '==', assignmentId)
      )
      .valueChanges({ idField: 'id' });
  }

  // Obtener entregas por estudiante
  getSubmissionsByStudent(studentId: string) {
    return this.firestore
      .collection<Submission>(this.submissionsCollection, (ref) =>
        ref.where('studentId', '==', studentId)
      )
      .valueChanges({ idField: 'id' });
  }

  // Calificar entrega (profesor)
  gradeSubmission(
    submissionId: string,
    grade: number,
    feedback: string
  ): Promise<void> {
    return this.firestore
      .collection(this.submissionsCollection)
      .doc(submissionId)
      .update({
        calificacion: grade,
        retroalimentacion: feedback,
      });
  }
}
