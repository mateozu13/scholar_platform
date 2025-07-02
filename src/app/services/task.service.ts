// src/app/services/task.service.ts

import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Assignment } from '../models/assignment.model';
import { Submission } from '../models/submission.model';
import { CourseService } from './course.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly assignmentsCollection = 'assignments';
  private readonly submissionsCollection = 'submissions';
  private assignmentsRef = firebase
    .firestore()
    .collection(this.assignmentsCollection);
  private submissionsRef = firebase
    .firestore()
    .collection(this.submissionsCollection);

  constructor(private courseService: CourseService) {}

  // -----------------------
  // Operaciones generales
  // -----------------------

  /** Crear tarea (profesor) */
  createAssignment(assignment: Assignment): Promise<void> {
    return this.assignmentsRef.doc(assignment.id).set(assignment);
  }

  /** Obtener todas las tareas de un curso */
  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    const snap = await this.assignmentsRef
      .where('courseId', '==', courseId)
      .orderBy('fechaEntrega')
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Assignment),
    }));
  }

  /** Obtener una tarea por su ID */
  async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    const doc = await this.assignmentsRef.doc(assignmentId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Assignment) };
  }

  /** Enviar tarea (estudiante) */
  submitAssignment(submission: Submission): Promise<void> {
    return this.submissionsRef.doc(submission.id).set(submission);
  }

  /** Obtener todas las entregas de una tarea */
  async getSubmissionsByAssignment(
    assignmentId: string
  ): Promise<Submission[]> {
    const snap = await this.submissionsRef
      .where('assignmentId', '==', assignmentId)
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Submission),
    }));
  }

  /** Obtener todas las entregas de un estudiante */
  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    const snap = await this.submissionsRef
      .where('studentId', '==', studentId)
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Submission),
    }));
  }

  
async deleteAssignment(assignmentId: string): Promise<void> {
  try {
    await this.assignmentsRef.doc(assignmentId).delete();
  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    throw error;
  }
}


  /** Calificar una entrega (profesor) */
  gradeSubmission(
    submissionId: string,
    grade: number,
    feedback: string
  ): Promise<void> {
    return this.submissionsRef.doc(submissionId).update({
      calificacion: grade,
      retroalimentacion: feedback,
    });
  }

  // -----------------------
  // Métodos para estudiantes
  // -----------------------

  /** Tareas que aún no ha entregado el estudiante */
  async getPendingAssignments(studentId: string): Promise<Assignment[]> {
    const courses = await this.courseService.getCoursesByStudent(studentId);
    const pending: Assignment[] = [];

    for (const course of courses) {
      const snap = await this.assignmentsRef
        .where('courseId', '==', course.id)
        .get();

      snap.docs.forEach((doc) => {
        const a = { id: doc.id, ...(doc.data() as Assignment) };
        if (!a.submissions?.includes(studentId)) {
          pending.push(a);
        }
      });
    }

    return pending;
  }

  /** Tareas creadas en la última semana */
  async getRecentAssignments(studentId: string): Promise<Assignment[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const courses = await this.courseService.getCoursesByStudent(studentId);
    const recent: Assignment[] = [];

    for (const course of courses) {
      const snap = await this.assignmentsRef
        .where('courseId', '==', course.id)
        .where('createdAt', '>=', oneWeekAgo)
        .get();

      snap.docs.forEach((doc) => {
        recent.push({ id: doc.id, ...(doc.data() as Assignment) });
      });
    }

    return recent;
  }

  /** Tareas cuya fecha de entrega cae en la próxima semana y no han sido entregadas */
  async getUpcomingAssignments(studentId: string): Promise<Assignment[]> {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const courses = await this.courseService.getCoursesByStudent(studentId);
    const upcoming: Assignment[] = [];

    for (const course of courses) {
      const snap = await this.assignmentsRef
        .where('courseId', '==', course.id)
        .where('dueDate', '>', now)
        .where('dueDate', '<=', nextWeek)
        .get();

      snap.docs.forEach((doc) => {
        const a = { id: doc.id, ...(doc.data() as Assignment) };
        if (!a.submissions?.includes(studentId)) {
          upcoming.push(a);
        }
      });
    }

    return upcoming;
  }

  // -----------------------
  // Métodos para profesores
  // -----------------------

  /** Asignaciones entregadas que aún no han sido revisadas */
  async getPendingReviews(teacherId: string): Promise<Assignment[]> {
    const courses = await this.courseService.getCoursesByTeacher(teacherId);
    const reviews: Assignment[] = [];

    for (const course of courses) {
      const snap = await this.assignmentsRef
        .where('courseId', '==', course.id)
        .where('status', '==', 'submitted')
        .get();

      snap.docs.forEach((doc) => {
        reviews.push({ id: doc.id, ...(doc.data() as Assignment) });
      });
    }

    return reviews;
  }

  /** Próximas tareas de los cursos que dicta el profesor */
  async getTeacherUpcomingAssignments(
    teacherId: string
  ): Promise<Assignment[]> {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const courses = await this.courseService.getCoursesByTeacher(teacherId);
    const upcoming: Assignment[] = [];

    for (const course of courses) {
      const snap = await this.assignmentsRef
        .where('courseId', '==', course.id)
        .where('dueDate', '>', now)
        .where('dueDate', '<=', nextWeek)
        .get();

      snap.docs.forEach((doc) => {
        upcoming.push({ id: doc.id, ...(doc.data() as Assignment) });
      });
    }

    return upcoming;
  }
}
