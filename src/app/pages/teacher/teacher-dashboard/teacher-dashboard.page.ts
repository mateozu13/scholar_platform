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
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.page.html',
  styleUrls: ['./teacher-dashboard.page.scss'],
  standalone: false,
})
export class TeacherDashboardPage implements OnInit {
  currentUser: User | null = null;
  taughtCourses: Course[] = [];
  pendingReviews: Assignment[] = [];
  recentActivity: any[] = [];
  statsChart: any;
  isLoading = false;
  upcomingDeadlines: Assignment[] = [];
  studentStats: any = {};

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
    this.currentUser = await this.authService.getCurrentUser();

    if (this.currentUser) {
      this.taughtCourses = await this.courseService.getCoursesByTeacher(this.currentUser.id);
await this.calcularEstadisticas();
      let totalCompletadas = 0;
      let totalPendientes = 0;
      let totalSinEntregar = 0;

      for (const course of this.taughtCourses) {
        const assignments = await this.taskService.getAssignmentsByCourse(course.id);
        let completadas = 0;
        let sinEntregar = 0;

        for (const task of assignments) {
          const submissions = await this.taskService.getSubmissionsByAssignment(task.id);
          if (submissions.length > 0) {
            completadas++;
          } else {
            sinEntregar++;
          }
        }

        const total = assignments.length;
        //const pendientes = total - completadas - sinEntregar;

        course.completedAssignments = completadas;
        course.assignmentsCount = total;

        totalCompletadas += completadas;
        //totalPendientes += pendientes;
        totalSinEntregar += sinEntregar;
      }

      this.createStatsChart(totalCompletadas, totalSinEntregar);
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

async calcularEstadisticas() {
  let totalStudents = 0;
  let sumaNotas = 0;
  let cantidadNotas = 0;
  let revisionesPendientes = 0;

  this.taughtCourses = await this.courseService.getCoursesByTeacher(this.currentUser.id);

  for (const course of this.taughtCourses) {
    // Total de estudiantes
    totalStudents += course.estudiantes?.length || 0;

    // Obtener tareas del curso
    const assignments = await this.taskService.getAssignmentsByCourse(course.id);
    course.assignmentsCount = assignments.length;

    let tareasCompletadas = 0;

    for (const task of assignments) {
      const submissions = await this.taskService.getSubmissionsByAssignment(task.id);

      if (submissions.length > 0) {
        tareasCompletadas++;
      }

     for (const sub of submissions) {
  const tieneNota = sub.hasOwnProperty('calificacion') && sub.calificacion !== null && sub.calificacion !== undefined;
  
  if (!tieneNota) {
    revisionesPendientes++;
  } else {
    sumaNotas += sub.calificacion;
    cantidadNotas++;
  }
}

    }

    course.completedAssignments = tareasCompletadas;
  }

  this.studentStats = {
    totalStudents,
    averageGrade: cantidadNotas > 0 ? Math.round((sumaNotas / cantidadNotas) * 100) / 100 : 0,
    //pendingReviewsCount: revisionesPendientes,
  };
}

  createStatsChart(completadas: number,  sinEntregar: number) {
  if (this.statsChart) {
    this.statsChart.destroy();
  }

  const ctx = document.getElementById('statsChart') as HTMLCanvasElement;
  this.statsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Entregadas', 'Sin entregar'],
      datasets: [
        {
          data: [completadas, sinEntregar],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Estado de Tareas',
          font: {
            size: 16,
          },
        },
      },
    },
  });
}


  navigateToCourse(courseId: string) {
    this.router.navigate(['/teacher/course-detail', courseId]);
  }

  navigateToAssignment(assignmentId: string) {
    this.router.navigate(['/teacher/task-detail', assignmentId]);
  }

  navigateToProfile() {
    this.router.navigate(['/teacher/profile']);
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
