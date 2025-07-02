export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'estudiante' | 'profesor' | 'admin';
  cursosInscritos?: string[]; // IDs de cursos (para estudiantes)
  cursosDictados?: string[]; // IDs de cursos (para profesores)
  fotoPerfil?: string;
  telefono?: string;
  bio?: string;
  createdAt: Date;
  lastLogin?: Date;
  active: boolean;

  progresoGlobal?: number; // % de progreso general
  promedioCalificaciones?: number; // Promedio de calificaciones
  tareasCompletadas?: number; // Conteo de tareas completadas
}

export type UserRole = User['rol'];
