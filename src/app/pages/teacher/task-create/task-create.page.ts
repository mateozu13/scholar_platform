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

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
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
    } catch (error) {
      console.error('❌ Error al guardar tarea:', error);
      alert('Ocurrió un error al guardar la tarea');
    }
  }
}
