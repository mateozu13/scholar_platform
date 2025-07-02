import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface Course {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  estudiantes?: number;
}

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.page.html',
  styleUrls: ['./courses-list.page.scss'],
  standalone: false,
})
export class CoursesListPage implements OnInit {
  courses$: Observable<Course[]>;
  isLoading = true;

  constructor(private router: Router) {
    const db = firebase.firestore();
    const coursesRef = db.collection('courses');

    // Convertimos manualmente a observable (legacy way)
    this.courses$ = new Observable((observer) => {
      coursesRef.onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Course),
        }));
        observer.next(data);
      });
    });
  }

  ngOnInit() {
    this.courses$.subscribe(() => {
      this.isLoading = false;
    });
  }

  openCourseDetail(courseId: string) {
    this.router.navigate(['/teacher/course-detail', courseId]);
  }
}
