import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { Course } from '../../../models/course.model';
import { Assignment } from '../../../models/assignment.model';
import { AlertController, LoadingController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

type FirestoreTimestampLike = {
  seconds: number;
  nanoseconds: number;
};

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.page.html',
  styleUrls: ['./student-dashboard.page.scss'],
  standalone: false,
})
export class StudentDashboardPage implements OnInit {
  currentUser: User | null = null;
  enrolledCourses: Course[] = [];
  pendingAssignments: Assignment[] = [];
  recentAssignments: Assignment[] = [];
  progressChart: any;
  isLoading = false;
  upcomingDeadlines: Assignment[] = [];

  constructor(
    private router: Router,
    private courseService: CourseService,
    private taskService: TaskService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    Chart.register(...registerables);
  }

  async ngOnInit() {
    await this.loadData();
  }

  async ionViewWillEnter() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...',
    });
    await loading.present();

    try {
      // Obtener usuario actual
      this.currentUser = await this.authService.getCurrentUser();

      if (this.currentUser) {
        // Obtener cursos inscritos
        this.enrolledCourses = await this.courseService.getCoursesByStudent(
          this.currentUser.id
        );

        // Obtener tareas pendientes
        this.pendingAssignments = await this.taskService.getPendingAssignments(
          this.currentUser.id
        );

        // Obtener tareas recientes (últimas 5)
        this.recentAssignments = await this.taskService.getRecentAssignments(
          this.currentUser.id
        );

        // Obtener próximas fechas límite
        this.upcomingDeadlines = await this.taskService.getUpcomingAssignments(
          this.currentUser.id
        );

        // Crear gráficos
        this.createProgressChart();
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudieron cargar los datos del dashboard',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  createProgressChart() {
    if (this.progressChart) {
      this.progressChart.destroy();
    }

    const ctx = document.getElementById('progressChart') as HTMLCanvasElement;
    this.progressChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.enrolledCourses.map((course) => course.titulo),
        datasets: [
          {
            label: 'Progreso del curso (%)',
            data: [75, 60, 90, 45, 80], // Datos simulados
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + '%';
              },
            },
          },
        },
      },
    });
  }

  navigateToCourse(courseId: string) {
    this.router.navigate(['/student/course-detail', courseId]);
  }

  navigateToAssignment(assignmentId: string) {
    this.router.navigate(['/student/task-detail', assignmentId]);
  }

  navigateToProfile() {
    this.router.navigate(['/student/profile']);
  }

  formatDate(
    date?: Date | string | firebase.firestore.Timestamp | FirestoreTimestampLike
  ): string {
    if (!date) {
      return 'No definida';
    }

    let jsDate: Date;

    // 1) Si es Timestamp de compat
    if (date instanceof firebase.firestore.Timestamp) {
      jsDate = date.toDate();

      // 2) Si es el objeto literal { seconds, nanoseconds }
    } else if (
      typeof date === 'object' &&
      'seconds' in date &&
      'nanoseconds' in date
    ) {
      const millis = date.seconds * 1000 + Math.floor(date.nanoseconds / 1e6);
      jsDate = new Date(millis);

      // 3) Si es Date o string ISO
    } else {
      jsDate = new Date(date as string | Date);
    }

    // 4) Comprobar validez
    if (isNaN(jsDate.getTime())) {
      return 'No definida';
    }

    // 5) Formatear
    return jsDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getDaysLeft(date: Date | string | undefined): string {
    if (!date) return '?';

    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencida';
    if (diffDays === 0) return 'Hoy';
    return `${diffDays} días`;
  }

  getUrgencyClass(days: string): string {
    if (days === 'Vencida') return 'danger';
    if (days === 'Hoy') return 'warning';
    return 'success';
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
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
}
