import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
  standalone: false,
})
export class CourseDetailPage implements OnInit {
  courseId = '';
  course: Course | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {}

  async ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    if (!this.courseId) {
      this.router.navigate(['/teacher/courses-list']);
      return;
    }

    try {
      this.course = await this.courseService.getCourseById(this.courseId);
      if (!this.course) {
        console.warn('Curso no encontrado');
        this.router.navigate(['/teacher/courses-list']);
      }
    } catch (error) {
      console.error('Error al cargar curso:', error);
      this.router.navigate(['/teacher/courses-list']);
    } finally {
      this.loading = false;
    }
  }

  goTo(section: string) {
    this.router.navigate([`/teacher/${section}/${this.courseId}`]);
  }
}
