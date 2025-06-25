import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { Course } from '../../../models/course.model';
import { AlertController, LoadingController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false,
})
export class AdminDashboardPage implements OnInit {
  currentUser: User | null = null;
  totalUsers: number = 0;
  totalCourses: number = 0;
  recentUsers: User[] = [];
  recentCourses: Course[] = [];
  userStats: any = {};
  courseStats: any = {};
  statsChart: any;

  constructor(
    private router: Router,
    private userService: UserService,
    private courseService: CourseService,
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
    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...',
    });
    await loading.present();

    try {
      // Obtener usuario actual
      this.currentUser = await this.authService.getCurrentUser();

      // Obtener estadísticas de usuarios
      const allUsers = await this.userService.getAllUsers();
      this.totalUsers = allUsers.length;
      this.recentUsers = allUsers.slice(0, 5);
      this.userStats = {
        students: allUsers.filter((u) => u.rol === 'estudiante').length,
        teachers: allUsers.filter((u) => u.rol === 'profesor').length,
        admins: allUsers.filter((u) => u.rol === 'admin').length,
      };

      // Obtener estadísticas de cursos
      const allCourses = await this.courseService.getAllCourses();
      this.totalCourses = allCourses.length;
      this.recentCourses = allCourses.slice(0, 5);
      this.courseStats = {
        active: allCourses.filter((c) => new Date(c.fechaFin || 0) > new Date())
          .length,
        completed: allCourses.filter(
          (c) => new Date(c.fechaFin || 0) <= new Date()
        ).length,
      };

      // Crear gráficos
      this.createStatsChart();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudieron cargar los datos del dashboard',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  createStatsChart() {
    if (this.statsChart) {
      this.statsChart.destroy();
    }

    const ctx = document.getElementById('statsChart') as HTMLCanvasElement;
    this.statsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Estudiantes', 'Profesores', 'Administradores'],
        datasets: [
          {
            data: [
              this.userStats.students,
              this.userStats.teachers,
              this.userStats.admins,
            ],
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(75, 192, 192, 0.7)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)',
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
            text: 'Distribución de Usuarios',
          },
        },
      },
    });
  }

  navigateToUserManagement() {
    this.router.navigate(['/admin/user-management/list']);
  }

  navigateToCourseManagement() {
    // Implementar según necesidad
    console.log('Navegar a gestión de cursos');
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'No definida';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
