import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Assignment } from '../../../models/assignment.model';
import { User } from '../../../models/user.model';
import { AlertController, LoadingController } from '@ionic/angular';
import firebase from 'firebase/compat/app';

type FirestoreTimestampLike = {
  seconds: number;
  nanoseconds: number;
};

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.page.html',
  styleUrls: ['./task-list.page.scss'],
  standalone: false,
})
export class TaskListPage implements OnInit {
  currentUser: User | null = null;
  pendingAssignments: Assignment[] = [];
  upcomingDeadlines: Assignment[] = [];
  isLoading = false;
  selectedDate: string = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
  tasksOnSelectedDate: Assignment[] = [];


  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    await this.loadTasks();
  }

  async ionViewWillEnter() {
    await this.loadTasks();
  }

  async loadTasks(event?: any) {
    this.isLoading = true;
    let loading: HTMLIonLoadingElement | null = null;

    if (!event) {
      loading = await this.loadingCtrl.create({
        message: 'Cargando tareas...',
      });
      await loading.present();
    }

    try {
      this.currentUser = await this.authService.getCurrentUser();
      if (this.currentUser) {
        this.pendingAssignments = await this.taskService.getPendingAssignments(
          this.currentUser.id
        );
        this.upcomingDeadlines = await this.taskService.getUpcomingAssignments(
          this.currentUser.id
        );
      }
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudieron cargar las tareas.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isLoading = false;
      if (event) {
        event.target.complete();
      }
      if (loading) {
        loading.dismiss();
      }
    }
  }

  navigateToAssignment(assignmentId: string) {
    this.router.navigate(['/student/task-detail', assignmentId]);
  }

  onDateSelected(event: any) {
    this.selectedDate = event.detail.value?.split('T')[0];

    const selected = new Date(this.selectedDate);
    this.tasksOnSelectedDate = [...this.pendingAssignments, ...this.upcomingDeadlines].filter(
      (task) => {
        const taskDate = this.normalizeDate(task.fechaEntrega);
        return taskDate === this.selectedDate;
      }
    );
  }

  normalizeDate(date: any): string {
    let d: Date;

    if (date instanceof firebase.firestore.Timestamp) {
      d = date.toDate();
    } else if (typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000 + date.nanoseconds / 1e6);
    } else {
      d = new Date(date);
    }

    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }


  formatDate(
    date?: Date | string | firebase.firestore.Timestamp | FirestoreTimestampLike
  ): string {
    if (!date) return 'No definida';

    let jsDate: Date;
    if (date instanceof firebase.firestore.Timestamp) {
      jsDate = date.toDate();
    } else if (
      typeof date === 'object' &&
      'seconds' in date &&
      'nanoseconds' in date
    ) {
      const millis = date.seconds * 1000 + Math.floor(date.nanoseconds / 1e6);
      jsDate = new Date(millis);
    } else {
      jsDate = new Date(date as string | Date);
    }

    return isNaN(jsDate.getTime())
      ? 'No definida'
      : jsDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }

  getDaysLeft(date: any): string {
    if (!date) return '?';

    let dueDate: Date;

    try {
      if (date instanceof firebase.firestore.Timestamp) {
        dueDate = date.toDate();
      } else if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
        dueDate = new Date(date.seconds * 1000 + date.nanoseconds / 1e6);
      } else {
        dueDate = new Date(date);
      }

      if (isNaN(dueDate.getTime())) return '?';

      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'Vencida';
      if (diffDays === 0) return 'Hoy';
      return `${diffDays} días`;
    } catch (error) {
      console.warn('Fecha no válida:', date);
      return '?';
    }
  }


  getUrgencyClass(days: string): string {
    if (days === 'Vencida') return 'danger';
    if (days === 'Hoy') return 'warning';
    return 'success';
  }
}
