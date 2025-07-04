import { Component, OnInit } from '@angular/core';
import { Course } from '../../../models/course.model';
import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.page.html',
  styleUrls: ['./courses-list.page.scss'],
  standalone: false,
})
export class CoursesListPage implements OnInit {
  currentUser: User | null = null;
  enrolledCourses: Course[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.loadCourses();
  }

  async ionViewWillEnter() {
    await this.loadCourses();
  }

  async loadCourses(event?: any) {
  this.isLoading = true;

  let loading: HTMLIonLoadingElement | null = null;

  if (!event) {
    loading = await this.loadingCtrl.create({
      message: 'Cargando cursos...',
    });
    await loading.present();
  }

  try {
    this.currentUser = await this.authService.getCurrentUser();

    if (this.currentUser) {
      this.enrolledCourses = await this.courseService.getCoursesByStudent(
        this.currentUser.id
      );
    }
  } catch (error) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudieron cargar los cursos inscritos.',
      buttons: ['OK'],
    });
    await alert.present();
  } finally {
    this.isLoading = false;

    // ✅ Asegúrate de cerrar el loading si fue creado
    if (event) {
      event.target.complete();
    }

    if (loading) {
      loading.dismiss();
    }
  }
}

  navigateToCourse(courseId: string) {
    this.router.navigate(['/student/course-detail', courseId]);
  }
}
