import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course.model';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
  standalone: false,
})
export class CourseDetailPage implements OnInit {
  course: Course | null = null;
  profesor: User | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadCourse();
  }

  async loadCourse() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando curso...',
    });
    await loading.present();

    try {
      const courseId = this.route.snapshot.paramMap.get('courseId');
      if (courseId) {
        this.course = await this.courseService.getCourseById(courseId);
        if (this.course && this.course.profesorId) {
          this.profesor = await this.userService.getUserById(
            this.course.profesorId
          );
        }
      }
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo cargar el curso.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }
  navigateTo(section: string) {
    const courseId = this.course?.id;
    if (!courseId) return;

    switch (section) {
      case 'materials':
        this.router.navigate(['/student/materials', courseId]);
        break;
      case 'tareas':
        this.router.navigate(['/student/task-list']);
        break;
      case 'quizzes':
        this.router.navigate(['/student/course-quizzes', courseId]);
        break;
      case 'forums':
        this.router.navigate(['/student/forums', courseId]);
        break;
      case 'grades':
        this.router.navigate(['/student/grades', courseId]);
        break;
      case 'calendar':
        this.router.navigate(['/student/calendar', courseId]);
        break;
    }
  }
}
