import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Assignment } from '../../../models/assignment.model';
import { Course } from '../../../models/course.model';
import { Submission } from '../../../models/submission.model';
import { TaskService } from '../../../services/task.service';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone: false,
})
export class TaskDetailPage implements OnInit {
  task: Assignment | null = null;
  course: Course | null = null;
  submission: Submission | null = null;
  isLoading = false;
  currentUserId: string = '';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private courseService: CourseService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.loadTaskDetail();
  }

  async loadTaskDetail() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Cargando tarea...' });
    await loading.present();

    try {
      const taskId = this.route.snapshot.paramMap.get('taskId');
      if (!taskId) throw new Error('ID de tarea no proporcionado.');

      this.currentUserId = (await this.authService.getCurrentUser())?.id || '';
      this.task = await this.taskService.getAssignmentById(taskId);

      if (this.task) {
        this.course = await this.courseService.getCourseById(this.task.courseId);
        const submissions = await this.taskService.getSubmissionsByAssignment(taskId);
        this.submission = submissions.find(s => s.studentId === this.currentUserId) || null;
      }
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo cargar la tarea.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  get canSubmit(): boolean {
    return !this.isSubmitted && !this.isDeadlinePassed;
  }

  get canModify(): boolean {
    return this.isSubmitted && !this.isDeadlinePassed;
  }


  formatDate(date: any): string {
    if (!date) return '';
    let d: Date;
    if (date instanceof firebase.firestore.Timestamp) {
      d = date.toDate();
    } else if (typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000 + date.nanoseconds / 1e6);
    } else {
      d = new Date(date);
    }
    return d.toLocaleDateString('es-EC', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  get isDeadlinePassed(): boolean {
    if (!this.task?.fechaEntrega) return false;

    const fecha = this.task.fechaEntrega;

    let deadline: Date;

    // Firebase Timestamp (con método toDate)
    if (typeof (fecha as any)?.toDate === 'function') {
      deadline = (fecha as any).toDate();
    }

    // Objeto con seconds y nanoseconds (pero sin método toDate)
    else if ('seconds' in fecha && 'nanoseconds' in fecha) {
      deadline = new Date(
        (fecha as any).seconds * 1000 + (fecha as any).nanoseconds / 1e6
      );
    }

    // Ya es un Date
    else if (fecha instanceof Date) {
      deadline = fecha;
    }

    // ISO String u otra forma
    else {
      deadline = new Date(fecha);
    }

    return deadline.getTime() < new Date().getTime();
  }


  get isSubmitted(): boolean {
    return !!this.submission;
  }

  get isEditable(): boolean {
    return this.isSubmitted && !this.isDeadlinePassed;
  }

  navigateToSubmit(isEditing = false) {
    this.router.navigate(['/student/task-submit', this.task?.id], {
      queryParams: { edit: isEditing ? '1' : '0' },
    });
  }
}
