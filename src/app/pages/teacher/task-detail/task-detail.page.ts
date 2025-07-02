import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import { Assignment } from 'src/app/models/assignment.model';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone: false,
})
export class TaskDetailPage implements OnInit {
  taskId: string = '';
  tarea: Assignment | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  async ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('taskId') || '';
    if (this.taskId) {
      await this.cargarTarea();
    }
  }

  async cargarTarea() {
    try {
      this.tarea = await this.taskService.getAssignmentById(this.taskId);
      if (!this.tarea) {
        console.warn('❌ No se encontró la tarea');
      }
    } catch (error) {
      console.error('Error al cargar la tarea:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async eliminarTarea() {
    const confirmacion = confirm('¿Estás seguro de eliminar esta tarea?');
    if (!confirmacion) return;

    try {
      await this.taskService.deleteAssignment(this.taskId); // Este método lo agregaremos abajo si no existe
      alert('✅ Tarea eliminada correctamente');
      this.router.navigate(['/teacher/dashboard']);
    } catch (error) {
      console.error('❌ Error al eliminar la tarea:', error);
      alert('Ocurrió un error al eliminar la tarea');
    }
  }
}
