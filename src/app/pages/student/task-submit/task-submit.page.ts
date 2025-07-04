import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Submission } from '../../../models/submission.model';
import { Assignment } from '../../../models/assignment.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-task-submit',
  templateUrl: './task-submit.page.html',
  styleUrls: ['./task-submit.page.scss'],
  standalone: false,
})
export class TaskSubmitPage implements OnInit {
  assignmentId: string = '';
  assignment: Assignment | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private taskService: TaskService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.assignmentId = this.route.snapshot.paramMap.get('taskId') || '';
    this.assignment = await this.taskService.getAssignmentById(this.assignmentId);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  clearFile() {
    this.selectedFile = null;
  }

  cancel() {
    this.router.navigate(['/student/task-detail', this.assignmentId]);
  }

  async submitTask() {
    if (!this.selectedFile) {
      const alert = await this.alertCtrl.create({
        header: 'Archivo requerido',
        message: 'Por favor selecciona un archivo para enviar.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({ message: 'Enviando tarea...' });
    await loading.present();

    try {
      const user = await this.authService.getCurrentUser();
      const fileURL = await this.storageService.uploadFile(this.selectedFile, `submissions/${this.assignmentId}`);

      const submission: Submission = {
        id: uuidv4(),
        assignmentId: this.assignmentId,
        studentId: user.id,
        archivoURL: fileURL,
        fechaEnvio: new Date(),
      };

      await this.taskService.submitAssignment(submission);

      const success = await this.alertCtrl.create({
        header: 'Tarea enviada',
        message: 'Tu tarea ha sido enviada correctamente.',
        buttons: ['OK'],
      });
      await success.present();

      this.router.navigate(['/student/task-detail', this.assignmentId]);
    } catch (error) {
      const errorAlert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Ocurrió un error al enviar la tarea. Intenta nuevamente.',
        buttons: ['OK'],
      });
      await errorAlert.present();
    } finally {
      this.isSubmitting = false;
      await loading.dismiss();
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    if (date.toDate) return date.toDate().toLocaleString('es-EC');
    return new Date(date).toLocaleString('es-EC');
  }
}
