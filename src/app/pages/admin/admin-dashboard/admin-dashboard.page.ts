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
  featuredCourses: Course[] = [];
  userStats: any = {};
  platformStats: any = {};
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

      // Ordenar usuarios por fecha de creación (más recientes primero)
      this.recentUsers = [...allUsers]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      this.userStats = {
        students: allUsers.filter((u) => u.rol === 'estudiante').length,
        teachers: allUsers.filter((u) => u.rol === 'profesor').length,
        admins: allUsers.filter((u) => u.rol === 'admin').length,
      };

      // Obtener estadísticas de cursos
      const allCourses = await this.courseService.getAllCourses();
      this.totalCourses = allCourses.length;

      // Obtener nombres de profesores para los cursos destacados
      const featuredCoursesWithTeachers = await Promise.all(
        allCourses.slice(0, 3).map(async (course) => {
          const teacher = await this.userService.getUserById(course.profesorId);
          return {
            ...course,
            profesorNombre: teacher?.nombre || 'Desconocido',
          };
        })
      );

      this.featuredCourses = featuredCoursesWithTeachers;

      // Estadísticas de plataforma (simuladas)
      this.platformStats = {
        activeCourses: allCourses.filter(
          (c) => new Date(c.fechaFin || 0) > new Date()
        ).length,
        pendingTasks: 24, // Valor simulado
        unreadMessages: 8, // Valor simulado
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
              'rgba(255, 159, 64, 0.7)',
              'rgba(75, 192, 192, 0.7)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 159, 64, 1)',
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
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage = Math.round((+value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  navigateToUserManagement() {
    this.router.navigate(['/admin/user-management/list']);
  }

  navigateToProfile() {
    this.router.navigate(['/admin/profile']);
  }

  navigateToPlatformStats() {
    // Implementar según necesidad
    console.log('Navegar a estadísticas de plataforma');
  }

  viewUserDetails(userId: string) {
    this.router.navigate(['/admin/user-management/edit', userId]);
  }

  viewCourseDetails(courseId: string) {
    // Implementar según necesidad
    console.log('Ver detalles del curso', courseId);
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

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin':
        return 'success';
      case 'profesor':
        return 'warning';
      case 'estudiante':
        return 'primary';
      default:
        return 'medium';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'profesor':
        return 'Profesor';
      case 'estudiante':
        return 'Estudiante';
      default:
        return role;
    }
  }
}
