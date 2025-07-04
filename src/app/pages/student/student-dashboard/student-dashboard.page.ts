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
  upcomingDeadlines: Assignment[] = [];
  progressChart: any;
  statusChart: any;
  isLoading = false;

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
        this.enrolledCourses = await this.courseService.getCoursesByStudent(this.currentUser.id);
        this.pendingAssignments = await this.taskService.getPendingAssignments(this.currentUser.id);
        this.upcomingDeadlines = await this.taskService.getUpcomingAssignments(this.currentUser.id);
        this.createProgressChart();
        this.createStatusChart();
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
    if (this.progressChart) this.progressChart.destroy();

    const ctx = document.getElementById('progressChart') as HTMLCanvasElement;
    this.progressChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.enrolledCourses.map((c) => c.titulo),
        datasets: [
          {
            label: 'Progreso (%)',
            data: this.enrolledCourses.map(() => Math.floor(Math.random() * 50 + 50)), // Simulación
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
              callback: (value) => value + '%',
            },
          },
        },
      },
    });
  }

  createStatusChart() {
    if (this.statusChart) this.statusChart.destroy();

    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pendientes', 'Completadas', 'Vencidas'],
        datasets: [
          {
            data: [this.pendingAssignments.length, 3, 2], // Simulación
            backgroundColor: ['#FFA500', '#28a745', '#dc3545'],
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
        },
      },
    });
  }

  navigateToProfile() {
    this.router.navigate(['/student/profile']);
  }
  
  navigateToCourse() {
    this.router.navigate(['/student/courses-list']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
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
}
