import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Course } from 'src/app/models/course.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.page.html',
  styleUrls: ['./courses-list.page.scss'],
  standalone: false,
})
export class CoursesListPage implements OnInit {
  courses: Course[] = [];
  isLoading = true;
  userId: string = '';

  constructor(private router: Router, private afAuth: AngularFireAuth) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        this.userId = user.uid;
        await this.cargarCursos();
        this.isLoading = false;
      }
    });
  }

  async cargarCursos() {
    try {
      const db = firebase.firestore();
      const snapshot = await db
        .collection('courses')
        .where('profesorId', '==', this.userId)
        .get();

      this.courses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Course),
      }));
    } catch (error) {
      console.error('❌ Error al cargar cursos:', error);
      alert('Error al obtener los cursos');
    }
  }

  openCourseDetail(courseId: string) {
    this.router.navigate(['/teacher/course-detail', courseId]);
  }
}
