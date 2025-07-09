import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course.model';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { CourseMaterial } from 'src/app/models/course-material.model';
import { TaskService } from 'src/app/services/task.service';
import { QuizService } from 'src/app/services/quiz.service';
import firebase from 'firebase/compat/app';
import { Assignment } from 'src/app/models/assignment.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
  standalone: false,
})
export class CourseDetailPage implements OnInit {
  courseId = '';
  course: Course | null = null;
  profesor: User | null = null;
  isLoading = false;
  showVideos = false;
  showForums = false;


  showMaterials = false;
  showTasks = false;
  materiales: CourseMaterial[] = [];
  tareas: Assignment[] = [];
  isPreviewOpen = false;
  sanitizedPreviewUrl: SafeResourceUrl | null = null;


  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router,
    private authService: AuthService,
    private taskService: TaskService,
    private quizService: QuizService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
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

  async loadMaterials() {
    const snapshot = await firebase
      .firestore()
      .collection('courses')
      .doc(this.courseId)
      .collection('materiales')
      .orderBy('fechaSubida', 'desc')
      .get();

    this.materiales = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        courseId: this.courseId,
        titulo: data.titulo,
        urlArchivo: data.url || 'Archivo Dañado',
        tipo: data.tipo,
        fechaPublicacion: data.fechaSubida?.toDate?.() || new Date(),
        publicadoPor: data.publicadoPor || '',
      } as CourseMaterial;
    });
  }

  async loadTasks() {
    this.tareas = await this.taskService.getAssignmentsByCourse(this.courseId);
  }

  async toggleMaterials() {
    this.showMaterials = !this.showMaterials;
    if (this.showMaterials && this.materiales.length === 0) {
      await this.loadMaterials();
    }
  }

  toggleVideos() {
    this.showVideos = !this.showVideos;
  }

  toggleForums() {
    this.showForums = !this.showForums;
  }

  async toggleTasks() {
    this.showTasks = !this.showTasks;
    if (this.showTasks && this.tareas.length === 0) {
      await this.loadTasks();
    }
  }


  viewTask(taskId: string) {
    this.router.navigate(['/student/task-detail', taskId]);
  }

  viewQuiz(quizId: string) {
    this.router.navigate(['/student/quiz-detail', quizId]);
  }

  openChatList() {
    this.router.navigate(['/student/course', this.courseId, 'chats']);
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesión',
          handler: async () => {
            await this.authService.logout();
          },
        },
      ],
    });
    await alert.present();
  }

  navigateToProfile() {
    this.router.navigate(['/student/profile']);
  }
}
