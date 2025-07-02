import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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

  constructor(private router: Router, private firestore: Firestore) {
    const coursesCollection = collection(this.firestore, 'courses');
    this.courses$ = collectionData(coursesCollection, {
      idField: 'id',
    }) as Observable<Course[]>;
  }

  ngOnInit() {
    // Marca como cargando solo hasta que obtenga el primer valor
    this.courses$.subscribe(() => {
      this.isLoading = false;
    });
  }

  openCourseDetail(courseId: string) {
    this.router.navigate(['/teacher/course-detail', courseId]);
  }
}
