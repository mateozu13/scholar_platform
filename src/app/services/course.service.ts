import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Course } from '../models/course.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private db = firebase.firestore();
  private coursesCollection = 'Courses';
  private enrollmentsCollection = 'Enrollments';

  constructor(private userService: UserService) {}

  // Obtener cursos por estudiante
  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    try {
      // 1. Obtener todas las inscripciones del estudiante
      const enrollmentsSnapshot = await this.db
        .collection(this.enrollmentsCollection)
        .where('userId', '==', studentId)
        .get();

      if (enrollmentsSnapshot.empty) {
        return [];
      }

      // 2. Extraer los IDs de los cursos
      const courseIds = enrollmentsSnapshot.docs.map(
        (doc) => doc.data().courseId
      );

      // 3. Obtener los detalles de los cursos
      const coursesPromises = courseIds.map(async (courseId) => {
        const courseDoc = await this.db
          .collection(this.coursesCollection)
          .doc(courseId)
          .get();
        if (courseDoc.exists) {
          const courseData = courseDoc.data() as Course;

          // 4. Obtener información del profesor
          const teacher = await this.userService.getUserById(
            courseData.profesorId
          );
          return {
            id: courseDoc.id,
            ...courseData,
            profesorNombre: teacher?.nombre || 'Profesor desconocido',
          } as Course;
        }
        return null;
      });

      // 5. Esperar a que todas las promesas se resuelvan y filtrar nulos
      const courses = await Promise.all(coursesPromises);
      return courses.filter((course) => course !== null) as Course[];
    } catch (error) {
      console.error('Error al obtener cursos del estudiante:', error);
      throw error;
    }
  }

  // Obtener cursos por profesor
  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    try {
      // 1. Obtener todos los cursos donde el profesor es el instructor
      const coursesSnapshot = await this.db
        .collection(this.coursesCollection)
        .where('profesorId', '==', teacherId)
        .get();

      if (coursesSnapshot.empty) {
        return [];
      }

      // 2. Obtener información del profesor
      const teacher = await this.userService.getUserById(teacherId);
      const teacherName = teacher?.nombre || 'Profesor desconocido';

      // 3. Obtener estadísticas adicionales para cada curso
      const coursesWithStats = await Promise.all(
        coursesSnapshot.docs.map(async (doc) => {
          const courseData = doc.data() as Course;

          // 4. Contar estudiantes inscritos
          const enrollmentsSnapshot = await this.db
            .collection(this.enrollmentsCollection)
            .where('courseId', '==', doc.id)
            .get();

          // 5. Obtener tareas del curso
          const assignmentsSnapshot = await this.db
            .collection('Assignments')
            .where('courseId', '==', doc.id)
            .get();

          return {
            id: doc.id,
            ...courseData,
            profesorNombre: teacherName,
            estudiantesCount: enrollmentsSnapshot.size,
            assignmentsCount: assignmentsSnapshot.size,
          } as Course;
        })
      );

      return coursesWithStats;
    } catch (error) {
      console.error('Error al obtener cursos del profesor:', error);
      throw error;
    }
  }

  // Obtener todos los cursos (para admin)
  async getAllCourses(): Promise<Course[]> {
    try {
      const snapshot = await this.db.collection(this.coursesCollection).get();
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Course)
      );
    } catch (error) {
      console.error('Error al obtener todos los cursos:', error);
      throw error;
    }
  }

  // Obtener curso por ID
  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const doc = await this.db
        .collection(this.coursesCollection)
        .doc(courseId)
        .get();
      if (!doc.exists) return null;

      const courseData = doc.data() as Course;

      // Obtener información del profesor
      const teacher = await this.userService.getUserById(courseData.profesorId);

      return {
        id: doc.id,
        ...courseData,
        profesorNombre: teacher?.nombre || 'Profesor desconocido',
      };
    } catch (error) {
      console.error('Error al obtener curso por ID:', error);
      throw error;
    }
  }

  // Crear curso
  async createCourse(course: Course): Promise<void> {
    try {
      await this.db
        .collection(this.coursesCollection)
        .doc(course.id)
        .set(course);
    } catch (error) {
      console.error('Error al crear curso:', error);
      throw error;
    }
  }

  // Actualizar curso
  async updateCourse(courseId: string, data: Partial<Course>): Promise<void> {
    try {
      await this.db
        .collection(this.coursesCollection)
        .doc(courseId)
        .update(data);
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      throw error;
    }
  }

  // Inscribir estudiante en curso
  async enrollStudentInCourse(userId: string, courseId: string): Promise<void> {
    try {
      const enrollmentId = this.db
        .collection(this.enrollmentsCollection)
        .doc().id;

      await this.db
        .collection(this.enrollmentsCollection)
        .doc(enrollmentId)
        .set({
          id: enrollmentId,
          userId,
          courseId,
          fechaInscripcion: new Date(),
          progreso: 0,
        });

      // Actualizar la lista de estudiantes en el curso
      const courseRef = this.db
        .collection(this.coursesCollection)
        .doc(courseId);
      await this.db.runTransaction(async (transaction) => {
        const courseDoc = await transaction.get(courseRef);
        if (!courseDoc.exists) return;

        const courseData = courseDoc.data() as Course;
        const estudiantes = courseData.estudiantes || [];

        if (!estudiantes.includes(userId)) {
          transaction.update(courseRef, {
            estudiantes: [...estudiantes, userId],
          });
        }
      });
    } catch (error) {
      console.error('Error al inscribir estudiante en curso:', error);
      throw error;
    }
  }
}
