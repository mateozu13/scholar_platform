import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Assignment } from 'src/app/models/assignment.model';

@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.page.html',
  styleUrls: ['./task-create.page.scss'],
  standalone: false,
})
export class TaskCreatePage implements OnInit {
  courseId: string = '';
  task = {
    titulo: '',
    descripcion: '',
    fechaEntrega: ''
  };
  assignments: Assignment[] = [];

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    this.cargarTareas();
  }

  async crearTarea() {
    if (!this.task.titulo || !this.task.fechaEntrega) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const newTask: Assignment = {
      id: firebase.firestore().collection('assignments').doc().id,
      courseId: this.courseId,
      titulo: this.task.titulo,
      descripcion: this.task.descripcion,
      fechaEntrega: new Date(this.task.fechaEntrega),
      createdAt: new Date(),
      submissions: [],
      status: 'draft'
    };

    try {
      await this.taskService.createAssignment(newTask);
      alert('✅ Tarea guardada correctamente');
      this.task = { titulo: '', descripcion: '', fechaEntrega: '' };
      this.cargarTareas();  // 🔁 Recargar la lista después de guardar
    } catch (error) {
      console.error('❌ Error al guardar tarea:', error);
      alert('Ocurrió un error al guardar la tarea');
    }
  }

  async cargarTareas() {
    try {
      const snapshot = await firebase.firestore()
        .collection('assignments')
        .where('courseId', '==', this.courseId)
        .orderBy('fechaEntrega')
        .get();

      this.assignments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Assignment)
      }));
    } catch (error) {
      console.error('❌ Error al cargar tareas:', error);
    }
  }





  
  async eliminarTarea(taskId: string) {
    const confirmar = confirm('¿Seguro que deseas eliminar esta tarea?');
    if (!confirmar) return;

    try {
      await firebase.firestore().collection('assignments').doc(taskId).delete();
      this.assignments = this.assignments.filter(t => t.id !== taskId);
      alert('🗑️ Tarea eliminada');
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  }
}
