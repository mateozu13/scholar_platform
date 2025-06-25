import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Course } from '../models/course.model';
import { Enrollment } from '../models/enrollment.model';
import { CourseMaterial } from '../models/course-material.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private db = firebase.firestore();

  // Crear curso
  async createCourse(course: Course): Promise<void> {
    await this.db.collection('Courses').doc(course.id).set(course);
  }

  // Obtener curso por ID
  async getCourseById(courseId: string): Promise<Course | null> {
    const doc = await this.db.collection('Courses').doc(courseId).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Course) : null;
  }

  // Obtener cursos por profesor
  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    const snapshot = await this.db
      .collection('Courses')
      .where('profesorId', '==', teacherId)
      .get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Course)
    );
  }

  // Inscribir estudiante en curso
  async enrollStudent(enrollment: Enrollment): Promise<void> {
    await this.db.collection('Enrollments').doc(enrollment.id).set(enrollment);
  }

  // Subir material del curso
  async uploadCourseMaterial(material: CourseMaterial): Promise<void> {
    await this.db.collection('CourseMaterials').doc(material.id).set(material);
  }

  // Obtener materiales de un curso
  async getMaterialsByCourse(courseId: string): Promise<CourseMaterial[]> {
    const snapshot = await this.db
      .collection('CourseMaterials')
      .where('courseId', '==', courseId)
      .orderBy('fechaPublicacion', 'desc')
      .get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as CourseMaterial)
    );
  }

  async getAllCourses(): Promise<Course[]> {
    const snapshot = await firebase.firestore().collection('Courses').get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Course)
    );
  }
}
